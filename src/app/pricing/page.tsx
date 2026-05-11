'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import TiersDisplay from '@/components/TiersDisplay';
import Footer from '@/components/Footer';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />

      {/* Page hero */}
      <div className="pt-[72px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-lume-house px-6 py-24 text-center lg:px-10"
        >
          <span className="inline-block text-[13px] font-medium uppercase tracking-[0.15em] text-white/40">
            Plans & Pricing
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-[clamp(2.4rem,5vw,3.6rem)] font-normal leading-[1.1] text-white">
            Choose a haul that fits your home
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-[1.75] text-white/60">
            Transparent pricing, flexible delivery, and enough variety to make the weekly restock feel less routine.
          </p>
        </motion.div>
      </div>

      <TiersDisplay />
      <Footer />
    </div>
  );
}
