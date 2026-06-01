'use client';

import React from 'react';
import Image from 'next/image';
import { SignInButton, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SubscriptionTier } from '../types/subscription';
import { calculateYearlySavings, getBillingCycleDisplayName } from '../utils/pricing';

interface TierCardProps {
  tier: SubscriptionTier;
  billingCycle: 'fortnightly' | 'monthly' | 'yearly';
  index?: number;
}

const tierImages = [
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=800&q=85',
];

const tierBadges: Record<string, string[]> = {
  supported: ['Care Package', '6 Items', 'Need-based'],
  essential: ['2-3 People', '7 Items', 'Staple Focus'],
  household: ['4-5 People', '9 Items', 'Family Size'],
  premium: ['Organic', '9 Items', 'Artisan'],
  gourmet: ['Chef Grade', '9 Items', 'Specialty'],
  bulk: ['Commercial', '9 Items', 'Restaurant'],
};

const TierCard: React.FC<TierCardProps> = ({ tier, billingCycle, index = 0 }) => {
  const price = tier.price[billingCycle];
  const { isSignedIn, user } = useUser();
  const image = tierImages[index % tierImages.length];
  const isPopular = index === 2;
  const badges = tierBadges[tier.id] || ['Flexible'];

  const [isLoading, setIsLoading] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    setCheckoutError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: tier.id,
          billingCycle,
          customerEmail: user?.emailAddresses[0]?.emailAddress || '',
          customerName: user?.fullName || '',
          clerkUserId: user?.id || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1.0] } }}
      className="relative overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-300 hover:shadow-soft-float"
    >
      {/* Image header */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={image}
          alt={tier.name}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 hover:scale-[1.03]"
        />
        {isPopular && (
          <span className="absolute right-3 top-3 rounded-full bg-lume-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
            Most Popular
          </span>
        )}
      </div>

      {/* Badge row */}
      <div className="flex items-center gap-2 px-5 pt-4">
        {badges.map((badge, i) => (
          <span
            key={i}
            className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
              i === 0
                ? 'bg-lume-accent/10 text-lume-accent'
                : 'bg-black/[0.04] text-text-secondary'
            }`}
          >
            {badge}
          </span>
        ))}
      </div>

      {/* Title + Price row */}
      <div className="flex items-start justify-between gap-3 px-5 pt-3">
        <h3 className="font-display text-[18px] font-medium leading-[1.3] tracking-tight text-text-primary">
          {tier.name}
        </h3>
        <span className="shrink-0 text-[20px] font-semibold tracking-tight text-text-primary">
          ${price.toFixed(2)}
        </span>
      </div>

      {/* Description */}
      <p className="px-5 pt-2 text-[13px] leading-[1.65] text-text-secondary">
        {tier.description}
      </p>

      {/* What's Inside */}
      <div className="mx-5 mt-4 rounded-xl bg-canvas p-4">
        <div className="flex items-center gap-2">
          <h4 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            What's Inside
          </h4>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
            Chilled
          </span>
        </div>
        <ul className="mt-3 space-y-2">
          {tier.items.slice(0, 5).map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-[13px] text-text-secondary">
              <span className="h-1 w-1 rounded-full bg-lume-accent" />
              <span className="font-semibold text-text-primary">{item.quantity} {item.unit}</span>
              <span>{item.name}</span>
            </li>
          ))}
          {tier.items.length > 5 && (
            <li className="text-[12px] text-text-secondary/60">
              +{tier.items.length - 5} more items
            </li>
          )}
        </ul>
      </div>

      {/* Yearly savings */}
      {billingCycle === 'yearly' && (
        <p className="px-5 pt-3 text-[12px] font-medium text-lume-accent">
          Save ${calculateYearlySavings(tier)} per year
        </p>
      )}

      {/* CTA Button */}
      <div className="p-5 pt-4">
        {checkoutError && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
            {checkoutError}
          </p>
        )}

        {isSignedIn ? (
          <button
            onClick={handleStripeCheckout}
            disabled={isLoading}
            className="btn-pill flex w-full cursor-pointer items-center justify-center gap-2 bg-lume-house px-6 py-3.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black active:scale-[0.97]"
          >
            {isLoading ? 'Processing...' : 'Add to Order'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="btn-pill flex w-full cursor-pointer items-center justify-center gap-2 bg-lume-house px-6 py-3.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black active:scale-[0.97]">
              Add to Order
              <ArrowRight className="h-4 w-4" />
            </button>
          </SignInButton>
        )}
      </div>
    </motion.article>
  );
};

export default TierCard;
