import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { getServerConvexUrl } from '@/lib/env';

/**
 * POST /api/checkout/gift
 * Creates a Stripe Checkout Session for gift subscriptions.
 *
 * Body: {
 *   tierId, billingCycle, giftSubscriptionId,
 *   giverName, giverEmail,
 *   recipientName, recipientEmail
 * }
 *
 * Auth: requires a signed-in Clerk user whose primary email matches the
 * `giverEmail` recorded on the gift subscription. This prevents
 * unauthenticated session creation and ownership spoofing.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Auth gate ─────────────────────────────────────────────────
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to send a gift' }, { status: 401 });
    }

    const user = await currentUser();
    const authedEmail = user?.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress?.toLowerCase();
    if (!authedEmail) {
      return NextResponse.json({ error: 'No primary email on account' }, { status: 400 });
    }

    // Fetch a Convex-templated Clerk JWT so the Convex mutation below
    // sees the authenticated identity (and can enforce ownership).
    const convexToken = await getToken({ template: 'convex' });
    if (!convexToken) {
      return NextResponse.json(
        { error: 'Failed to mint Convex auth token' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      tierId,
      billingCycle,
      giftSubscriptionId,
      giverName,
      giverEmail,
      recipientName,
      recipientEmail,
    } = body;

    // ── Ownership check: giverEmail on body must match Clerk email ─
    if (
      typeof giverEmail !== 'string' ||
      giverEmail.toLowerCase() !== authedEmail
    ) {
      return NextResponse.json(
        { error: 'giverEmail must match your account email' },
        { status: 403 }
      );
    }

    // ── Validate tier ───────────────────────────────────────────────
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const validCycles = ['fortnightly', 'monthly', 'yearly'] as const;
    if (!validCycles.includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    // ── Server-side price lookup ────────────────────────────────────
    const price = tier.price[billingCycle as keyof typeof tier.price];
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const convex = new ConvexHttpClient(getServerConvexUrl());
    convex.setAuth(convexToken);

    // ── Create Stripe Checkout Session ──────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: giverEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Gift: ${tier.name}`,
              description: `Gift subscription for ${recipientName} — ${tier.name} (${billingCycle})`,
              metadata: {
                tier_id: tier.id,
                billing_cycle: billingCycle,
              },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        tier_id: tier.id,
        billing_cycle: billingCycle,
        gift_subscription_id: giftSubscriptionId,
        giver_name: giverName || '',
        giver_email: giverEmail || '',
        recipient_name: recipientName || '',
        recipient_email: recipientEmail || '',
        type: 'gift',
      },
      success_url: `${appUrl}/gift-success?session_id={CHECKOUT_SESSION_ID}&gift_id=${giftSubscriptionId}`,
      cancel_url: `${appUrl}/gift`,
    });

    await convex.mutation(api.giftSubscriptions.attachStripeSessionToGift, {
      id: giftSubscriptionId,
      stripeSessionId: session.id,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe gift checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create gift checkout session' },
      { status: 500 }
    );
  }
}
