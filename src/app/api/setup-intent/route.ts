import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { getServerConvexUrl } from '@/lib/env';

/**
 * POST /api/setup-intent
 *
 * Creates a Stripe SetupIntent so the onboarding Payment step can save a
 * card on file **without charging** anything. Steps:
 *   1. Auth-gate (Clerk).
 *   2. Ensure the user has a Stripe Customer (lazy-create + persist on
 *      `users.stripeCustomerId`).
 *   3. Create a SetupIntent for that customer and return its client secret
 *      for Stripe Elements to confirm client-side.
 */
export async function POST() {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in first' }, { status: 401 });
    }

    const convexToken = await getToken({ template: 'convex' });
    if (!convexToken) {
      return NextResponse.json(
        { error: 'Failed to mint Convex auth token' },
        { status: 500 }
      );
    }
    const convex = new ConvexHttpClient(getServerConvexUrl());
    convex.setAuth(convexToken);

    // ── Stripe customer (lazy create + persist) ─────────────────
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
      await convex.mutation(api.users.setMyStripeCustomerId, {
        stripeCustomerId: customer.id,
      });
    }

    // ── SetupIntent — saves a card, charges nothing ─────────────
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      usage: 'off_session',
      automatic_payment_methods: { enabled: true },
      metadata: { clerk_user_id: userId },
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error('SetupIntent error:', err);
    return NextResponse.json(
      { error: 'Unable to start payment setup' },
      { status: 500 }
    );
  }
}
