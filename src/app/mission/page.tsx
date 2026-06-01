'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-canvas text-lume-house selection:bg-lume-house selection:text-canvas flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden pt-[116px] flex flex-col justify-center">
        {/* ── Floating accent shapes (Swirly Background) ── */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {/* Top-left large soft blob */}
          <div
            className="absolute -left-20 top-0 h-[600px] w-[600px] opacity-[0.06] blur-[120px]"
            style={{ background: 'radial-gradient(circle, var(--color-lume-accent) 0%, transparent 70%)' }}
          />
          {/* Bottom-right medium blob */}
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-20 right-0 h-[700px] w-[700px] opacity-[0.05] blur-[100px]"
            style={{ background: 'radial-gradient(circle, var(--color-lume-green) 0%, transparent 70%)' }}
          />
          {/* Center soft wash */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.03, 0.05, 0.03] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 blur-[120px]"
            style={{ background: 'radial-gradient(ellipse, var(--color-lume-accent) 0%, transparent 70%)' }}
          />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 md:py-32 text-center lg:px-16 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="block text-[13px] font-bold uppercase tracking-[0.2em] text-lume-accent mb-6"
          >
            Mission
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.2] tracking-tight text-text-primary mb-10 max-w-3xl"
          >
            To offer the best experience in food and beverage retail—one that meets you where you are.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-2xl text-[16px] md:text-[17px] leading-[1.8] text-text-secondary text-justify sm:text-center"
          >
            With the resources, technology, and commitment we have right now, Lumë is on a mission to make grocery shopping simpler, smarter, and more intentional for the Essential Adult. We trade you back your time and mental energy so you can focus on what actually matters: building safer, healthier, and more nourishing spaces for yourself and the people you love.
          </motion.p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
