// src/app/api/paddle/webhook/route.ts
import { NextResponse } from 'next/server';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { getPrisma } from '@/lib/prisma';

const paddle = new Paddle(process.env.PADDLE_SECRET_KEY!, {
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
    ? Environment.production
    : Environment.sandbox,
});

export async function POST(req: Request) {
  const signature = req.headers.get('paddle-signature') || '';
  const rawBody = await req.text();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET!;

  console.log('🔥 Paddle Webhook received!');

  try {
    const eventData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
    console.log('✅ Event type:', eventData.eventType);

    if (eventData.eventType === 'transaction.completed' || eventData.eventType === 'transaction.paid') {
      const transaction = eventData.data as any;
      const userId = transaction.customData?.userId;
      const plan = transaction.customData?.plan as 'BASIC' | 'PREMIUM';
      
      // Paddle includes subscriptionId if this transaction is part of a recurring plan
      const subscriptionId = transaction.subscriptionId || transaction.subscription?.id;

      if (userId && plan) {
        const prisma = getPrisma();
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier: plan,
            usageCount: 0,
            paddleCustomerId: transaction.customerId || transaction.customer?.id,
            paddleSubscriptionId: subscriptionId || null, // Save this!
          },
        });
        console.log(`✅ User ${userId} upgraded to ${plan} successfully!`);
      }
    }

    // Optional: Handle subscription cancellation webhooks to downgrade the user automatically
    if (eventData.eventType === 'subscription.canceled') {
       const subscription = eventData.data as any;
       const customData = subscription.customData;
       if (customData?.userId) {
         const prisma = getPrisma();
         await prisma.user.update({
           where: { id: customData.userId },
           data: { tier: 'FREE', paddleSubscriptionId: null }
         });
         console.log(`❌ User ${customData.userId} downgraded to FREE.`);
       }
    }

    return NextResponse.json({ received: true, event: eventData.eventType });
  } catch (err: any) {
    console.error('❌ Paddle Webhook Error:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
}