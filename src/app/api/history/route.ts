import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);

    const prisma = getPrisma();
    const history = await prisma.history.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[HISTORY_GET_ERROR]", error);
    return apiResponse("Internal Error", 500);
  }
}