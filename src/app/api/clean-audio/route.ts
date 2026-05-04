export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/security';

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
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return apiResponse("User not found", 404);

    const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
    const limit = TIER_LIMITS[tier].generations;

    if (user.usageCount >= limit) {
      return apiResponse("Quota exceeded. Please upgrade your plan.", 429);
    }

    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    
    if (!file) return apiResponse("No file provided", 400);

    const maxFileSize = TIER_LIMITS[tier].maxFileMB * 1024 * 1024;
    if (file.size > maxFileSize) {
      return apiResponse(`File too large. Maximum ${TIER_LIMITS[tier].maxFileMB} MB allowed.`, 413);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    const buffer = await file.arrayBuffer();
    
    await prisma.user.update({
      where: { id: user.id },
      data: { usageCount: { increment: 1 } },
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.type || 'audio/wav',
        'Content-Disposition': 'attachment; filename="cleaned_audio.wav"',
        'X-User-Usage': (user.usageCount + 1).toString(),
      },
    });

  } catch (error: any) {
    console.error("Clean Audio Error:", error);
    return apiResponse(error.message || "Error processing audio", 500);
  }
}