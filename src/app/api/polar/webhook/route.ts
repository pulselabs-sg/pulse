import { Webhooks } from "@polar-sh/nextjs";
import { getPrisma } from "@/lib/prisma";
import { Tier } from "@prisma/client";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload: any) => {
    console.log("[Polar Webhook] Full Payload:", JSON.stringify(payload, null, 2));
    const { type, data } = payload;
    const prisma = getPrisma();

    console.log(`[Polar Webhook] Received event: ${type}`);

    try {
      if (type === "subscription.created" || type === "subscription.updated" || type === "order.paid") {
        const resource = data;
        const userId = resource.metadata?.userId || resource.user?.metadata?.userId || resource.custom_fields?.userId;
        const customerId = resource.customer_id;
        
        // Product ID can be in different places depending on the event type
        const productId = resource.product_id || resource.product?.id;
        const status = resource.status || "active"; // Orders don't have status, assume active if paid

        if (!userId) {
          console.error("[Polar Webhook] No userId found in resource metadata", resource.metadata);
          return;
        }

        console.log(`[Polar Webhook] Processing ${type} for user: ${userId}, product: ${productId}`);

        let tier: Tier = "FREE";
        const BASIC_ID = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_BASIC;
        const BASIC_YEARLY_ID = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_BASIC_YEARLY;
        const PREMIUM_ID = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM;
        const PREMIUM_YEARLY_ID = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_YEARLY;
        const PRO_ID = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO;
        const PRO_YEARLY_ID = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY;

        if (productId && (productId === BASIC_ID || productId === BASIC_YEARLY_ID)) {
          tier = "BASIC";
        } else if (productId && (productId === PREMIUM_ID || productId === PREMIUM_YEARLY_ID)) {
          tier = "PREMIUM";
        } else if (productId && (productId === PRO_ID || productId === PRO_YEARLY_ID)) {
          tier = "PRO";
        } else {
          console.warn(`[Polar Webhook] No matching tier found for productId: ${productId}`);
        }

        if (status === "active" || status === "trialing" || type === "order.paid") {
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier: tier,
              polarCustomerId: customerId,
              polarSubscriptionId: type.startsWith("subscription") ? resource.id : undefined,
              cancelAtPeriodEnd: resource.cancel_at_period_end || false,
            },
          });
          console.log(`[Polar Webhook] User ${userId} updated to tier ${tier}`);
        } else if (status === "canceled" || status === "unpaid") {
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier: "FREE",
              polarSubscriptionId: null,
            },
          });
          console.log(`[Polar Webhook] User ${userId} downgraded to FREE due to status: ${status}`);
        }
      }

      if (type === "subscription.revoked") {
        const subscription = data;
        const userId = subscription.metadata?.userId || subscription.user?.metadata?.userId;
        
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier: "FREE",
              polarSubscriptionId: null,
            },
          });
          console.log(`[Polar Webhook] User ${userId} subscription revoked`);
        }
      }
    } catch (error) {
      console.error("[Polar Webhook] Error processing event:", error);
      throw error; // Webhooks helper handles the response
    }
  },
});
