'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Sparkles, Gift, CalendarHeart, Sparkle } from 'lucide-react';
import { SignInButton, useUser } from '@clerk/nextjs';

export default function BirthdayClubPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-canvas text-lume-house selection:bg-lume-house selection:text-canvas flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden pt-[116px]">
        {/* ── Background Gradients ── */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute -left-40 top-0 h-[800px] w-[800px] opacity-[0.08] blur-[120px]"
            style={{ background: 'radial-gradient(circle, var(--color-refill-pink) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-40 -right-20 h-[900px] w-[900px] opacity-[0.06] blur-[140px]"
            style={{ background: 'radial-gradient(circle, var(--color-refill-peach) 0%, transparent 70%)' }}
          />
        </div>

        {/* ── Hero Section ── */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-24 md:pt-32 md:pb-32 lg:px-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-refill-pink/20 to-refill-peach/20 shadow-[0_0_30px_rgba(232,130,155,0.2)]"
          >
            <Sparkles className="h-7 w-7 text-refill-pink" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.5rem,5vw,4rem)] font-normal leading-[1.1] tracking-tight text-text-primary mb-6"
          >
            The Birthday Club
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl text-[17px] md:text-[19px] leading-[1.7] text-text-secondary"
          >
            A way to mark your milestones with a system that celebrates you. Gain access to 
            <span className="text-lume-house font-medium"> The Birthday Box</span>, a curated, elevated haul designed to make your special day effortless and memorable.
          </motion.p>

          {!isSignedIn && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <SignInButton mode="modal">
                <button className="group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-refill-pink/30 bg-gradient-to-r from-refill-pink/10 to-refill-peach/10 px-8 py-3.5 text-[15px] font-semibold text-refill-pink transition-all duration-300 hover:border-refill-pink/50 hover:from-refill-pink/20 hover:to-refill-peach/20 hover:shadow-[0_0_20px_rgba(232,130,155,0.25)] active:scale-[0.98]">
                  <span className="relative z-10">Join the Club</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </button>
              </SignInButton>
            </motion.div>
          )}
        </div>

        {/* ── Details Section ── */}
        <div className="relative z-10 bg-canvas-warm/30 py-24 border-y border-black/5">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="grid gap-12 md:grid-cols-3">
              {/* Feature 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="flex flex-col items-center text-center p-6"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[16px] bg-white shadow-soft-float">
                  <Gift className="h-6 w-6 text-lume-accent" />
                </div>
                <h3 className="font-display text-[22px] text-text-primary mb-3">Curated Curation</h3>
                <p className="text-[15px] leading-relaxed text-text-secondary">
                  We handle the curation and selection, ensuring your gift arrives as a complete, ready-to-use foundation for your wellness.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="flex flex-col items-center text-center p-6"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[16px] bg-white shadow-soft-float">
                  <CalendarHeart className="h-6 w-6 text-lume-accent" />
                </div>
                <h3 className="font-display text-[22px] text-text-primary mb-3">Saturday Delivery</h3>
                <p className="text-[15px] leading-relaxed text-text-secondary">
                  Enjoy the convenience of seamless Saturday delivery, right in time for your weekend celebrations and downtime.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-col items-center text-center p-6"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[16px] bg-white shadow-soft-float">
                  <Sparkle className="h-6 w-6 text-lume-accent" />
                </div>
                <h3 className="font-display text-[22px] text-text-primary mb-3">Effortless Joy</h3>
                <p className="text-[15px] leading-relaxed text-text-secondary">
                  Our way of ensuring that even on your personal day, your foundations remain solid while you take the time to celebrate.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
