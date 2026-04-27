export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';

const TIER_LIMITS = {
  FREE: { generations: 5, maxChars: 5000 },
  BASIC: { generations: 20, maxChars: 10000 },
  PREMIUM: { generations: 100, maxChars: 15000 },
  PRO: { generations: 300, maxChars: 5000 },
} as const;

export async function POST(req: Request) {
  const prisma = getPrisma();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
    const limit = tier === 'PREMIUM' || tier === 'PRO' ? Infinity : TIER_LIMITS[tier].generations;

    if (user.usageCount >= limit) {
      return new NextResponse("Quota exceeded. Please upgrade your plan.", { status: 429 });
    }

    const formData = await req.formData();
    const text = formData.get('text') as string;
    const voiceId = formData.get('voiceId') as string || 'eve';

    if (!text) return new NextResponse("Text is required", { status: 400 });

    const maxChars = TIER_LIMITS[tier].maxChars;
    if (text.length > maxChars) {
      return new NextResponse(`Text too long. Maximum ${maxChars} characters allowed for your plan.`, { status: 400 });
    }

    const response = await fetch('https://api.x.ai/v1/tts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voice_id: voiceId, language: 'auto' }),
    });

    if (!response.ok) throw new Error(`Grok TTS failed: ${await response.text()}`);

    const audioBuffer = await response.arrayBuffer();

    await prisma.user.update({
      where: { id: user.id },
      data: { usageCount: { increment: 1 } },
    });

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="voice.mp3"',
        'X-User-Usage': (user.usageCount + 1).toString(),
      },
    });

  } catch (error: any) {
    console.error("TTS Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}