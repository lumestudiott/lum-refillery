import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * Client-side Stripe.js loader (singleton).
 * Safe to import in client components — uses the publishable key only.
 */
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};
