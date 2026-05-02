import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";

// Mở rộng kiểu dữ liệu cho Session để Frontend nhận diện được tự động
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
      usageCount: number;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(getPrisma()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user && user?.id) {
        session.user.id = user.id;

        const prisma = getPrisma();
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { tier: true, usageCount: true },
        });

        // Đảm bảo luôn có giá trị fallback an toàn
        session.user.tier = (dbUser?.tier as any) || 'FREE';
        session.user.usageCount = dbUser?.usageCount || 0;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "database" }, // Explicitly set strategy
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };