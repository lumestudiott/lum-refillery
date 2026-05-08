'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SignInButton, useUser } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

const pressItems = [
  'Fresh Weekly Finds',
  'Local Farms',
  'Low-Waste Staples',
  'Reusable Packaging',
  'Flexible Refills',
  'Budget-Friendly Hauls',
  'Pantry Classics',
  'Island Produce',
];

const Hero: React.FC = () => {
  const { isSignedIn } = useUser();

  const signedInButton = (
    <button
      onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
      className="group mx-auto flex w-full max-w-[280px] cursor-pointer items-center justify-center gap-2 rounded border-2 border-refill-ink bg-refill-yellow px-8 py-4 text-lg font-black text-refill-ink shadow-[4px_4px_0_0_#2B2B2B] transition-transform hover:-translate-y-0.5 sm:w-auto"
    >
      Get Started
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </button>
  );

  const signInButton = (
    <button className="group mx-auto flex w-full max-w-[280px] cursor-pointer items-center justify-center gap-2 rounded border-2 border-refill-ink bg-refill-yellow px-8 py-4 text-lg font-black text-refill-ink shadow-[4px_4px_0_0_#2B2B2B] transition-transform hover:-translate-y-0.5 sm:w-auto">
      Get Started
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </button>
  );

  return (
    <section className="relative overflow-hidden bg-cream-50 pt-[72px]">
      <div className="relative min-h-[720px] overflow-hidden md:min-h-[820px]">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=85"
          alt="Fresh refill groceries and produce"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-refill-ink/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,249,237,0.08),rgba(43,43,43,0.34))]" />

        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center text-white md:min-h-[820px]">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-5 rounded-full border border-white/40 bg-white/10 px-5 py-2 text-sm font-extrabold uppercase tracking-[0.14em] backdrop-blur"
          >
            Better groceries, fewer throwaways
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="max-w-5xl font-display text-5xl font-black leading-[0.96] tracking-normal drop-shadow-lg sm:text-6xl md:text-8xl"
          >
            Groceries refilled for flavor, not waste
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="mt-7 max-w-3xl text-lg font-semibold leading-relaxed text-white md:text-2xl"
          >
            Fresh staples, local produce, and household essentials delivered on your schedule with reusable packaging and no supermarket guesswork.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3 }}
            className="mt-9"
          >
            {isSignedIn ? signedInButton : <SignInButton mode="modal">{signInButton}</SignInButton>}
          </motion.div>
        </div>
      </div>

      <div className="relative overflow-hidden border-y-2 border-refill-ink bg-refill-yellow py-4">
        <div className="ticker-track flex w-max gap-8 whitespace-nowrap text-2xl font-black text-refill-ink md:text-3xl">
          {[...pressItems, ...pressItems].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-8">
              {item}
              <span aria-hidden="true">&bull;</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
