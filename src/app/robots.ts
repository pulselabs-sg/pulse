import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /login redirects to /dashboard — keep it private to prevent
      // "Page with redirects" indexing issues in Google Search Console.
      // /dashboard/ and /api/ are authenticated/private routes.
      disallow: ['/login', '/dashboard/', '/api/'],
    },
    sitemap: 'https://ipulselabs.net/sitemap.xml',
  };
}
