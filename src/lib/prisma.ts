// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ✅ Lazy initialization - chỉ tạo khi thực sự dùng (fix lỗi build Turbopack)
export const getPrisma = () => {
  if (!globalForPrisma.prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error('❌ DATABASE_URL environment variable is not set');
    }

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
};

// Export default để giữ tương thích code cũ (nếu bạn import { prisma })
export const prisma = getPrisma();