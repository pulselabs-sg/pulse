import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);

    const prisma = getPrisma();
    const projects = await prisma.visualProject.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[VISUAL_PROJECTS_GET_ERROR]", error);
    return apiResponse("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return apiResponse("Missing name", 400);
    }

    const prisma = getPrisma();
    const project = await prisma.visualProject.create({
      data: {
        userId: session.user.id,
        name
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[VISUAL_PROJECTS_POST_ERROR]", error);
    return apiResponse("Internal Error", 500);
  }
}
