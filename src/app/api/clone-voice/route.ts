import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { cloneVoiceSchema, apiResponse, validateCredits, CREDIT_COSTS } from '@/lib/security';
import { ratelimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  const prisma = getPrisma();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Rate Limiting (Specific for Clone Voice: 5 per hour)
    if (ratelimit) {
      const { success } = await ratelimit.limit(`ratelimit_clone_${session.user.id}`);
      if (!success) return apiResponse("Rate limit exceeded for voice cloning. Try again later.", 429);
    }

    const cost = CREDIT_COSTS.CLONE_VOICE;

    const validationCredit = await validateCredits(session.user.id, cost);
    if (validationCredit.error || !validationCredit.data) {
      return apiResponse(validationCredit.error || "Credit validation failed", validationCredit.status || 400);
    }

    const { user, limit } = validationCredit.data;

    // Restrict FREE tier (even if they somehow have credits)
    if (user.tier === 'FREE') {
      return apiResponse("Clone Voice feature is only available on Basic, Premium, and Pro plans.", 403);
    }

    // 3. Deduct Credits Atomically
    const updatedUser = await prisma.user.updateMany({
      where: {
        id: user.id,
        usageCount: { lte: limit - cost }
      },
      data: { usageCount: { increment: cost } },
    });

    if (updatedUser.count === 0) {
      return apiResponse("Pulse quota exceeded. Please upgrade your plan.", 429);
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

    // Create history record for cloning
    await prisma.history.create({
      data: {
        userId: user.id,
        type: 'Clone Voice',
        input: fileName,
        output: customVoice.voiceId,
      }
    });

    return NextResponse.json({
      success: true,
      voice: customVoice,
    });

  } catch (error: any) {
    console.error("[CLONE_VOICE_ERROR]", error);
    
    // Refund credits on failure
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: CREDIT_COSTS.CLONE_VOICE } },
        data: { usageCount: { decrement: CREDIT_COSTS.CLONE_VOICE } }
      });
    }

    return apiResponse("An error occurred during voice cloning.", 500);
  }
}
