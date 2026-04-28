import { NextResponse } from 'next/server';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { getPrisma } from '@/lib/prisma';
import { Tier } from '@prisma/client';

const paddle = new Paddle(process.env.PADDLE_SECRET_KEY!, {
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
    ? Environment.production
    : Environment.sandbox,
});

export async function POST(req: Request) {
  const signature = req.headers.get('paddle-signature');
  if (!signature) {
    return new NextResponse("Missing signature", { status: 401 });
  }

  const rawBody = await req.text();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET!;
  const prisma = getPrisma();

  try {
    const eventData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
    const eventId = eventData.eventId;

    // ==========================================
    // BẢO MẬT: Chống Webhook Replay (Idempotency)
    // ==========================================
    
    // 1. Kiểm tra xem event này đã được xử lý thành công trước đó chưa
    const existingEvent = await prisma.webhookEvent.findUnique({ 
      where: { id: eventId } 
    });
    
    if (existingEvent) {
      console.log(`⚠️ Webhook event ${eventId} already processed. Skipping...`);
      return NextResponse.json({ received: true, eventId: eventId });
    }

    // 2. Ghi nhận event vào database để "khóa" (tránh gọi trùng lặp song song)
    await prisma.webhookEvent.create({ 
      data: { id: eventId, type: eventData.eventType } 
    });

    console.log(`🔥 Processing Paddle Webhook [${eventData.eventType}] - Event ID: ${eventId}`);

    // ==========================================
    // LOGIC XỬ LÝ THANH TOÁN
    // ==========================================

    if (eventData.eventType === 'transaction.completed' || eventData.eventType === 'transaction.paid') {
      const transaction = eventData.data as any;
      const userId = transaction.customData?.userId;

      // Ép kiểu chuẩn theo Prisma Enum
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
          },
        });
        console.log(`✅ User ${userId} upgraded to ${plan}`);
      }
    }

    if (eventData.eventType === 'subscription.canceled') {
      const subscription = eventData.data as any;
      const customData = subscription.customData;
      
      if (customData?.userId) {
        // Chỉ downgrade khi subscription thực sự hết hạn (không phải hủy ngang)
        if (subscription.status === 'canceled') {
          await prisma.user.update({
            where: { id: customData.userId },
            data: { tier: 'FREE', paddleSubscriptionId: null }
          });
          console.log(`❌ User ${customData.userId} downgraded to FREE.`);
        }
      }
    }

    return NextResponse.json({ received: true, eventId: eventId });
  } catch (err: any) {
    // Không leak Error Stack cho client/Paddle
    console.error('❌ Paddle Webhook Verification Failed:', err.message);
    return new NextResponse("Invalid webhook signature or payload", { status: 400 });
  }
}