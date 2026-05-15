import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPrisma } from "@/lib/prisma";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  server: process.env.NEXT_PUBLIC_POLAR_IS_SANDBOX === 'true' ? "sandbox" : "production",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, polarSubscriptionId: true },
    });

    if (!user || !user.polarSubscriptionId) {
      return NextResponse.json({ error: "No active Polar subscription found" }, { status: 400 });
    }

    // Cancel the subscription via Polar SDK
    // Using the revoke endpoint which cancels the subscription
    await polar.subscriptions.revoke({
      id: user.polarSubscriptionId,
    });

    // Update local database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    return NextResponse.json({ success: true, message: "Subscription cancellation initiated" });
  } catch (error: any) {
    console.error("[Polar Cancel] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel subscription" }, { status: 500 });
  }
}
