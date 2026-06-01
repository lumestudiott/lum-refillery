import Stripe from 'stripe';
import { requireEnv } from '@/lib/env';

/**
 * Server-side Stripe instance.
 * Only import this in API routes / server components — never on the client.
 */
export const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
  typescript: true,
});
