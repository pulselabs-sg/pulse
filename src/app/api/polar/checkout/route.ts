import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkoutRatelimit } from "@/lib/ratelimit";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  server: process.env.NEXT_PUBLIC_POLAR_IS_SANDBOX === 'true' ? "sandbox" : "production",
});

export async function GET(req: Request) {
  try {
    // 1. Session Validation (Security Layer)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to continue." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email;

    // 2. Rate Limiting (Abuse Prevention)
    if (checkoutRatelimit) {
      const { success } = await checkoutRatelimit.limit(userId || userEmail || "anonymous");
      if (!success) {
        return NextResponse.json({ error: "Too many checkout requests. Please wait a minute." }, { status: 429 });
      }
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
    }

    // 3. Product Validation (Security Layer)
    // Only allow products that are defined in our environment variables
    const allowedProducts = [
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_BASIC,
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_BASIC_YEARLY,
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM,
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_YEARLY,
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO,
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY,
    ].filter(Boolean);

    if (!allowedProducts.includes(productId)) {
      console.warn(`[Security Alert] Unauthorized product checkout attempt: ${productId} by user ${userId}`);
      return NextResponse.json({ error: "Invalid product selection." }, { status: 400 });
    }

    // 4. Create a Checkout Session with Server-verified metadata
    const checkout = await polar.checkouts.create({
      products: [productId], 
      metadata: {
        userId: userId, // CRITICAL: Use verified userId from session
      },
      successUrl: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      // Optional: Prefill user email for better UX
      customerEmail: userEmail || undefined,
    });

    // Redirect directly to Polar
    return NextResponse.redirect(checkout.url);
  } catch (error: any) {
    console.error("[Polar Checkout Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
