import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_HEADERS } from './lib/security';
import { ratelimit } from './lib/ratelimit';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Global Rate Limiting for API routes
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth') && ratelimit) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_api_${ip}`
    );

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }

  // 2. Apply Security Headers
  const response = NextResponse.next();
  
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 3. Prevent Cross-Origin Embedder Policy (COEP) if needed for Lemon Squeezy
  // Lemon Squeezy might need 'unsafe-none' or 'credentialless'
  // response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
