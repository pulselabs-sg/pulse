// src/app/api/lemon-squeezy/webhook/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPrisma } from '@/lib/prisma';
import { Tier } from '@prisma/client';
import { apiResponse } from '@/lib/security';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  if (!signature) {
    return apiResponse("Missing signature", 401);
  }

  // Verify signature
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  if (signatureBuffer.length !== digest.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
    return apiResponse("Invalid signature", 401);
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta.event_name;
  const customData = payload.meta.custom_data;
  const prisma = getPrisma();

  console.log(`🔥 Processing Lemon Squeezy Webhook [${eventName}]`);

  try {
    // Deduplicate events
    const eventId = payload.data.id;
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { id: eventId }
    });

    if (existingEvent) {
      console.log(`⚠️ Webhook event ${eventId} already processed. Skipping...`);
      return NextResponse.json({ received: true });
    }

    await prisma.webhookEvent.create({
      data: { id: eventId, type: eventName }
    });

    const attributes = payload.data.attributes;
    const userId = customData?.userId;
    const plan = customData?.plan as Tier;

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      if (userId && plan) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier: plan,
            usageCount: 0,
            lemonSqueezyCustomerId: attributes.customer_id.toString(),
            lemonSqueezySubscriptionId: payload.data.id.toString(),
            cancelAtPeriodEnd: attributes.ends_at !== null,
          },
        });
        console.log(`✅ User ${userId} updated to ${plan} via ${eventName}`);
      }
    }

    if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier: 'FREE',
            lemonSqueezySubscriptionId: null,
            cancelAtPeriodEnd: false
          }
        });
        console.log(`❌ User ${userId} downgraded to FREE.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('❌ Lemon Squeezy Webhook Error:', err.message);
    return apiResponse("Internal Error", 500);
  }
}
