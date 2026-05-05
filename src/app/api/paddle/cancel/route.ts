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

    await paddle.subscriptions.cancel(user.paddleSubscriptionId, {
      effectiveFrom: 'next_billing_period'
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { cancelAtPeriodEnd: true }
    });

    return NextResponse.json({ success: true, message: 'Subscription scheduled for cancellation.' });
  } catch (error: any) {
    if (error?.code === 'subscription_locked_pending_changes') {
      const prisma = getPrisma();
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { cancelAtPeriodEnd: true }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription is already scheduled for cancellation.'
      });
    }

    console.error('Cancel Subscription Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel' }, { status: 500 });
  }
}