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

    // 1. Try to use AWS SDK to fetch directly from R2 bucket (Bypasses Cloudflare CDN WAF & Bot Protection)
    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const { r2Client } = await import('@/lib/r2');
      const key = url.replace('https://cdn.ipulselabs.net/', '');
      
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'ipulse',
        Key: key,
      });
      const s3Response = await r2Client.send(command);
      
      const contentType = s3Response.ContentType || 'application/octet-stream';
      const filename = url.split('/').pop() || `pulse-generation-${Date.now()}`;
      
      // Node.js stream to Web ReadableStream conversion for Next.js Edge/Node runtime
      const stream = s3Response.Body?.transformToWebStream 
        ? s3Response.Body.transformToWebStream() 
        : s3Response.Body as any;

      return new NextResponse(stream, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    } catch (s3Error) {
      console.error("[VISUAL_DOWNLOAD] Direct R2 fetch failed, falling back to HTTPS fetch:", s3Error);
      
      // 2. Fallback to HTTPS fetch with Browser User-Agent if S3 method fails
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      });
      
      if (!response.ok) {
        console.error(`[VISUAL_DOWNLOAD] CDN fetch failed for ${url} with status ${response.status}`);
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
    }
  } catch (error) {
    console.error("[VISUAL_DOWNLOAD_PROXY_ERROR]", error);
    return apiResponse("Internal Server Error", 500);
  }
}
