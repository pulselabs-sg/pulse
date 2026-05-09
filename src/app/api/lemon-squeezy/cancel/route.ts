// src/app/api/lemon-squeezy/cancel/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { cancelSubscription, lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

// Initialize LS
lemonSqueezySetup({
  apiKey: process.env.LEMON_SQUEEZY_API_KEY,
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
      select: { lemonSqueezySubscriptionId: true }
    });

    if (!user?.lemonSqueezySubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Lemon Squeezy cancellation
    const { error } = await cancelSubscription(user.lemonSqueezySubscriptionId);
    
    if (error) {
        console.error('LS Cancel Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { cancelAtPeriodEnd: true }
    });

    return NextResponse.json({ success: true, message: 'Subscription scheduled for cancellation.' });
  } catch (error: any) {
    console.error('Cancel Subscription Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel' }, { status: 500 });
  }
}
