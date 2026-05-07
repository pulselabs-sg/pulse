import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/security';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const prisma = getPrisma();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return apiResponse("Invalid name provided.", 400);
    }

    // Verify ownership
    const resolvedParams = await params;
    const voice = await prisma.customVoice.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!voice) {
      return apiResponse("Voice not found.", 404);
    }

    if (voice.userId !== session.user.id) {
      return apiResponse("Forbidden.", 403);
    }

    const updatedVoice = await prisma.customVoice.update({
      where: { id: resolvedParams.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        voiceId: true,
      }
    });

    return NextResponse.json({ voice: updatedVoice });

  } catch (error: any) {
    console.error("[CUSTOM_VOICES_PATCH_ERROR]", error);
    return apiResponse("An error occurred updating custom voice.", 500);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const prisma = getPrisma();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const voice = await prisma.customVoice.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!voice) {
      return apiResponse("Voice not found.", 404);
    }

    if (voice.userId !== session.user.id) {
      return apiResponse("Forbidden.", 403);
    }

    await prisma.customVoice.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[CUSTOM_VOICES_DELETE_ERROR]", error);
    return apiResponse("An error occurred deleting custom voice.", 500);
  }
}
