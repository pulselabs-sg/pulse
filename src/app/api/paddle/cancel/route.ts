// src/app/api/paddle/cancel/route.ts
import { NextResponse } from 'next/server';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';

const paddle = new Paddle(process.env.PADDLE_SECRET_KEY!, {
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
    ? Environment.production
    : Environment.sandbox,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { paddleSubscriptionId: true }
    });

    if (!user?.paddleSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Tell Paddle to cancel the subscription at the end of the current billing cycle
    await paddle.subscriptions.cancel(user.paddleSubscriptionId, {
      effectiveFrom: 'next_billing_period'
    });

    return NextResponse.json({ success: true, message: 'Subscription scheduled for cancellation.' });
  } catch (error: any) {
    console.error('Cancel Subscription Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel' }, { status: 500 });
  }
}