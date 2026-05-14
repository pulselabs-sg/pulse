import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { Tier } from '@prisma/client';
import { apiResponse } from '@/lib/security';
import { verifyHelioSignature } from '@/lib/helio';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('X-Signature') || '';
    
    // Security check: Verify HMAC signature
    if (!verifyHelioSignature(rawBody, signature)) {
      console.error("❌ Invalid Helio Webhook Signature.");
      return apiResponse("Unauthorized", 401);
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event; // Helio uses 'event' field
    const data = payload.data;
    
    // customerExternalId is where we pass our userId in the Paylink URL
    const userId = data?.customerExternalId || data?.meta?.userId;
    const subscriptionId = data?.subscriptionId;
    const customerId = data?.customerId;

    const prisma = getPrisma();

    console.log(`🔥 Processing Helio Webhook [${eventType}] for user ${userId}`);

    if (eventType === 'SUBSCRIPTION_STARTED') {
      const paylinkId = data?.paylinkId;
      
      let tier: Tier = 'FREE';
      
      // Map Paylink IDs to Tiers
      if (paylinkId === process.env.NEXT_PUBLIC_HELIO_PAYLINK_BASIC_MONTHLY || paylinkId === process.env.NEXT_PUBLIC_HELIO_PAYLINK_BASIC_YEARLY) {
        tier = 'BASIC';
      } else if (paylinkId === process.env.NEXT_PUBLIC_HELIO_PAYLINK_PREMIUM_MONTHLY || paylinkId === process.env.NEXT_PUBLIC_HELIO_PAYLINK_PREMIUM_YEARLY) {
        tier = 'PREMIUM';
      } else if (paylinkId === process.env.NEXT_PUBLIC_HELIO_PAYLINK_PRO_MONTHLY || paylinkId === process.env.NEXT_PUBLIC_HELIO_PAYLINK_PRO_YEARLY) {
        tier = 'PRO';
      }

      if (userId && tier !== 'FREE') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier: tier,
            usageCount: 0, // Reset usage on new/renewed subscription
            helioCustomerId: customerId,
            helioSubscriptionId: subscriptionId,
            cancelAtPeriodEnd: false,
          },
        });
        console.log(`✅ User ${userId} upgraded to ${tier} via Helio`);
      }
    } 
    else if (eventType === 'SUBSCRIPTION_ENDED') {
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier: 'FREE',
            helioSubscriptionId: null,
            cancelAtPeriodEnd: false
          }
        });
        console.log(`❌ User ${userId} downgraded to FREE via Helio.`);
      } else if (subscriptionId) {
        // Fallback: search by subscription ID
        await prisma.user.updateMany({
          where: { helioSubscriptionId: subscriptionId },
          data: {
            tier: 'FREE',
            helioSubscriptionId: null,
            cancelAtPeriodEnd: false
          }
        });
        console.log(`❌ Subscription ${subscriptionId} ended and user(s) downgraded to FREE.`);
      }
    }
    else if (eventType === 'PAYMENT_SUCCESS') {
        // Handle one-time payments if any, or just log
        console.log(`💰 Payment success for ${userId}: ${data?.amount} ${data?.currency}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('❌ Helio Webhook Error:', err.message);
    return apiResponse("Internal Error", 500);
  }
}
