'use client';

import React from 'react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Check, Package } from 'lucide-react';
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

const colors = ['bg-refill-yellow', 'bg-refill-peach', 'bg-refill-green', 'bg-[#F5D996]', 'bg-white', 'bg-refill-yellow'];

const TierCard: React.FC<TierCardProps> = ({ tier, billingCycle, index = 0 }) => {
  const price = tier.price[billingCycle];
  const { isSignedIn, user } = useUser();
  const image = tierImages[index % tierImages.length];
  const color = colors[index % colors.length];

  const handleWiiPayCheckout = () => {
    const checkoutData = {
      amount: price,
      currency: 'USD',
      description: `${tier.name} - ${billingCycle} subscription`,
      billing_cycle: billingCycle,
      tier_id: tier.id,
      tier_name: tier.name,
      customer_email: user?.emailAddresses[0]?.emailAddress || '',
      customer_name: user?.fullName || '',
      items: tier.items,
      merchant_id: process.env.NEXT_PUBLIC_WIIPAY_MERCHANT_ID,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/cancel`,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/webhook/wiipay`,
    };

    const wiipayCheckoutUrl = process.env.NEXT_PUBLIC_WIIPAY_CHECKOUT_URL || 'https://checkout.wiipay.com/v1/checkout';
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = wiipayCheckoutUrl;

    Object.entries(checkoutData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = typeof value === 'object' ? JSON.stringify(value) : value?.toString() || '';
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const checkoutButton = (
    <button
      onClick={handleWiiPayCheckout}
      className="mt-6 w-full cursor-pointer rounded border-2 border-refill-ink bg-refill-yellow px-6 py-3 text-base font-black text-refill-ink shadow-[3px_3px_0_0_#2B2B2B] transition-transform hover:-translate-y-0.5"
    >
      Start {tier.name}
    </button>
  );

  const signInButton = (
    <button className="mt-6 w-full cursor-pointer rounded border-2 border-refill-ink bg-refill-yellow px-6 py-3 text-base font-black text-refill-ink shadow-[3px_3px_0_0_#2B2B2B] transition-transform hover:-translate-y-0.5">
      Start {tier.name}
    </button>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="overflow-hidden rounded-lg bg-white shadow-soft-float"
    >
      <div className={`${color} relative h-52 overflow-hidden`}>
        <img src={image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
        <div className="absolute left-5 top-5 rounded-full border-2 border-refill-ink bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.08em]">
          {index === 0 ? 'Community' : index === 2 ? 'Popular' : 'Flexible'}
        </div>
      </div>

      <div className="p-7">
        <h3 className="font-display text-3xl font-black tracking-normal">{tier.name}</h3>
        <p className="mt-3 min-h-[72px] text-base leading-relaxed text-refill-ink/70">{tier.description}</p>

        <div className="mt-6 flex items-end gap-2">
          <span className="text-4xl font-black">${price.toFixed(2)}</span>
          <span className="pb-1 text-sm font-bold text-refill-ink/60">/ {getBillingCycleDisplayName(billingCycle)}</span>
        </div>
        {billingCycle === 'yearly' && (
          <p className="mt-2 text-sm font-black text-forest-800">Save ${calculateYearlySavings(tier)} versus monthly</p>
        )}

        <div className="mt-6 rounded-lg bg-cream-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black">
            <Package className="h-4 w-4" />
            Inside this haul
          </div>
          <ul className="space-y-2">
            {tier.items.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm leading-relaxed text-refill-ink/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-800" />
                <span>
                  <span className="font-black text-refill-ink">{item.quantity} {item.unit}</span> {item.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {isSignedIn ? checkoutButton : <SignInButton mode="modal">{signInButton}</SignInButton>}
      </div>
    </motion.article>
  );
};

export default TierCard;
