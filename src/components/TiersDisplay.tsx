'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../data/tiers';
import TierCard from './TierCard';

const cycles = [
  { id: 'fortnightly', label: 'Fortnightly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
] as const;

const TiersDisplay: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'fortnightly' | 'monthly' | 'yearly'>('monthly');

  return (
    <section className="overflow-hidden bg-refill-blue px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em]">
            <Sparkles className="h-4 w-4 text-copper-600" />
            Shop the refill shelf
          </span>
          <h2 className="mt-6 font-display text-4xl font-black leading-tight tracking-normal md:text-6xl">
            Choose a haul that fits your home
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-refill-ink/80">
            Transparent pricing, flexible delivery, and enough variety to make the weekly restock feel less routine.
          </p>

          <div className="mt-9 inline-flex rounded-full border-2 border-refill-ink bg-cream-50 p-1.5 shadow-[4px_4px_0_0_#2B2B2B]">
            {cycles.map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => setBillingCycle(cycle.id)}
                className={`rounded-full px-4 py-2 text-sm font-black transition-colors sm:px-6 ${
                  billingCycle === cycle.id ? 'bg-refill-yellow text-refill-ink' : 'text-refill-ink/65 hover:text-refill-ink'
                }`}
              >
                {cycle.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SUBSCRIPTION_TIERS.map((tier, index) => (
            <TierCard key={tier.id} tier={tier} billingCycle={billingCycle} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TiersDisplay;
