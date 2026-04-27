// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'pg'],

  // ✅ Đây là cách đúng cho Next.js 16 (không còn experimental.turbo)
  turbopack: {
    resolveAlias: {
      '.prisma/client/default': './node_modules/.prisma/client/default.js',
    },
  },
};

export default nextConfig;