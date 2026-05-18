import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/security';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);

    const { id } = await params;

    const prisma = getPrisma();
    
    const project = await prisma.visualProject.findUnique({
      where: { id }
    });

    if (!project || project.userId !== session.user.id) {
      return apiResponse("Not found or unauthorized", 404);
    }

    await prisma.visualProject.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VISUAL_PROJECT_DELETE_ERROR]", error);
    return apiResponse("Internal Error", 500);
  }
}
