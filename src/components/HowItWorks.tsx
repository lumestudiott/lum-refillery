'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SignInButton, useUser } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Choose your refill rhythm',
    description: 'Tell us your household size, pantry staples, and produce preferences. We build a haul around your life.',
  },
  {
    number: '02',
    title: 'Skip, swap, or add anytime',
    description: 'Keep the subscription flexible with easy changes before every delivery day. No commitments.',
  },
  {
    number: '03',
    title: 'Receive and reuse',
    description: 'Your haul arrives fresh in low-waste packaging that comes back to us next round.',
  },
];

const HowItWorks: React.FC = () => {
  const { isSignedIn } = useUser();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  const ctaButton = (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={isSignedIn ? () => (window.location.href = '/pricing') : undefined}
      className="btn-pill group inline-flex cursor-pointer items-center gap-2.5 bg-white px-8 py-4 text-[15px] font-semibold tracking-tight text-lume-house transition-all hover:bg-white/90"
    >
      See our plans
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </motion.button>
  );

  return (
    <section ref={sectionRef} id="how-it-works" className="relative overflow-hidden scroll-mt-24">

      {/* Background — parallax dark band */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -top-[8%] -bottom-[8%] bg-lume-house" />

      <div className="relative z-10 px-6 py-36 lg:px-16">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/35"
          >
            How it works
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.08] text-white"
          >
            Three steps to a better
            <br />
            grocery routine.
          </motion.h2>

          {/* Steps — oversized numbers with text */}
          <div className="mt-24 grid gap-0 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
                className="border-t border-white/10 pt-10 md:pr-12"
              >
                <span className="font-display text-[72px] font-normal leading-none text-white/[0.07]">
                  {step.number}
                </span>
                <h3 className="mt-[-8px] text-[20px] font-semibold tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-xs text-[15px] leading-[1.75] text-white/50">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 flex gap-4"
          >
            {isSignedIn ? ctaButton : <SignInButton mode="modal">{ctaButton}</SignInButton>}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
