import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { validateCredits } from '@/lib/security';

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  let pulseCost = 0;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { prompt, duration, referenceImageBase64, mode, quality, aspectRatio } = await req.json();
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'XAI_API_KEY is not configured.' }, { status: 500 });
    }

    if (!prompt && !referenceImageBase64) {
      return NextResponse.json({ error: 'Prompt or reference image is required.' }, { status: 400 });
    }

    const durSec = duration ? parseInt(duration) : 5;
    const isHD = quality === '720p' || quality === '1080p' || quality === '2k';
    // 480p is 1200 per second. 720p and above is 1500 per second.
    pulseCost = durSec * (isHD ? 1500 : 1200);

    // Verify credits
    const validationCredit = await validateCredits(session.user.id, pulseCost);
    if (validationCredit.error || !validationCredit.data) {
      return NextResponse.json(
        { error: validationCredit.error || "Credit validation failed" }, 
        { status: validationCredit.status || 400 }
      );
    }

    const { user, limit, tier } = validationCredit.data;

    if (tier === 'FREE') {
      if (isHD) {
        return NextResponse.json({ error: "HD video generation is only available on paid plans. Please upgrade your plan." }, { status: 403 });
      }
      if (mode === 'flow') {
        return NextResponse.json({ error: "Flow Video Extension is only available on paid plans. Please upgrade your plan." }, { status: 403 });
      }
    }

    // Deduct credits
    const updatedUser = await prisma.user.updateMany({
      where: {
        id: user.id,
        usageCount: { lte: limit - pulseCost }
      },
      data: { usageCount: { increment: pulseCost } },
    });

    if (updatedUser.count === 0) {
      return NextResponse.json({ error: "Pulse quota exceeded. Please upgrade your plan." }, { status: 429 });
    }

    const payload: any = {
      model: "grok-imagine-video",
      prompt: prompt || 'Generate a video',
      duration: durSec,
    };
    if (aspectRatio) {
      payload.aspect_ratio = aspectRatio;
    }

    if (referenceImageBase64) {
      if (mode === 'flow') {
        payload.video = {
          url: referenceImageBase64
        };
      } else {
        payload.image = {
          url: referenceImageBase64
        };
      }
    }

    const endpoint = mode === 'flow' 
      ? 'https://api.x.ai/v1/videos/extensions' 
      : 'https://api.x.ai/v1/videos/generations';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('XAI API Video Error:', errorData);

      // Refund credits
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: pulseCost } },
        data: { usageCount: { decrement: pulseCost } }
      });

      return NextResponse.json({ error: 'Failed to initiate video generation', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ request_id: data.request_id, cost: pulseCost });

  } catch (error: any) {
    console.error('Generate Video Route Error:', error);
    // Refund credits if exception occurs
    const session = await getServerSession(authOptions);
    if (session?.user?.id && pulseCost > 0) {
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: pulseCost } },
        data: { usageCount: { decrement: pulseCost } }
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
