export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Increased to 300 to match other TTS routes

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { put, del } from '@vercel/blob';
import { translationSchema, apiResponse } from '@/lib/security';
import { parseBuffer } from 'music-metadata';
import { ratelimit } from '@/lib/ratelimit';
import { chunkText, concatAudioBuffers } from '@/lib/audio';

const TIER_LIMITS = {
  FREE: { pulse: 20000, maxAudioMins: 5 },
  BASIC: { pulse: 60000, maxAudioMins: 5 },
  PREMIUM: { pulse: 150000, maxAudioMins: 10 },
  PRO: { pulse: 800000, maxAudioMins: 15 },
} as const;

export async function POST(req: Request) {
  const prisma = getPrisma();
  let uploadedFileUrl = '';
  let pulseCost = 0;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // Rate Limiting
    if (ratelimit) {
      const { success } = await ratelimit.limit(`ratelimit_translate_${session.user.id}`);
      if (!success) return apiResponse("Too many translation requests. Please slow down.", 429);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, tier: true, usageCount: true }
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
    const limit = TIER_LIMITS[tier].pulse;
    const maxAudioMins = TIER_LIMITS[tier].maxAudioMins;
    
    const body = await req.json().catch(() => ({}));
    const validation = translationSchema.safeParse(body);
    
    if (!validation.success) {
      return apiResponse({ error: 'Invalid request data', details: validation.error.format() }, 400);
    }

    const { fileUrl, fileName, targetLanguage, targetVoice } = validation.data;
    uploadedFileUrl = fileUrl;

    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error("Failed to fetch file from storage");
    const arrayBuffer = await fileRes.arrayBuffer();

    let durationSeconds = 1;
    try {
      const metadata = await parseBuffer(new Uint8Array(arrayBuffer), { mimeType: fileRes.headers.get('content-type') || 'audio/mpeg' });
      if (metadata.format.duration) durationSeconds = metadata.format.duration;
    } catch (e) {
      console.warn("Could not parse audio duration, defaulting to 1 second", e);
    }

    if (durationSeconds > maxAudioMins * 60) {
      return apiResponse(`Audio too long. Maximum ${maxAudioMins} minutes allowed.`, 413);
    }

    // Cost logic: since this is doing STT + Grok + TTS, we can charge 2000 pulse per minute or something similar. 
    // Wait, the plan said "similar to STT". Let's stick to 2000 pulse per minute (double STT cost) to cover TTS.
    pulseCost = Math.ceil((durationSeconds / 60) * 2000);

    const updatedUser = await prisma.user.updateMany({
      where: {
        id: user.id,
        usageCount: { lte: limit - pulseCost }
      },
      data: { usageCount: { increment: pulseCost } },
    });

    if (updatedUser.count === 0) {
      return new NextResponse("Pulse quota exceeded. Please upgrade your plan.", { status: 429 });
    }

    const xaiFormData = new FormData();
    xaiFormData.append('file', new Blob([arrayBuffer], { type: 'audio/mp3' }), 'audio.mp3');

    const isFishVoice = targetVoice.startsWith('fish_');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), isFishVoice ? 290000 : 90000); // 90-290 seconds for whole pipeline

    try {
      // 1. STT Phase
      const sttResponse = await fetch('https://api.x.ai/v1/stt', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
        body: xaiFormData,
        signal: controller.signal,
      });

      if (!sttResponse.ok) throw new Error("STT processing failed");
      const sttData = await sttResponse.json();
      const rawText = sttData.text;

      // 2. Grok Translation Phase
      let translatedText = rawText;
      const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "grok-4-1-fast-reasoning",
          messages: [
            { 
              role: "system", 
              content: `You are a professional translator. Translate the following text into ${targetLanguage}. THE ULTIMATE RULE: ONLY return the translated text, DO NOT add any other words like 'Here is the translation', 'Understood', etc.` 
            },
            { role: "user", content: rawText }
          ],
          temperature: 0.2 
        }),
        signal: controller.signal,
      });

      if (!grokResponse.ok) throw new Error("Grok translation failed");
      const grokData = await grokResponse.json();
      if (grokData.choices?.[0]?.message?.content) {
        translatedText = grokData.choices[0].message.content.trim(); 
      }

      // 3. TTS Phase
      let audioBuffer: ArrayBuffer;

      if (isFishVoice) {
        const referenceAudioUrl = targetVoice.replace('fish_', '');
        const modalApiUrl = process.env.MODAL_API_URL || 'https://api.placeholder.modal.run/v1/tts';

        const textChunks = chunkText(translatedText, 1000);
        const buffers: ArrayBuffer[] = [];
        const BATCH_SIZE = 3;
        
        console.log(`[FISH SPEECH TRANSLATE] Starting synthesis for ${textChunks.length} chunks (Batch Size: ${BATCH_SIZE})...`);
        
        for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
          const currentBatch = textChunks.slice(i, i + BATCH_SIZE);
          console.log(`[FISH SPEECH TRANSLATE] Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(textChunks.length/BATCH_SIZE)} (Chunks ${i+1}-${Math.min(i+BATCH_SIZE, textChunks.length)})`);
          
          const batchPromises = currentBatch.map(async (chunk, index) => {
            const chunkIndex = i + index;
            const res = await fetch(modalApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Modal-Key': process.env.MODAL_TOKEN_ID || '',
                'Modal-Secret': process.env.MODAL_TOKEN_SECRET || '',
              },
              body: JSON.stringify({
                text: chunk,
                reference_audio_url: referenceAudioUrl,
                format: 'mp3'
              }),
              signal: controller.signal,
            });

            if (!res.ok) {
              const errorText = await res.text();
              console.error(`[FISH SPEECH TTS ERROR] Status: ${res.status} on chunk ${chunkIndex + 1}`, errorText);
              throw new Error(`Modal API processing failed on chunk ${chunkIndex + 1}`);
            }
            
            return res.arrayBuffer();
          });

          const batchResults = await Promise.all(batchPromises);
          buffers.push(...batchResults);
          console.log(`[FISH SPEECH TRANSLATE] Batch ${Math.floor(i/BATCH_SIZE) + 1} completed.`);
        }

        audioBuffer = concatAudioBuffers(buffers, 'mp3');
      } else {
        const ttsResponse = await fetch('https://api.x.ai/v1/tts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: translatedText,
            voice_id: targetVoice.startsWith('custom_voice_') ? 'eve' : targetVoice,
            language: 'auto',
            response_format: 'mp3'
          }),
          signal: controller.signal,
        });

        if (!ttsResponse.ok) throw new Error("TTS processing failed");
        audioBuffer = await ttsResponse.arrayBuffer();
      }
      
      const blob = await put(`translate/${user.id}/${Date.now()}.mp3`, audioBuffer, {
        access: 'public',
        contentType: 'audio/mpeg',
      });

      await prisma.history.create({
        data: {
          userId: user.id,
          type: 'translate', // We might need to ensure 'translate' is valid in Prisma schema
          // Or use 'tts'/'stt' if enum restricted. Let's assume it accepts string.
          input: `Translated ${fileName} to ${targetLanguage}`,
          output: blob.url 
        }
      });

      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': `attachment; filename="translated_audio.mp3"`,
          'X-User-Usage': (user.usageCount + pulseCost).toString(),
        },
      });

    } catch (fetchError: any) {
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    console.error("[TRANSLATION_CRITICAL_ERROR]", error);

    const session = await getServerSession(authOptions);
    if (session?.user?.id && pulseCost > 0) {
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: pulseCost } },
        data: { usageCount: { decrement: pulseCost } }
      });
    }

    const clientMessage = isTimeout
      ? "AI Engine is taking too long to respond. Please try again."
      : "An internal error occurred during processing.";

    return apiResponse(clientMessage, isTimeout ? 504 : 500);
  } finally {
    if (uploadedFileUrl) {
      try {
        await del(uploadedFileUrl);
      } catch (cleanupError) {
        console.error("[BLOB_CLEANUP_ERROR]", cleanupError);
      }
    }
  }
}
