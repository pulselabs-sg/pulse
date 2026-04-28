export const maxDuration = 120; 
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

const TIER_LIMITS = {
  FREE: { generations: 5, maxFileMB: 50 },
  BASIC: { generations: 20, maxFileMB: 300 },
  PREMIUM: { generations: 100, maxFileMB: 500 },
  PRO: { generations: 300, maxFileMB: 500 },
} as const;

export async function POST(req: Request) {
  const prisma = getPrisma();
  let uploadedFileUrl = '';

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, tier: true, usageCount: true }
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
    const limit = tier === 'PREMIUM' || tier === 'PRO' ? Infinity : TIER_LIMITS[tier].generations;

    const body = await req.json();
    // Lấy thêm fileName
    const { fileUrl, fileName = 'Uploaded Audio', targetVoice = 'eve', format = 'mp3' } = body;

    if (!fileUrl) {
      return new NextResponse("No file URL provided", { status: 400 });
    }
    uploadedFileUrl = fileUrl;

    if (limit !== Infinity) {
      const updatedUser = await prisma.user.updateMany({
        where: {
          id: user.id,
          usageCount: { lt: limit }
        },
        data: { usageCount: { increment: 1 } },
      });

      if (updatedUser.count === 0) {
        return new NextResponse("Quota exceeded. Please upgrade your plan.", { status: 429 });
      }
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error("Failed to fetch file from storage");
    const fileBlob = await fileRes.blob();

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

    const controllerTTS = new AbortController();
    const timeoutTTS = setTimeout(() => controllerTTS.abort(), 120000); 

    try {
      const ttsResponse = await fetch('https://api.x.ai/v1/tts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: transcribedText,
          voice_id: targetVoice,
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

      const audioBuffer = await ttsResponse.arrayBuffer();

      // --- VOICE CHANGER ---
      await prisma.history.create({
        data: {
          userId: user.id,
          type: 'Voice Changer',
          input: fileName,
          output: `Audio Rendered (${targetVoice.toUpperCase()})`
        }
      });

      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': format === 'wav' ? 'audio/wav' : 'audio/mpeg',
          'Content-Disposition': `attachment; filename="voice_changed_${targetVoice}.${format}"`,
          'X-User-Usage': (user.usageCount + 1).toString(),
        },
      });
    } finally {
      clearTimeout(timeoutTTS);
    }

  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    console.error("[VOICE_CHANGER_CRITICAL_ERROR]", error);

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
       await prisma.user.updateMany({
         where: { id: session.user.id, usageCount: { gt: 0 } },
         data: { usageCount: { decrement: 1 } }
       });
    }

    const clientMessage = isTimeout
      ? "AI Engine is taking too long to respond. Please try again."
      : "An internal error occurred during processing.";

    return new NextResponse(clientMessage, { status: isTimeout ? 504 : 500 });
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