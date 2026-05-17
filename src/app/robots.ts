import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/dashboard/', '/api/'],
    },
    sitemap: 'https://ipulselabs.net/sitemap.xml',
  };
}
