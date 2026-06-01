'use client';

import React from 'react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

const steps = [
  {
    number: '01',
    title: 'Subscribe and customize',
    description:
      'Based on your household size and preferences, subscribe to a tailored haul and easily add your favorite extra items.',
    blob: '60% 40% 70% 30% / 50% 60% 40% 50%',
    icon: '/icons/shopping-basket.png',
  },
  {
    number: '02',
    title: 'Flexible changes',
    description:
      'Add or change items before your delivery. Keep in mind there is a 2-day cancellation window.',
    blob: '40% 60% 30% 70% / 55% 45% 60% 40%',
    icon: '/icons/switch.png',
  },
  {
    number: '03',
    title: 'Receive and reuse',
    description:
      'Receive your items the next day. Your haul arrives fresh in low-waste packaging that comes back to us next round.',
    blob: '50% 50% 60% 40% / 40% 65% 35% 60%',
    icon: '/icons/shipped.png',
  },
];

/**
 * Still `'use client'` only because of `useUser()` from Clerk — everything
 * visual is plain CSS + `<Reveal>`, no framer-motion.
 */
const HowItWorks: React.FC = () => {
  const { isSignedIn } = useUser();

  const ctaButton = (
    <button
      onClick={isSignedIn ? () => (window.location.href = '/sample-hauls') : undefined}
      className="btn-pill group inline-flex cursor-pointer items-center gap-2.5 bg-lume-house px-8 py-4 text-[15px] font-semibold tracking-tight text-white transition-all hover:bg-lume-accent shadow-soft-float"
    >
      See our plans
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </button>
  );

  return (
    <>
      {/* ── Top wave: cream → green transition (in-flow, not absolute) ── */}
      <div className="w-full leading-[0] pointer-events-none bg-canvas" aria-hidden="true">
        <svg
          viewBox="0 0 1440 30"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-[15px] md:h-[20px] lg:h-[25px]"
        >
          <path
            d="M0,15 Q60,30 120,15 T240,15 T360,15 T480,15 T600,15 T720,15 T840,15 T960,15 T1080,15 T1200,15 T1320,15 T1440,15 L1440,30 L0,30 Z"
            fill="rgba(218, 178, 87, 0.4)"
          />
        </svg>
      </div>

      <section
        id="how-it-works"
        className="scroll-mt-24"
        style={{ backgroundColor: 'rgba(218, 178, 87, 0.4)' }}
      >
        <div className="px-6 py-12 lg:px-16 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <Reveal as="p" duration={1200} className="text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-900/60">
              How it works
            </Reveal>

            <Reveal
              as="h2"
              duration={1000}
              rootMargin="0px 0px -60px 0px"
              className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.08] text-stone-900"
            >
              Three steps to a better
              <br />
              grocery routine.
            </Reveal>

            <div className="mt-12 md:mt-16 grid gap-12 md:gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <Reveal
                  key={step.number}
                  duration={900}
                  delay={index * 150}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className="mb-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ceramic"
                  >
                    <span className="font-display text-[22px] text-lume-accent">{step.number}</span>
                  </div>
                  <h3 className="text-[20px] font-bold tracking-tight text-stone-900">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-xs text-[15px] leading-[1.75] text-stone-900/75">
                    {step.description}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal duration={800} delay={500} className="mt-12 flex gap-4">
              {isSignedIn ? ctaButton : <SignInButton mode="modal">{ctaButton}</SignInButton>}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Bottom wave: green → cream transition (in-flow, not absolute) ── */}
      <div className="w-full leading-[0] pointer-events-none bg-canvas" aria-hidden="true">
        <svg
          viewBox="0 0 1440 30"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-[15px] md:h-[20px] lg:h-[25px]"
        >
          <path
            d="M0,15 Q60,30 120,15 T240,15 T360,15 T480,15 T600,15 T720,15 T840,15 T960,15 T1080,15 T1200,15 T1320,15 T1440,15 L1440,0 L0,0 Z"
            fill="rgba(218, 178, 87, 0.4)"
          />
        </svg>
      </div>
    </>
  );
};

export default HowItWorks;
