import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getSubdomain(host: string): string | null {
  const hostname = host.replace(/:\d+$/, ''); // Remove port
  const parts = hostname.split('.');

  if (parts.length < 2) return null;

  // Handle localhost (e.g., visual.localhost)
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0];
  }

  const mainDomain = parts.slice(-2).join('.'); // e.g. "ipulselabs.net" or "vercel.app"

  if (mainDomain === 'vercel.app') {
    if (parts.length > 3) {
      return parts[0];
    }
    return null;
  }

  if (mainDomain === 'ipulselabs.net') {
    if (parts.length === 2) return null; // base domain
    if (parts[0] === 'www') return null; // ignore www
    return parts[0];
  }

  // Fallback for custom domains/tunnels
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }

  return null;
}

export default async function proxy(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const subdomain = getSubdomain(host);
  const { pathname, search } = request.nextUrl;

  // 1. Skip system routes, static files, and global routes
  const hasFileExtension = pathname.includes('.') && !pathname.endsWith('/');
  const isGlobalRoute = 
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    hasFileExtension ||
    ['docs', 'privacy-policy', 'refund-policy', 'terms-of-use'].some(p => pathname.startsWith(`/${p}`));

  if (isGlobalRoute) {
    return NextResponse.next();
  }

  const protocol = request.nextUrl.protocol;
  const cleanHost = host.replace(/^www\./, '');

  // 2. Handle subdomains redirect/rewrite logic
  if (subdomain === 'visual') {
    // If they access /audio on the visual subdomain, redirect to audio subdomain
    if (pathname.startsWith('/audio')) {
      const subpath = pathname.replace(/^\/audio/, '') || '/';
      const audioHost = cleanHost.replace(/^visual\./, 'audio.');
      return NextResponse.redirect(`${protocol}//${audioHost}${subpath}${search}`);
    }

    // Clean URL protection: if accessing /visual/[subpath] on visual subdomain, strip the prefix
    if (pathname.startsWith('/visual')) {
      const cleanPath = pathname.replace(/^\/visual/, '') || '/';
      return NextResponse.redirect(new URL(`${cleanPath}${search}`, request.url));
    }

    // Rewrite internally to the /visual route
    return NextResponse.rewrite(new URL(`/visual${pathname}${search}`, request.url));
  }

  if (subdomain === 'audio') {
    // If they access /visual on the audio subdomain, redirect to visual subdomain
    if (pathname.startsWith('/visual')) {
      const subpath = pathname.replace(/^\/visual/, '') || '/';
      const visualHost = cleanHost.replace(/^audio\./, 'visual.');
      return NextResponse.redirect(`${protocol}//${visualHost}${subpath}${search}`);
    }

    // Clean URL protection: if accessing /audio/[subpath] on audio subdomain, strip the prefix
    if (pathname.startsWith('/audio')) {
      const cleanPath = pathname.replace(/^\/audio/, '') || '/';
      return NextResponse.redirect(new URL(`${cleanPath}${search}`, request.url));
    }

    // Rewrite internally to the /audio route
    // Only rewrite root path / to /audio
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL(`/audio${search}`, request.url));
    }
  }

  // 3. Handle root/base domain redirect logic (no subdomain or www)
  if (!subdomain) {
    const isLocalhost = host.includes('localhost');
    if (!isLocalhost) {
      // Redirect /visual/... to visual.ipulselabs.net/...
      if (pathname.startsWith('/visual')) {
        const subpath = pathname.replace(/^\/visual/, '') || '/';
        const visualHost = `visual.${cleanHost}`;
        return NextResponse.redirect(`${protocol}//${visualHost}${subpath}${search}`);
      }

      // Redirect /audio/... to audio.ipulselabs.net/...
      if (pathname.startsWith('/audio')) {
        const subpath = pathname.replace(/^\/audio/, '') || '/';
        const audioHost = `audio.${cleanHost}`;
        return NextResponse.redirect(`${protocol}//${audioHost}${subpath}${search}`);
      }
    }
  }

  return NextResponse.next();
}

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
