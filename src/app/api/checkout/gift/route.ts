import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';

/**
 * POST /api/checkout/gift
 * Creates a Stripe Checkout Session for gift subscriptions.
 *
 * Body: {
 *   tierId, billingCycle, giftSubscriptionId,
 *   giverName, giverEmail,
 *   recipientName, recipientEmail
 * }
 */
export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe gift checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create gift checkout session' },
      { status: 500 }
    );
  }
}
