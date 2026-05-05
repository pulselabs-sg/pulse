// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'pg'],

  turbopack: {
    resolveAlias: {
      '.prisma/client/default': './node_modules/.prisma/client/default.js',
    },
  },

  // Add your ngrok domain here
  allowedDevOrigins: [
    '829c-2402-800-63a8-dc07-f9a5-244e-8cd5-a490.ngrok-free.app'
  ],
};

export default nextConfig;