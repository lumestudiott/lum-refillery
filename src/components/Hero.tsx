'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SignInButton, useUser } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const { isSignedIn } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay blocked — video will still show first frame
      });
    }
  }, []);

  const handleGetStarted = () => {
    window.location.href = '/pricing';
  };

  const handleLearnMore = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  const primaryButton = (
    <button
      onClick={isSignedIn ? handleGetStarted : undefined}
      className="btn-pill group inline-flex items-center gap-2 bg-lume-accent px-7 py-3.5 text-[15px] font-semibold tracking-tight text-white shadow-frap transition-all hover:bg-lume-green"
    >
      Get Started
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );

  const secondaryButton = (
    <button
      onClick={handleLearnMore}
      className="btn-pill inline-flex items-center gap-2 border border-white/60 bg-transparent px-7 py-3.5 text-[15px] font-semibold tracking-tight text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/10"
    >
      How It Works
    </button>
  );

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-lume-house">
      {/* ── Video Background ── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Overlay ── */}
      <div className="hero-video-overlay absolute inset-0 z-[1]" />

      {/* ── Content ── */}
      <div className="relative z-10 flex min-h-[100dvh] items-center">
        <div className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-4 py-2 text-[13px] font-medium tracking-wide text-white/90 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-lume-accent" />
                Spring 2026 seasonal boxes are here
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35 }}
              className="mt-8 font-display text-[clamp(2.8rem,6vw,5rem)] font-normal leading-[1.1] tracking-snug text-white"
            >
              Groceries refilled
              <br />
              for flavor,{' '}
              <span className="italic text-refill-green">not waste</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.5 }}
              className="mt-6 max-w-xl text-[17px] font-normal leading-[1.7] text-white/75"
            >
              Fresh staples, local produce, and household essentials delivered
              on your schedule — with reusable packaging and no supermarket
              guesswork.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.65 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              {isSignedIn ? (
                primaryButton
              ) : (
                <SignInButton mode="modal">{primaryButton}</SignInButton>
              )}
              {secondaryButton}
            </motion.div>


          </div>
        </div>
      </div>

      {/* ── Bottom scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/50">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-8 w-[1px] bg-gradient-to-b from-white/40 to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
