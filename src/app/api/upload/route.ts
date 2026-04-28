import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log("[BLOB] Bắt đầu cấp token cho file:", pathname);
        
        // 1. Kiểm tra Auth
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
          console.error("[BLOB_AUTH_ERROR] Không tìm thấy session!");
          throw new Error('Unauthorized');
        }

        // 2. Lấy thông tin Tier
        const prisma = getPrisma();
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { tier: true }
        });

        const TIER_LIMITS = {
          FREE: 50, BASIC: 300, PREMIUM: 500, PRO: 500,
        };
        const tier = (user?.tier || 'FREE') as keyof typeof TIER_LIMITS;
        const maxFileSize = TIER_LIMITS[tier] * 1024 * 1024;

        console.log(`[BLOB] Cấp quyền cho User: ${user?.tier} - Limit: ${TIER_LIMITS[tier]}MB`);

        return {
          allowedContentTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'],
          maximumSizeInBytes: maxFileSize,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('[BLOB] Upload thành công! URL:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[BLOB_SERVER_ERROR]:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}