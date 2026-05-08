import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // No trailing slash — prevents double-slash URLs like //login that cause
  // "Page with redirects" errors in Google Search Console.
  const baseUrl = 'https://ipulselabs.net';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // NOTE: /login is intentionally excluded — it redirects authenticated
    // users to /dashboard, causing Google to flag it as "Page with redirects".
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}
