export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { textToSpeechSchema, apiResponse } from '@/lib/security';

const TIER_LIMITS = {
  FREE: { pulse: 20000, maxTTSChars: 5000 },
  BASIC: { pulse: 60000, maxTTSChars: 5000 },
  PREMIUM: { pulse: 150000, maxTTSChars: 10000 },
  PRO: { pulse: 800000, maxTTSChars: 15000 },
} as const;

export async function POST(req: Request) {
  const prisma = getPrisma();
  let pulseCost = 0;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, tier: true, usageCount: true }
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const body = await req.json().catch(() => ({}));
    const validation = textToSpeechSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse({ error: 'Invalid request data', details: validation.error.format() }, 400);
    }

    const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
    const { text, voiceId, format } = validation.data;
    const limit = TIER_LIMITS[tier].pulse;
    const maxChars = TIER_LIMITS[tier].maxTTSChars;

    if (text.length > maxChars) {
      return apiResponse(`Text too long. Maximum ${maxChars} characters allowed.`, 413);
    }

    pulseCost = text.length;

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

    const isFishVoice = voiceId.startsWith('fish_');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), isFishVoice ? 120000 : 30000); // Longer timeout for Modal cold starts

    try {
      let response: Response;

      if (isFishVoice) {
        const referenceAudioUrl = voiceId.replace('fish_', '');
        const modalApiUrl = process.env.MODAL_API_URL || 'https://api.placeholder.modal.run/v1/tts';

        response = await fetch(modalApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            reference_audio_url: referenceAudioUrl,
            format
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[FISH SPEECH TTS ERROR] Status: ${response.status}`, errorText);
          throw new Error("Modal API processing failed");
        }
      } else {
        response = await fetch('https://api.x.ai/v1/tts', {
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

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[X.AI TTS ERROR] Status: ${response.status}`, errorText);
          throw new Error("External API processing failed");
        }
      }

      const audioBuffer = await response.arrayBuffer();

      const blob = await put(`tts/${user.id}/${Date.now()}.${format}`, audioBuffer, {
        access: 'public',
        contentType: format === 'wav' ? 'audio/wav' : 'audio/mpeg',
      });

      // --- TTS ---
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
      ? "AI Engine is taking too long to respond. Please try again."
      : "An internal error occurred during processing.";

    return apiResponse(clientMessage, isTimeout ? 504 : 500);
  }
}