import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { getServerConvexUrl } from '@/lib/env';

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session in `mode: 'subscription'` so the
 * resulting charge is **recurring**. Steps:
 *   1. Auth-gate (Clerk).
 *   2. Validate tier + cadence; look up canonical unit price server-side.
 *   3. Ensure the user has a Stripe Customer (create on first checkout
 *      and persist the id on `users.stripeCustomerId`).
 *   4. Create the Checkout Session with a single recurring price line
 *      item. The actual Subscription is provisioned by Stripe and
 *      surfaced to us via `customer.subscription.created` webhook into
 *      Convex.
 *
 * Body: { tierId: string, billingCycle: 'weekly'|'biweekly'|'monthly'|'yearly' }
 */
type CadenceInterval = { interval: 'week' | 'month' | 'year'; interval_count: number };

const CADENCE_MAP: Record<string, CadenceInterval> = {
  weekly: { interval: 'week', interval_count: 1 },
  biweekly: { interval: 'week', interval_count: 2 },
  fortnightly: { interval: 'week', interval_count: 2 },
  monthly: { interval: 'month', interval_count: 1 },
  yearly: { interval: 'year', interval_count: 1 },
};

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Sign in before checkout' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tierId, billingCycle } = body as {
      tierId?: string;
      billingCycle?: string;
    };

    // ── Validate tier + cadence ─────────────────────────────────
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }
    if (!billingCycle || !(billingCycle in CADENCE_MAP)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }
    const recurring = CADENCE_MAP[billingCycle];
    const priceDollars = tier.price[billingCycle as keyof typeof tier.price];
    if (typeof priceDollars !== 'number' || priceDollars <= 0) {
      return NextResponse.json(
        { error: 'Invalid price for this tier/cycle' },
        { status: 400 }
      );
    }
    const unitAmountCents = Math.round(priceDollars * 100);

    // ── Stripe customer (lazy create + persist) ─────────────────
    const convexToken = await getToken({ template: 'convex' });
    if (!convexToken) {
      return NextResponse.json(
        { error: 'Failed to mint Convex auth token' },
        { status: 500 }
      );
    }
    const convex = new ConvexHttpClient(getServerConvexUrl());
    convex.setAuth(convexToken);

    // ── Rate Limit Check ──
    const isAllowed = await convex.mutation(api.lib.rateLimit.checkCheckoutLimit, { clerkId: userId });
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many checkout attempts. Please try again later.' }, { status: 429 });
    }

    let stripeCustomerId: string | null = null;
    const me = await convex.query(api.users.getUserByClerkId, {
      clerkId: userId,
    });
    if (me?.stripeCustomerId) {
      stripeCustomerId = me.stripeCustomerId;
    } else {
      const user = await currentUser();
      const email = user?.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId
      )?.emailAddress;
      const customer = await stripe.customers.create({
        email: email ?? undefined,
        name: user?.fullName ?? undefined,
        metadata: { clerk_user_id: userId },
      });
      stripeCustomerId = customer.id;

      // Persist via auth-gated public mutation. The Clerk JWT we set on
      // the client carries the user identity to Convex, which derives
      // the clerk id server-side from `ctx.auth.getUserIdentity()`.
      await convex.mutation(api.users.setMyStripeCustomerId, {
        stripeCustomerId: customer.id,
      });
    }

    // ── Checkout Session ────────────────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: unitAmountCents,
            recurring,
            product_data: {
              name: tier.name,
              description: `${tier.name} — ${billingCycle} subscription`,
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['TT'],
      },
      subscription_data: {
        metadata: {
          tier_id: tier.id,
          billing_cycle: billingCycle,
          clerk_user_id: userId,
        },
      },
      // Top-level metadata gets attached to the Checkout Session itself.
      metadata: {
        tier_id: tier.id,
        billing_cycle: billingCycle,
        clerk_user_id: userId,
        type: 'subscription',
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
    }, {
      idempotencyKey: `sub_checkout_${userId}_${tierId}_${Date.now()}`
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
