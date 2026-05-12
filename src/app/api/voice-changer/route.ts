export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { del, put } from '@vercel/blob';
import { voiceChangerSchema, apiResponse, validateCredits, CREDIT_COSTS, TIER_LIMITS } from '@/lib/security';
import { parseBuffer } from 'music-metadata';
import { ratelimit } from '@/lib/ratelimit';
import { chunkText, concatAudioBuffers } from '@/lib/audio';


export async function POST(req: Request) {
  const prisma = getPrisma();
  let uploadedFileUrl = '';
  let pulseCost = 0;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Rate Limiting (Specific for Voice Changer: 10 per minute)
    if (ratelimit) {
      const { success } = await ratelimit.limit(`ratelimit_vc_${session.user.id}`);
      if (!success) return apiResponse("Too many voice change requests. Please slow down.", 429);
    }

    const body = await req.json().catch(() => ({}));
    const validation = voiceChangerSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse({ error: 'Invalid request data', details: validation.error.format() }, 400);
    }

    const { fileUrl, fileName, targetVoice, format } = validation.data;
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

    pulseCost = Math.ceil((durationSeconds / 60) * CREDIT_COSTS.VOICE_CHANGER_PER_MIN);

    const validationCredit = await validateCredits(session.user.id, pulseCost);
    if (validationCredit.error || !validationCredit.data) {
      return apiResponse(validationCredit.error || "Credit validation failed", validationCredit.status || 400);
    }

    const { user, limit } = validationCredit.data;
    const tier = validationCredit.data.tier;
    const maxAudioMins = TIER_LIMITS[tier].maxAudioMins;

    if (durationSeconds > maxAudioMins * 60) {
      return apiResponse(`Audio too long. Maximum ${maxAudioMins} minutes allowed.`, 413);
    }

    // 3. Deduct Credits Atomically
    const updatedUser = await prisma.user.updateMany({
      where: {
        id: user.id,
        usageCount: { lte: limit - pulseCost }
      },
      data: { usageCount: { increment: pulseCost } },
    });

    if (updatedUser.count === 0) {
      return apiResponse("Pulse quota exceeded. Please upgrade your plan.", 429);
    }

    const fileBlob = new Blob([arrayBuffer], { type: 'audio/mp3' });

    let transcribedText = '';

    const controllerSTT = new AbortController();
    const timeoutSTT = setTimeout(() => controllerSTT.abort(), 120000);

    try {
      const sttFormData = new FormData();
      sttFormData.append('file', fileBlob, 'input_audio.mp3');

      const sttResponse = await fetch('https://api.x.ai/v1/stt', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
        body: sttFormData,
        signal: controllerSTT.signal,
      });

      if (!sttResponse.ok) {
        const errorText = await sttResponse.text();
        console.error(`[X.AI VC-STT ERROR] Status: ${sttResponse.status}`, errorText);
        throw new Error("STT Phase failed");
      }

      const sttData = await sttResponse.json();
      transcribedText = sttData.text;

      if (!transcribedText || transcribedText.trim() === '') {
        throw new Error("Empty transcription result");
      }
    } finally {
      clearTimeout(timeoutSTT);
    }

    const isFishVoice = targetVoice.startsWith('fish_');
    const controllerTTS = new AbortController();
    const timeoutTTS = setTimeout(() => controllerTTS.abort(), isFishVoice ? 290000 : 120000);

    try {
      let audioBuffer: ArrayBuffer;

      if (isFishVoice) {
        const referenceAudioUrl = targetVoice.replace('fish_', '');
        const modalApiUrl = process.env.MODAL_API_URL || 'https://api.placeholder.modal.run/v1/tts';

        const textChunks = chunkText(transcribedText, 300);

        const chunkPromises = textChunks.map(async (chunk) => {
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
              format
            }),
            signal: controllerTTS.signal,
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error(`[FISH SPEECH VC-TTS ERROR] Status: ${res.status}`, errorText);
            throw new Error("Modal TTS Phase failed");
          }
          return res.arrayBuffer();
        });

        const buffers = await Promise.all(chunkPromises);
        audioBuffer = concatAudioBuffers(buffers, format);
      } else {
        const ttsResponse = await fetch('https://api.x.ai/v1/tts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: transcribedText,
            voice_id: targetVoice.startsWith('custom_voice_') ? 'eve' : targetVoice,
            language: 'auto',
            response_format: format
          }),
          signal: controllerTTS.signal,
        });

        if (!ttsResponse.ok) {
          const errorText = await ttsResponse.text();
          console.error(`[X.AI VC-TTS ERROR] Status: ${ttsResponse.status}`, errorText);
          throw new Error("TTS Phase failed");
        }
        audioBuffer = await ttsResponse.arrayBuffer();
      }

      const blob = await put(`changer/${user.id}/${Date.now()}.${format}`, audioBuffer, {
        access: 'public',
        contentType: format === 'wav' ? 'audio/wav' : 'audio/mpeg',
      });

      // --- VOICE CHANGER ---
      await prisma.history.create({
        data: {
          userId: user.id,
          type: 'changer',
          input: fileName,
          output: blob.url
        }
      });

      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': format === 'wav' ? 'audio/wav' : 'audio/mpeg',
          'Content-Disposition': `attachment; filename="voice_changed_${targetVoice}.${format}"`,
          'X-User-Usage': (user.usageCount + pulseCost).toString(),
        },
      });
    } finally {
      clearTimeout(timeoutTTS);
    }

  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    console.error("[VOICE_CHANGER_CRITICAL_ERROR]", error);

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