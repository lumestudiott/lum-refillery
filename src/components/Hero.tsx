'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SignInButton, useUser } from '@clerk/nextjs';
import { ShoppingCart, Leaf } from 'lucide-react';

const Hero: React.FC = () => {
  const { isSignedIn } = useUser();
  const handleGetStarted = () => {
    window.location.href = '/shop';
  };

  const shopButton = (
    <button
      onClick={handleGetStarted}
      className="btn-pill group inline-flex items-center gap-2 bg-lume-accent px-7 py-3.5 text-[15px] font-semibold tracking-tight text-white shadow-frap transition-all hover:bg-lume-green"
    >
      Browse
      <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />
    </button>
  );

  return (
    <section className="relative overflow-hidden bg-canvas">
      {/* ── Floating accent shapes ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Top-left large soft blob */}
        <div
          className="absolute -left-20 -top-20 h-72 w-72 opacity-[0.07] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-lume-accent) 0%, transparent 70%)' }}
        />
        {/* Mid-left small dot */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[8%] top-[55%] h-3 w-3 rounded-full bg-lume-accent/20"
          style={{ borderRadius: '60% 40% 50% 50%' }}
        />
        {/* Bottom-left medium blob */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-10 left-[12%] h-48 w-48 opacity-[0.05] blur-2xl"
          style={{ background: 'radial-gradient(circle, var(--color-lume-green) 0%, transparent 70%)' }}
        />
        {/* Top-right small dot */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute right-[15%] top-[18%] h-2 w-2 rounded-full bg-lume-accent/15"
        />
        {/* Center-right medium blob */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -right-16 top-[40%] h-56 w-56 opacity-[0.06] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-lume-accent) 0%, transparent 70%)' }}
        />
        {/* Bottom-right small dot */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[20%] right-[25%] h-2.5 w-2.5 rounded-full bg-lume-green/20"
          style={{ borderRadius: '40% 60% 50% 50%' }}
        />
        {/* Bottom-center soft wash */}
        <div
          className="absolute -bottom-24 left-1/2 h-64 w-96 -translate-x-1/2 opacity-[0.04] blur-3xl"
          style={{ background: 'radial-gradient(ellipse, var(--color-lume-accent) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Content ── */}
      <div className="pt-40 pb-28 lg:pt-48 lg:pb-40 flex items-center min-h-[85vh]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          {/* Text */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-[16px] font-display text-lume-accent">
              <Leaf className="h-4.5 w-4.5 text-lume-accent" />
              <span>Thoughtfully Sourced</span>
            </div>

            <h1 className="mt-4 font-display text-[clamp(2.8rem,6vw,5rem)] font-normal leading-[1.1] tracking-snug text-text-primary">
              Just Food
              <br />
              <span className="text-lume-accent">
                Built For <span className="">Your Table</span>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[17px] font-normal leading-[1.7] text-text-secondary">
              Reliable grocery subscriptions, thoughtfully built for everyday tables.
            </p>

            <div className="mt-10">
              {isSignedIn ? (
                shopButton
              ) : (
                <SignInButton mode="modal">{shopButton}</SignInButton>
              )}
            </div>
          </div>

          {/* Video blob */}
          <div className="flex items-center justify-center">
            <div
              className="relative h-[260px] w-[260px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] sm:h-[340px] sm:w-[340px] md:h-[420px] md:w-[420px] lg:h-[560px] lg:w-[560px]"
              style={{ borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%' }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/videos/hero-blob.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
