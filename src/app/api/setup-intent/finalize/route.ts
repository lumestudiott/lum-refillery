import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { getServerConvexUrl } from '@/lib/env';

/**
 * POST /api/setup-intent/finalize
 *
 * Called by the client after a SetupIntent is confirmed. Sets the saved card
 * as the customer's default payment method so a later subscription/shop
 * checkout reuses it (no charge happens here). Body: { setupIntentId }.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in first' }, { status: 401 });
    }

    const { setupIntentId } = (await request.json()) as { setupIntentId?: string };
    if (!setupIntentId) {
      return NextResponse.json({ error: 'Missing setupIntentId' }, { status: 400 });
    }

    const convexToken = await getToken({ template: 'convex' });
    if (!convexToken) {
      return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
    }
    const convex = new ConvexHttpClient(getServerConvexUrl());
    convex.setAuth(convexToken);

    const me = await convex.query(api.users.getUserByClerkId, { clerkId: userId });
    const customerId = me?.stripeCustomerId;
    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 });
    }

    // Verify the SetupIntent belongs to this customer before trusting it.
    const si = await stripe.setupIntents.retrieve(setupIntentId);
    if (si.customer !== customerId || si.status !== 'succeeded') {
      return NextResponse.json({ error: 'Invalid setup intent' }, { status: 400 });
    }
    const paymentMethod =
      typeof si.payment_method === 'string' ? si.payment_method : si.payment_method?.id;
    if (!paymentMethod) {
      return NextResponse.json({ error: 'No payment method on setup intent' }, { status: 400 });
    }

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethod },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('SetupIntent finalize error:', err);
    return NextResponse.json({ error: 'Unable to save default card' }, { status: 500 });
  }
}
