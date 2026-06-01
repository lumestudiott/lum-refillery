import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { getServerConvexUrl } from '@/lib/env';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const convex = new ConvexHttpClient(getServerConvexUrl());
    const type = session.metadata?.type || 'subscription';
    const subscription = type === 'subscription'
      ? await convex.query(api.subscriptions.getSubscriptionByStripeSession, { stripeSessionId: session.id })
      : null;

    return NextResponse.json({
      id: session.id,
      paymentStatus: session.payment_status,
      status: session.status,
      type,
      fulfilled: type === 'subscription' ? Boolean(subscription) : session.payment_status === 'paid',
    });
  } catch (error) {
    console.error('Stripe session verification error:', error);
    return NextResponse.json({ error: 'Unable to verify checkout session' }, { status: 500 });
  }
}
