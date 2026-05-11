import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session with server-side price validation.
 *
 * Body: { tierId: string, billingCycle: string, customerEmail?: string, customerName?: string }
 *
 * The price is ALWAYS looked up from the canonical tier data on the server —
 * the client never controls the amount.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tierId, billingCycle, customerEmail, customerName } = body;

    // ── Validate tier ───────────────────────────────────────────────
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const validCycles = ['fortnightly', 'monthly', 'yearly'] as const;
    if (!validCycles.includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    // ── Server-side price lookup (tamper-proof) ─────────────────────
    const price = tier.price[billingCycle as keyof typeof tier.price];
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Invalid price for this tier/cycle' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // ── Create Stripe Checkout Session ──────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: `${tier.name} — ${billingCycle} subscription (${tier.items.length} items)`,
              metadata: {
                tier_id: tier.id,
                billing_cycle: billingCycle,
              },
            },
            unit_amount: Math.round(price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        tier_id: tier.id,
        billing_cycle: billingCycle,
        customer_name: customerName || '',
        type: 'subscription',
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
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
