export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { textToSpeechSchema, apiResponse, validateCredits, CREDIT_COSTS, TIER_LIMITS } from '@/lib/security';
import { ratelimit } from '@/lib/ratelimit';
import { chunkText, concatAudioBuffers } from '@/lib/audio';

export async function POST(req: Request) {
  const prisma = getPrisma();
  let pulseCost = 0;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    if (ratelimit) {
      const { success } = await ratelimit.limit(`ratelimit_tts_${session.user.id}`);
      if (!success) return apiResponse("Too many synthesis requests. Please slow down.", 429);
    }

    const body = await req.json().catch(() => ({}));
    const validation = textToSpeechSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse({ error: 'Invalid request data', details: validation.error.format() }, 400);
    }

    const { text, voiceId, format } = validation.data;
    pulseCost = text.length * CREDIT_COSTS.TTS_PER_CHAR;

    const validationCredit = await validateCredits(session.user.id, pulseCost);
    if (validationCredit.error || !validationCredit.data) {
      return apiResponse(validationCredit.error || "Credit validation failed", validationCredit.status || 400);
    }

    const { user, limit } = validationCredit.data;
    const tier = validationCredit.data.tier;
    const maxChars = TIER_LIMITS[tier].maxTTSChars;

    if (text.length > maxChars) {
      return apiResponse(`Text too long. Maximum ${maxChars} characters allowed.`, 413);
    }

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

    const isFishVoice = voiceId.startsWith('fish_');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), isFishVoice ? 290000 : 30000);

    try {
      let audioBuffer: ArrayBuffer;

      if (isFishVoice) {
        const referenceAudioUrl = voiceId.replace('fish_', '');
        const modalApiUrl = process.env.MODAL_API_URL || 'https://api.placeholder.modal.run/v1/tts';

        const textChunks = chunkText(text, 300);
        const buffers: ArrayBuffer[] = new Array(textChunks.length);

        const MAX_CONCURRENT_REQUESTS = 6;
        let currentIndex = 0;

        const processChunk = async (chunk: string, index: number) => {
          let retries = 2;
          while (retries >= 0) {
            try {
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
                signal: controller.signal,
              });

              if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Status ${res.status}: ${errorText}`);
              }
              return await res.arrayBuffer();
            } catch (err: any) {
              if (retries === 0 || err.name === 'AbortError') {
                console.error(`[FISH SPEECH ERROR] Chunk ${index} failed permanently:`, err);
                throw err;
              }
              console.warn(`[TTS RETRY] Network error, trying chunk ${index} again... (Left ${retries} retries)`);
              await new Promise(r => setTimeout(r, 2000));
              retries--;
            }
          }
        };

        const worker = async () => {
          while (currentIndex < textChunks.length) {
            const index = currentIndex++;
            const chunk = textChunks[index];
            buffers[index] = await processChunk(chunk, index) as ArrayBuffer;
          }
        };

        const workers = Array(Math.min(MAX_CONCURRENT_REQUESTS, textChunks.length))
          .fill(null)
          .map(() => worker());
        await Promise.all(workers);
        audioBuffer = concatAudioBuffers(buffers, format);
      } else {
        const response = await fetch('https://api.x.ai/v1/tts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice_id: voiceId.startsWith('custom_voice_') ? 'eve' : voiceId,
            language: 'auto',
            response_format: format
          }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("External API processing failed");
        audioBuffer = await response.arrayBuffer();
      }

      const blob = await put(`tts/${user.id}/${Date.now()}.${format}`, audioBuffer, {
        access: 'public',
        contentType: format === 'wav' ? 'audio/wav' : 'audio/mpeg',
      });

      await prisma.history.create({
        data: {
          userId: user.id,
          type: 'tts',
          input: text.length > 80 ? text.substring(0, 80) + '...' : text,
          output: blob.url
        }
      });

      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': format === 'wav' ? 'audio/wav' : 'audio/mpeg',
          'Content-Disposition': `attachment; filename="voice.${format}"`,
          'X-User-Usage': (user.usageCount + 1).toString(),
        },
      });

    } catch (fetchError: any) {
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    console.error("[TTS_CRITICAL_ERROR]", error);

    const session = await getServerSession(authOptions);
    if (session?.user?.id && pulseCost > 0) {
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: pulseCost } },
        data: { usageCount: { decrement: pulseCost } }
      });
    }

    const clientMessage = isTimeout
      ? "The AI server is busy or the text is too long. Please try again later."
      : "An error occurred during audio processing.";

    return apiResponse(clientMessage, isTimeout ? 504 : 500);
  }
} 