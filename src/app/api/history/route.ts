import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);
    
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    const prisma = getPrisma();
    
    const whereClause: any = { userId: session.user.id };
    if (projectId) {
      whereClause.visualProjectId = projectId;
    }

    const history = await prisma.history.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50 
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[HISTORY_GET_ERROR]", error);
    return apiResponse("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);

    const body = await req.json();
    const { type, input, output, projectId } = body;

    if (!type || (!input && !output)) {
      return apiResponse("Missing required fields", 400);
    }

    const prisma = getPrisma();
    const history = await prisma.history.create({
      data: {
        userId: session.user.id,
        type,
        input,
        output,
        visualProjectId: projectId || null,
      }
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[HISTORY_POST_ERROR]", error);
    return apiResponse("Internal Error", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiResponse("Missing id", 400);
    }

    const prisma = getPrisma();
    const history = await prisma.history.findUnique({ where: { id } });

    if (!history || history.userId !== session.user.id) {
      return apiResponse("Not found or unauthorized", 404);
    }

    await prisma.history.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[HISTORY_DELETE_ERROR]", error);
    return apiResponse("Internal Error", 500);
  }
}