import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToR2 } from '@/lib/r2';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';

// Keep track of refunded requests to prevent duplicate refunding
const refundedRequests = new Set<string>();

export async function GET(req: NextRequest) {
  const prisma = getPrisma();

  try {
    const requestId = req.nextUrl.searchParams.get('request_id');
    const duration = req.nextUrl.searchParams.get('duration');
    const quality = req.nextUrl.searchParams.get('quality');
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'XAI_API_KEY is not configured.' }, { status: 500 });
    }

    if (!requestId) {
      return NextResponse.json({ error: 'request_id is required.' }, { status: 400 });
    }

    const response = await fetch(`https://api.x.ai/v1/videos/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('XAI API Video Status Error:', errorData);
      return NextResponse.json({ error: 'Failed to check video status', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    // If status is done, download the video and upload to R2 permanently
    if (data.status === 'done' && data.video?.url) {
      try {
        const videoRes = await fetch(data.video.url);
        if (!videoRes.ok) throw new Error('Failed to fetch video from xAI temporary URL');
        
        const arrayBuffer = await videoRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = `videos/vid_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
        
        const r2Url = await uploadBufferToR2(buffer, filename, 'video/mp4');
        data.video.url = r2Url; // Replace the grok url with permanent R2 url
      } catch (uploadError) {
        console.error('R2 Video Upload Error:', uploadError);
        // Fallback to the temporary grok URL if upload fails
      }
    }

    // Refund if the video generation has failed or expired
    if ((data.status === 'failed' || data.status === 'expired') && !refundedRequests.has(requestId)) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id && duration && quality) {
        const durSec = Math.min(15, Math.max(0, parseInt(duration) || 0));
        const isHD = quality === '720p' || quality === '1080p' || quality === '2k';
        const refundCost = durSec * (isHD ? 1500 : 1200);

        if (refundCost > 0) {
          refundedRequests.add(requestId);
          await prisma.user.updateMany({
            where: { id: session.user.id, usageCount: { gte: refundCost } },
            data: { usageCount: { decrement: refundCost } }
          });
        }
      }
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Video Status Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
