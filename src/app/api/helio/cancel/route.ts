import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { helioSubscriptionId: true }
    });

    if (!user?.helioSubscriptionId) {
      return NextResponse.json({ error: 'No active Helio subscription found' }, { status: 404 });
    }

    // For Helio (especially Crypto), cancellation is often handled by the user stopping payments.
    // However, we mark it in our DB so they know it's "scheduled" to end.
    await prisma.user.update({
      where: { id: session.user.id },
      data: { cancelAtPeriodEnd: true }
    });

    // In a real production environment with Helio API access, 
    // you would call the Helio API here to cancel the subscription if it's a card payment.
    console.log(`ℹ️ User ${session.user.id} requested cancellation of Helio subscription ${user.helioSubscriptionId}`);

    return NextResponse.json({ success: true, message: 'Subscription scheduled for cancellation.' });
  } catch (error: any) {
    console.error('Helio Cancel Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel' }, { status: 500 });
  }
}
