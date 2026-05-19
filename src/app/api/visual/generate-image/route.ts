import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToR2 } from '@/lib/r2';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { validateCredits } from '@/lib/security';

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  const pulseCost = 1500; // 1500 pulses per image generation/edit

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { prompt, feature, referenceImageBase64 } = await req.json();
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'XAI_API_KEY is not configured.' }, { status: 500 });
    }

    if (!prompt && !referenceImageBase64) {
      return NextResponse.json({ error: 'Prompt or reference image is required.' }, { status: 400 });
    }

    // Verify credits
    const validationCredit = await validateCredits(session.user.id, pulseCost);
    if (validationCredit.error || !validationCredit.data) {
      return NextResponse.json(
        { error: validationCredit.error || "Credit validation failed" }, 
        { status: validationCredit.status || 400 }
      );
    }

    const { user, limit } = validationCredit.data;

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

    // Determine if it's an edit or generation based on feature/image presence
    const isEdit = feature === 'image-editing' || (referenceImageBase64 && !feature.includes('video'));
    const url = isEdit ? 'https://api.x.ai/v1/images/edits' : 'https://api.x.ai/v1/images/generations';

    const payload: any = {
      model: "grok-imagine-image-quality",
      prompt: prompt || 'Generate an image',
    };

    if (referenceImageBase64) {
      payload.image = {
        url: referenceImageBase64,
        type: 'image_url'
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('XAI API Error:', errorData);

      // Refund credits
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: pulseCost } },
        data: { usageCount: { decrement: pulseCost } }
      });

      return NextResponse.json({ error: 'Failed to generate image', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const grokUrl = data.data?.[0]?.url;

    if (!grokUrl) {
      // Refund credits
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: pulseCost } },
        data: { usageCount: { decrement: pulseCost } }
      });
      return NextResponse.json({ error: 'No URL returned from xAI' }, { status: 500 });
    }

    try {
      const imageRes = await fetch(grokUrl);
      if (!imageRes.ok) throw new Error('Failed to fetch image from xAI temporary URL');
      
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = `images/img_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
      
      const r2Url = await uploadBufferToR2(buffer, filename, 'image/png');
      return NextResponse.json({ url: r2Url });
    } catch (uploadError) {
      console.error('R2 Upload Error:', uploadError);
      // Fallback to grok URL if R2 upload fails
      return NextResponse.json({ url: grokUrl });
    }

  } catch (error: any) {
    console.error('Generate Image Route Error:', error);
    // Refund credits if exception occurs
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: pulseCost } },
        data: { usageCount: { decrement: pulseCost } }
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
