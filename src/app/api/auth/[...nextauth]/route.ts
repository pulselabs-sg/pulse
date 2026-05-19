// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
      usageCount: number;
      cancelAtPeriodEnd: boolean;
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
          select: { tier: true, usageCount: true, cancelAtPeriodEnd: true },
        });

        session.user.tier = (dbUser?.tier as any) || 'FREE';
        session.user.usageCount = dbUser?.usageCount || 0;
        session.user.cancelAtPeriodEnd = dbUser?.cancelAtPeriodEnd || false;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "database" }, // Explicitly set strategy
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' 
          ? '.ipulselabs.net' 
          : undefined,
      },
    },
  },
};

const handler = async (req: NextRequest, ctx: any) => {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  
  process.env.NEXTAUTH_URL = `${proto}://${host}`;
  
  const authHandler = NextAuth(authOptions);
  return authHandler(req, ctx);
};

export { handler as GET, handler as POST };