'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas selection:bg-lume-accent/20">
      {/* ── Floating accent shapes (Matching Hero.tsx) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Top-left large soft blob */}
        <div
          className="absolute -left-20 -top-20 h-72 w-72 opacity-[0.07] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-lume-accent) 0%, transparent 70%)' }}
        />
        {/* Mid-left small dot */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[20%] top-[30%] h-3 w-3 rounded-full bg-lume-accent/20"
          style={{ borderRadius: '60% 40% 50% 50%' }}
        />
        {/* Bottom-left medium blob */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-10 left-[12%] h-48 w-48 opacity-[0.05] blur-2xl"
          style={{ background: 'radial-gradient(circle, var(--color-lume-green) 0%, transparent 70%)' }}
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
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Giant Logo Horizontal */}
        <div className="pointer-events-none select-none mb-4 md:mb-8 overflow-visible flex justify-center w-full">
          <h1 className="font-display text-[clamp(5rem,18vw,16rem)] font-normal leading-[0.85] tracking-tight whitespace-nowrap text-text-primary/15">
            Lumë <span className="text-lume-accent/20">Refillery</span>
          </h1>
        </div>
        
        <div className="px-6 max-w-xl flex flex-col items-center">
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-normal leading-[1.1] tracking-snug text-text-primary">
            Page Not Found
          </h2>

          <p className="mt-6 text-[17px] font-normal leading-[1.7] text-text-secondary">
            The page you're looking for couldn't be found. It may have been moved, or the link might be broken.
          </p>

          <div className="mt-10">
            <Link
              href="/"
              className="btn-pill group inline-flex items-center gap-2 bg-lume-accent px-7 py-3.5 text-[15px] font-semibold tracking-tight text-white shadow-frap transition-all hover:bg-lume-green"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
