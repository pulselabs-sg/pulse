import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { apiResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return apiResponse("Missing url parameter", 400);
    }

    // Only allow proxying from cdn.ipulselabs.net to prevent open-redirect or open-proxy vulnerabilities
    if (!url.startsWith('https://cdn.ipulselabs.net/')) {
      return apiResponse("Forbidden: Invalid download source URL", 403);
    }

    const response = await fetch(url);
    if (!response.ok) {
      return apiResponse("Failed to fetch target asset from CDN", response.status);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.blob();
    const filename = url.split('/').pop() || `pulse-generation-${Date.now()}`;

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error("[VISUAL_DOWNLOAD_PROXY_ERROR]", error);
    return apiResponse("Internal Server Error", 500);
  }
}
