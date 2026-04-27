export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';

const TIER_LIMITS = {
  FREE: { generations: 5, maxFileMB: 50 },
  BASIC: { generations: 20, maxFileMB: 300 },
  PREMIUM: { generations: 100, maxFileMB: 500 },
  PRO: { generations: 300, maxFileMB: 50 },
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
    const file = formData.get('file') as File | null;
    if (!file) return new NextResponse("No audio file provided", { status: 400 });

    const maxFileSize = TIER_LIMITS[tier].maxFileMB * 1024 * 1024;
    if (file.size > maxFileSize) {
      return new NextResponse(`File too large. Maximum ${TIER_LIMITS[tier].maxFileMB} MB allowed for your plan.`, { status: 413 });
    }

    const xaiFormData = new FormData();
    xaiFormData.append('file', file, file.name || 'audio.mp3');

    const response = await fetch('https://api.x.ai/v1/stt', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
      body: xaiFormData,
    });

    if (!response.ok) throw new Error(`Grok STT failed: ${await response.text()}`);

    const data = await response.json();

    await prisma.user.update({
      where: { id: user.id },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json({ text: data.text }, {
      headers: { 'X-User-Usage': (user.usageCount + 1).toString() },
    });

  } catch (error: any) {
    console.error("STT Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}