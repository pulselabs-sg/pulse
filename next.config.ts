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
    'a555-2402-800-63a8-dc07-cc58-ddc-d063-457e.ngrok-free.app'
  ],
};

export default nextConfig;