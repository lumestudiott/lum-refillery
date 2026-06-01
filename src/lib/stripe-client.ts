import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * Client-side Stripe.js loader (singleton).
 * Safe to import in client components — uses the publishable key only.
 */
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
      );
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
