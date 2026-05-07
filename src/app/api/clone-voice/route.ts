import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { cloneVoiceSchema, apiResponse } from '@/lib/security';

export async function POST(req: Request) {
  const prisma = getPrisma();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, tier: true }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Restrict free tier
    if (user.tier === 'FREE') {
      return apiResponse("Clone Voice feature is only available on Basic, Premium, and Pro plans.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const validation = cloneVoiceSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse({ error: 'Invalid request data', details: validation.error.format() }, 400);
    }

    const { fileUrl, fileName } = validation.data;

    // Bypass x.ai and save the Vercel Blob file URL directly for Fish Speech inference
    const clonedVoiceId = `fish_${fileUrl}`;

    // Save custom voice to database
    const customVoice = await prisma.customVoice.create({
      data: {
        userId: user.id,
        name: fileName.replace(/\.[^/.]+$/, "").substring(0, 30), // Max 30 chars
        voiceId: clonedVoiceId,
      }
    });

    return NextResponse.json({
      success: true,
      voice: customVoice,
    });

  } catch (error: any) {
    console.error("[CLONE_VOICE_ERROR]", error);
    return apiResponse("An error occurred during voice cloning.", 500);
  }
}
