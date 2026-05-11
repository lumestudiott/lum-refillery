import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

/**
 * Convex HTTP client for server-side mutations from the webhook handler.
 */
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. Verifies the webhook signature using
 * the STRIPE_WEBHOOK_SECRET to ensure the request is genuinely from Stripe.
 *
 * Supported events:
 *  - checkout.session.completed → activates subscriptions / gift orders
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;

  // ── Verify webhook signature ────────────────────────────────────
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // ── Handle events ───────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};

        if (metadata.type === 'gift') {
          // ── Gift subscription payment completed ───────────────
          await convex.mutation(api.giftSubscriptions.updateGiftSubscriptionByStripeSession, {
            stripeSessionId: session.id,
            paymentId: session.payment_intent as string,
            status: 'paid',
          });

          console.log(`Gift subscription paid: ${metadata.gift_subscription_id}`);
        } else {
          // ── Regular subscription payment completed ────────────
          // Create the subscription in Convex if we have user info
          console.log(
            `Subscription checkout completed: tier=${metadata.tier_id}, ` +
            `cycle=${metadata.billing_cycle}, session=${session.id}`
          );

          // NOTE: The subscription is created client-side after redirect
          // to /success, because we need the authenticated Clerk user context.
          // The webhook confirms the payment was genuine.
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const metadata = session.metadata || {};

        if (metadata.type === 'gift' && metadata.gift_subscription_id) {
          // Mark gift subscription as cancelled if checkout expired
          await convex.mutation(api.giftSubscriptions.updateGiftSubscriptionByStripeSession, {
            stripeSessionId: session.id,
            paymentId: '',
            status: 'cancelled',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
