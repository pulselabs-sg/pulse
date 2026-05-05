// src/app/api/paddle/webhook/route.ts
import { NextResponse } from 'next/server';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { getPrisma } from '@/lib/prisma';
import { Tier } from '@prisma/client';
import { apiResponse } from '@/lib/security';

const paddle = new Paddle(process.env.PADDLE_SECRET_KEY!, {
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
    ? Environment.production
    : Environment.sandbox,
});

export async function POST(req: Request) {
  const signature = req.headers.get('paddle-signature');
  if (!signature) {
    return apiResponse("Missing signature", 401);
  }

  const rawBody = await req.text();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET!;
  const prisma = getPrisma();

  try {
    const eventData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
    const eventId = eventData.eventId;
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { id: eventId }
    });

    if (existingEvent) {
      console.log(`⚠️ Webhook event ${eventId} already processed. Skipping...`);
      return NextResponse.json({ received: true, eventId: eventId });
    }

    await prisma.webhookEvent.create({
      data: { id: eventId, type: eventData.eventType }
    });

    console.log(`🔥 Processing Paddle Webhook [${eventData.eventType}] - Event ID: ${eventId}`);

    if (eventData.eventType === 'transaction.completed' || eventData.eventType === 'transaction.paid') {
      const transaction = eventData.data as any;
      const userId = transaction.customData?.userId;
      const plan = transaction.customData?.plan as Tier;
      const subscriptionId = transaction.subscriptionId || transaction.subscription?.id;

      if (userId && plan && transaction.status === 'completed') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier: plan,
            usageCount: 0,
            paddleCustomerId: transaction.customerId || transaction.customer?.id,
            paddleSubscriptionId: subscriptionId || null,
            cancelAtPeriodEnd: false,
          },
        });
        console.log(`✅ User ${userId} upgraded to ${plan}`);
      }
    }

    if (eventData.eventType === 'subscription.updated') {
      const subscription = eventData.data as any;
      const customData = subscription.customData;

      if (customData?.userId) {
        const isPendingCancel = subscription.scheduledChange?.action === 'cancel';

        await prisma.user.update({
          where: { id: customData.userId },
          data: { cancelAtPeriodEnd: isPendingCancel }
        });
        console.log(`🔄 User ${customData.userId} pending cancel set to: ${isPendingCancel}`);
      }
    }

    if (eventData.eventType === 'subscription.canceled') {
      const subscription = eventData.data as any;
      const customData = subscription.customData;

      if (customData?.userId && subscription.status === 'canceled') {
        await prisma.user.update({
          where: { id: customData.userId },
          data: {
            tier: 'FREE',
            paddleSubscriptionId: null,
            cancelAtPeriodEnd: false
          }
        });
        console.log(`❌ User ${customData.userId} downgraded to FREE.`);
      }
    }

    return NextResponse.json({ received: true, eventId: eventId });
  } catch (err: any) {
    console.error('❌ Paddle Webhook Verification Failed:', err.message);
    return apiResponse("Invalid webhook signature or payload", 400);
  }
}