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

    // ── Custom voice (Fish Speech) temporarily disabled ──────────────────────
    // const isFishVoice = voiceId.startsWith('fish_');
    // All requests now route through xAI Grok TTS only.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      let audioBuffer: ArrayBuffer;

      // ── TEMPORARILY COMMENTED OUT: Fish Speech / Custom Voice pipeline ──
      // if (voiceId.startsWith('fish_')) {
      //   const referenceAudioUrl = voiceId.replace('fish_', '');
      //   const modalApiUrl = process.env.MODAL_API_URL || 'https://api.placeholder.modal.run/v1/tts';
      //   const textChunks = chunkText(text, 900);
      //   const buffers: ArrayBuffer[] = new Array(textChunks.length);
      //   const MAX_CONCURRENT_REQUESTS = 5;
      //   let currentIndex = 0;
      //   const processChunk = async (chunk: string, index: number) => { ... };
      //   const worker = async () => { ... };
      //   const workers = Array(Math.min(MAX_CONCURRENT_REQUESTS, textChunks.length)).fill(null).map(() => worker());
      //   await Promise.all(workers);
      //   audioBuffer = concatAudioBuffers(buffers, format);
      // } else {

      const response = await fetch('https://api.x.ai/v1/tts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          language: 'auto',
          response_format: format
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("External API processing failed");
      audioBuffer = await response.arrayBuffer();

      // ── END of temporarily commented Fish Speech block ──

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