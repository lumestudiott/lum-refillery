'use client';

import React from 'react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
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

const tierLabels = ['Community', 'Essential', 'Popular', 'Premium', 'Gourmet', 'Bulk'];

const cardPop = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 90, damping: 15 },
  },
};

const TierCard: React.FC<TierCardProps> = ({ tier, billingCycle, index = 0 }) => {
  const price = tier.price[billingCycle];
  const { isSignedIn, user } = useUser();
  const image = tierImages[index % tierImages.length];
  const isPopular = index === 2;

  const [isLoading, setIsLoading] = React.useState(false);

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: tier.id,
          billingCycle,
          customerEmail: user?.emailAddresses[0]?.emailAddress || '',
          customerName: user?.fullName || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = (
    <>
      Start {tier.name}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </>
  );

  const buttonClasses = `btn-pill group mt-6 flex w-full cursor-pointer items-center justify-center gap-2 px-6 py-3.5 text-[14px] font-semibold tracking-tight transition-all ${
    isPopular
      ? 'bg-lume-accent text-white hover:bg-lume-green'
      : 'border border-lume-accent/20 bg-transparent text-lume-accent hover:border-lume-accent hover:bg-lume-accent/5'
  }`;

  return (
    <motion.article
      variants={cardPop}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className={`relative overflow-hidden rounded-card bg-white shadow-card transition-shadow duration-300 hover:shadow-soft-float ${
        isPopular ? 'ring-2 ring-lume-accent' : ''
      }`}
    >
      {/* Image header */}
      <div className="relative h-44 overflow-hidden">
        <motion.img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute bottom-4 left-5 rounded-pill bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-primary backdrop-blur-sm">
          {tierLabels[index] || 'Flexible'}
        </span>
        {isPopular && (
          <span className="absolute right-4 top-4 rounded-pill bg-lume-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
            Most popular
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-display text-[22px] font-normal tracking-snug text-text-primary">
          {tier.name}
        </h3>
        <p className="mt-2 min-h-[48px] text-[13px] leading-[1.65] text-text-secondary">
          {tier.description}
        </p>

        {/* Price */}
        <div className="mt-5 flex items-baseline gap-1.5">
          <span className="text-[32px] font-semibold tracking-tight text-text-primary">
            ${price.toFixed(2)}
          </span>
          <span className="text-[13px] text-text-secondary">
            / {getBillingCycleDisplayName(billingCycle)}
          </span>
        </div>
        {billingCycle === 'yearly' && (
          <p className="mt-1.5 text-[13px] font-medium text-lume-accent">
            Save ${calculateYearlySavings(tier)} versus monthly
          </p>
        )}

        {/* Items list */}
        <div className="mt-5 rounded-[10px] bg-canvas p-4">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-text-secondary">
            Inside this haul
          </p>
          <ul className="space-y-2">
            {tier.items.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-start gap-2.5 text-[13px] leading-[1.5] text-text-secondary">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lume-accent" />
                <span>
                  <span className="font-semibold text-text-primary">{item.quantity} {item.unit}</span>{' '}
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {isSignedIn ? (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={handleStripeCheckout} disabled={isLoading} className={buttonClasses}>
            {buttonContent}
          </motion.button>
        ) : (
          <SignInButton mode="modal">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className={buttonClasses}>
              {buttonContent}
            </motion.button>
          </SignInButton>
        )}
      </div>
    </motion.article>
  );
};

export default TierCard;
