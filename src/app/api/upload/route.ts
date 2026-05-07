import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/security';
import { ratelimit } from '@/lib/ratelimit';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    // Global Rate Limiting for Upload Token Generation
    const sessionForRL = await getServerSession(authOptions);
    if (sessionForRL?.user?.id && ratelimit) {
      const { success } = await ratelimit.limit(`ratelimit_upload_${sessionForRL.user.id}`);
      if (!success) return apiResponse("Too many upload requests. Please wait.", 429);
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log("[BLOB] Generating token for file:", pathname);

        // 1. Check Authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
          console.error("[BLOB_AUTH_ERROR] Session not found!");
          throw new Error('Unauthorized');
        }

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

        console.log(`[BLOB] Granting access for User: ${user?.tier} - Limit: ${TIER_LIMITS[tier]}MB`);

        return {
          allowedContentTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'],
          maximumSizeInBytes: maxFileSize,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[BLOB_SERVER_ERROR]:", error);
    return apiResponse((error as Error).message, 400);
  }
}