export const dynamic = 'force-dynamic';
export const maxDuration = 60;
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { del } from '@vercel/blob';
import { speechToTextSchema, apiResponse } from '@/lib/security';
import { parseBuffer } from 'music-metadata';
import { ratelimit } from '@/lib/ratelimit';

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

    // Rate Limiting (consistent with TTS and Voice Changer)
    if (ratelimit) {
      const { success } = await ratelimit.limit(`ratelimit_stt_${session.user.id}`);
      if (!success) return apiResponse("Too many transcription requests. Please slow down.", 429);
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
    const validation = speechToTextSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse({ error: 'Invalid request data', details: validation.error.format() }, 400);
    }

    const { fileUrl, fileName } = validation.data;
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

    pulseCost = Math.ceil((durationSeconds / 60) * 1000);

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('https://api.x.ai/v1/stt', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
        body: xaiFormData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[X.AI STT ERROR] Status: ${response.status}`, errorText);
        throw new Error("External API processing failed");
      }

      const data = await response.json();
      let finalText = data.text;

      try {
        const formatResponse = await fetch('https://api.x.ai/v1/chat/completions', {
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
                content: "You are a professional editor. Take the raw text, add punctuation, capitalize proper nouns, and create line breaks for paragraphs. THE ULTIMATE RULE: ONLY return the formatted text, DO NOT add any other words like 'Here is...', 'Understood', etc."
              },
              { role: "user", content: finalText }
            ],
            temperature: 0.1
          })
        });

        if (formatResponse.ok) {
          const formatData = await formatResponse.json();
          if (formatData.choices?.[0]?.message?.content) {
            finalText = formatData.choices[0].message.content.trim();
          }
        } else {
          const errLog = await formatResponse.text();
          console.error("[FORMAT_TEXT_ERROR] API Grok failed:", errLog);
        }
      } catch (formatErr) {
        console.error("[FORMAT_TEXT_ERROR] Exception caught:", formatErr);
      }

      await prisma.history.create({
        data: {
          userId: user.id,
          type: 'stt',
          input: fileName,
          output: finalText
        }
      });

      return NextResponse.json({ text: finalText }, {
        headers: { 'X-User-Usage': (user.usageCount + 1).toString() },
      });

    } catch (fetchError: any) {
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    console.error("[STT_CRITICAL_ERROR]", error);

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