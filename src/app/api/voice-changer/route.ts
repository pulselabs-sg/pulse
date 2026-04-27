export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';

const TIER_LIMITS = {
  FREE: { generations: 5, maxFileMB: 50 },
  BASIC: { generations: 20, maxFileMB: 300 },
  PREMIUM: { generations: 100, maxFileMB: 500 },
  PRO: { generations: 300, maxFileMB: 500 },
} as const;

export async function POST(req: Request) {
  const prisma = getPrisma();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
    const limit = TIER_LIMITS[tier].generations;

    if (user.usageCount >= limit) {
      return new NextResponse("Quota exceeded. Please upgrade your plan.", { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const targetVoice = formData.get('targetVoice') as string || 'eve';
    const format = formData.get('format') as string || 'mp3';

    if (!file) return new NextResponse("No file provided", { status: 400 });

    const maxFileSize = TIER_LIMITS[tier].maxFileMB * 1024 * 1024;
    if (file.size > maxFileSize) {
      return new NextResponse(`File too large. Maximum ${TIER_LIMITS[tier].maxFileMB} MB allowed for your plan.`, { status: 413 });
    }

    // 1. STT 
    const sttFormData = new FormData();
    sttFormData.append('file', file, file.name || 'input_audio.mp3');
    const sttResponse = await fetch('https://api.x.ai/v1/stt', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
      body: sttFormData,
    });
    if (!sttResponse.ok) throw new Error(`STT failed: ${await sttResponse.text()}`);
    const { text: transcribedText } = await sttResponse.json();

    // 2. TTS
    const ttsResponse = await fetch('https://api.x.ai/v1/tts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: transcribedText, 
        voice_id: targetVoice, 
        language: 'auto',
        response_format: format 
      }),
    });
    if (!ttsResponse.ok) throw new Error(`TTS failed: ${await ttsResponse.text()}`);

    const audioBuffer = await ttsResponse.arrayBuffer();

    await prisma.user.update({
      where: { id: user.id },
      data: { usageCount: { increment: 1 } },
    });

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': format === 'wav' ? 'audio/wav' : 'audio/mpeg',
        'Content-Disposition': `attachment; filename="voice_changed_${targetVoice}.${format}"`,
        'X-User-Usage': (user.usageCount + 1).toString(),
      },
    });

  } catch (error: any) {
    console.error("Voice Changer Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}