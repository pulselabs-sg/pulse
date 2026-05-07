export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/security';
import { parseBuffer } from 'music-metadata';

const TIER_LIMITS = {
  FREE: { pulse: 20000, maxAudioMins: 5 },
  BASIC: { pulse: 60000, maxAudioMins: 5 },
  PREMIUM: { pulse: 150000, maxAudioMins: 10 },
  PRO: { pulse: 800000, maxAudioMins: 15 },
} as const;

export async function POST(req: Request) {
  const prisma = getPrisma();
  let pulseCost = 0;
  let session: any;

  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return apiResponse("User not found", 404);

    const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
    const limit = TIER_LIMITS[tier].pulse;

    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    
    if (!file) return apiResponse("No file provided", 400);

    const maxFileSize = (tier === 'FREE' ? 50 : tier === 'BASIC' ? 300 : 500) * 1024 * 1024;
    if (file.size > maxFileSize) {
      return apiResponse(`File too large.`, 413);
    }

    const buffer = await file.arrayBuffer();
    
    let durationSeconds = 1;
    try {
      const metadata = await parseBuffer(new Uint8Array(buffer), { mimeType: file.type || 'audio/mpeg' });
      if (metadata.format.duration) durationSeconds = metadata.format.duration;
    } catch (e) {
      console.warn("Could not parse audio duration, defaulting to 1 second", e);
    }

    const maxAudioMins = TIER_LIMITS[tier].maxAudioMins;
    if (durationSeconds > maxAudioMins * 60) {
      return apiResponse(`Audio too long. Maximum ${maxAudioMins} minutes allowed.`, 413);
    }

    pulseCost = Math.ceil((durationSeconds / 60) * 1000);

    const updatedUser = await prisma.user.updateMany({
      where: {
        id: user.id,
        usageCount: { lte: limit - pulseCost }
      },
      data: { usageCount: { increment: pulseCost } },
    });

    if (updatedUser.count === 0) {
      return apiResponse("Pulse quota exceeded. Please upgrade your plan.", 429);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.type || 'audio/wav',
        'Content-Disposition': 'attachment; filename="cleaned_audio.wav"',
        'X-User-Usage': (user.usageCount + pulseCost).toString(),
      },
    });

  } catch (error: any) {
    console.error("Clean Audio Error:", error);
    if (session?.user?.id && pulseCost > 0) {
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: pulseCost } },
        data: { usageCount: { decrement: pulseCost } }
      });
    }
    return apiResponse(error.message || "Error processing audio", 500);
  }
}