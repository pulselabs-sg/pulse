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
    'c5d6-2402-800-63a8-dc07-7c3b-f169-3116-48db.ngrok-free.app'
  ],
};

export default nextConfig;