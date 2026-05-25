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
    '192.168.1.9',
    '7d9e-2402-800-63a8-dc07-fd7e-3b79-a5da-a5b8.ngrok-free.app'
  ],
};

export default nextConfig;