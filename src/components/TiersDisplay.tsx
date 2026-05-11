'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SUBSCRIPTION_TIERS } from '../data/tiers';
import TierCard from './TierCard';

const cycles = [
  { id: 'fortnightly', label: 'Fortnightly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const containerStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const TiersDisplay: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'fortnightly' | 'monthly' | 'yearly'>('monthly');

  return (
    <section className="overflow-hidden bg-canvas px-6 py-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-block text-[13px] font-medium uppercase tracking-[0.15em] text-lume-accent">
            Pricing
          </span>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.15] tracking-snug text-text-primary">
            Choose a haul that fits your home
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-[1.75] text-text-secondary">
            Transparent pricing, flexible delivery, and enough variety to make the weekly restock feel less routine.
          </p>

          {/* Billing cycle toggle — pill switcher */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.3 }}
            className="mt-9 inline-flex rounded-pill bg-white p-1.5 shadow-card"
          >
            {cycles.map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => setBillingCycle(cycle.id)}
                className={`cursor-pointer rounded-pill px-5 py-2.5 text-[13px] font-semibold tracking-tight transition-all duration-200 ${
                  billingCycle === cycle.id
                    ? 'bg-lume-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {cycle.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={containerStagger}
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {SUBSCRIPTION_TIERS.map((tier, index) => (
            <TierCard key={tier.id} tier={tier} billingCycle={billingCycle} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TiersDisplay;
