import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/security';

export async function GET(req: Request) {
  const prisma = getPrisma();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const customVoices = await prisma.customVoice.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        voiceId: true,
      }
    });

    return NextResponse.json({ voices: customVoices });

  } catch (error: any) {
    console.error("[CUSTOM_VOICES_ERROR]", error);
    return apiResponse("An error occurred fetching custom voices.", 500);
  }
}
