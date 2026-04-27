import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";

// 1. Mở rộng interface Session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tier?: string | null;
      usageCount?: number | null;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(getPrisma()),           // ← dùng getPrisma()
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user && user?.id) {
        session.user.id = user.id;

        const prisma = getPrisma();               // ← gọi bên trong callback
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { tier: true, usageCount: true },
        });

        if (dbUser) {
          session.user.tier = dbUser.tier;
          session.user.usageCount = dbUser.usageCount;
        }
      }
      return session;
    },
  },
  pages: { signIn: "/" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };