import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export default async function middleware(request: NextRequest) {
  return NextResponse.next();
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
