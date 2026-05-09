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

    // 2. Validate request body FIRST — before touching any credits.
    //    Previously credits were deducted before validation, causing unnecessary
    //    charge + rollback cycles on malformed requests.
    const body = await req.json().catch(() => ({}));
    const validation = cloneVoiceSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse({ error: 'Invalid request data', details: validation.error.format() }, 400);
    }

    const { fileUrl, fileName } = validation.data;

    // 3. Credit check (reads user tier + usageCount)
    const cost = CREDIT_COSTS.CLONE_VOICE;

    const validationCredit = await validateCredits(session.user.id, cost);
    if (validationCredit.error || !validationCredit.data) {
      return apiResponse(validationCredit.error || "Credit validation failed", validationCredit.status || 400);
    }

    const { user, limit } = validationCredit.data;

    // 4. Restrict FREE tier (even if they somehow have credits)
    if (user.tier === 'FREE') {
      return apiResponse("Clone Voice feature is only available on Basic, Premium, and Pro plans.", 403);
    }

    // 5. Deduct Credits Atomically
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

    // 6. Save the Vercel Blob URL as a Fish Speech reference voice
    const clonedVoiceId = `fish_${fileUrl}`;

    const customVoice = await prisma.customVoice.create({
      data: {
        userId: user.id,
        name: fileName.replace(/\.[^/.]+$/, "").substring(0, 30),
        voiceId: clonedVoiceId,
      }
    });

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

    // Refund credits only if deduction already occurred (after step 5)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: CREDIT_COSTS.CLONE_VOICE } },
        data: { usageCount: { decrement: CREDIT_COSTS.CLONE_VOICE } }
      }).catch((e) => console.error("[CLONE_VOICE_ROLLBACK_ERROR]", e));
    }

    return apiResponse("An error occurred during voice cloning.", 500);
  }
}
