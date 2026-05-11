import Stripe from 'stripe';

/**
 * Server-side Stripe instance.
 * Only import this in API routes / server components — never on the client.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});
