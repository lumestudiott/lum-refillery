'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, CalendarClock, Info, Sparkles, Truck, X } from 'lucide-react';
import Reveal from './Reveal';

const steps = [
  {
    number: '01',
    title: 'Browse',
    description:
      'Discover a curated marketplace of fresh provisions, local makers, and everyday pantry essentials.',
    blob: '60% 40% 70% 30% / 50% 60% 40% 50%',
    icon: '/icons/shopping-basket.png',
  },
  {
    number: '02',
    title: 'Select',
    description:
      'Choose exactly what you need, customize for your household size, and add your favorite locals or brands.',
    blob: '40% 60% 30% 70% / 55% 45% 60% 40%',
    icon: '/icons/switch.png',
  },
  {
    number: '03',
    title: 'Schedule',
    description:
      'Saturday delivery windows. Pick a delivery/restock date that fits your routine. Life changes, so adjusting and managing your window is completely hassle-free.',
    blob: '50% 50% 60% 40% / 40% 65% 35% 60%',
    icon: '/icons/shipped.png',
  },
  {
    number: '04',
    title: 'Checkout',
    description:
      'Receive, reuse, repeat. Complete your order and expect a fresh haul arriving in low-waste packaging on the Saturday schedule you just set.',
    blob: '70% 30% 50% 50% / 45% 55% 50% 50%',
    icon: '/icons/refresh.png',
  },
];

const scheduleDetails = [
  {
    step: '01',
    icon: CalendarClock,
    title: 'Order Cutoff',
    day: 'Tuesday Midnight',
    description:
      "Customize or lock in your weekly haul before Tuesday at 11:59 PM. That's our weekly cutoff to ensure we only harvest what's needed.",
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Sourcing & Packing',
    day: 'Wed – Fri',
    description:
      'We batch-order from our network of local farms and small makers. Your provisions are harvested fresh and prepped in low-waste, reusable packaging.',
  },
  {
    step: '03',
    icon: Truck,
    title: 'Restock Delivery',
    day: 'Saturday Schedule',
    description:
      'Orders arrive at your doorstep in reusable crates. Simply leave last week’s empty bags and jars out for your driver to swap!',
  },
];

const HowItWorks: React.FC = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  useEffect(() => {
    if (!isScheduleOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isScheduleOpen]);

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
              Four steps to a better
              <br />
              grocery routine.
            </Reveal>

            <div className="mt-12 md:mt-16 grid gap-12 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
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

            <Reveal duration={800} delay={500} className="mt-12 flex flex-wrap items-center gap-4">
              <button
                onClick={() => (window.location.href = '/shop?category=hauls')}
                className="btn-pill group inline-flex cursor-pointer items-center gap-2.5 bg-lume-house px-8 py-4 text-[15px] font-semibold tracking-tight text-white transition-all hover:bg-lume-accent shadow-soft-float"
              >
                See our plans
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="btn-pill group inline-flex cursor-pointer items-center gap-2.5 border border-lume-house/20 bg-transparent px-8 py-4 text-[15px] font-semibold tracking-tight text-lume-house transition-all duration-300 hover:border-lume-house/40 hover:bg-lume-house/[0.05]"
              >
                <CalendarClock className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-rotate-[8deg]" strokeWidth={1.8} />
                See the delivery schedule
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {isScheduleOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-lume-house/40 p-4 backdrop-blur-md sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsScheduleOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-modal-title"
        >
          <div className="relative flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] bg-[#FCFBF7] shadow-[0_40px_90px_-24px_rgba(30,57,50,0.45)] ring-1 ring-lume-house/10 animate-in fade-in zoom-in-95 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div className="overflow-y-auto overscroll-contain">
              {/* ── Header ── */}
              <div className="relative px-7 pt-8 sm:px-9 sm:pt-9">
                <button
                  onClick={() => setIsScheduleOpen(false)}
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-lume-house/50 transition-all hover:bg-lume-house/[0.07] hover:text-lume-house"
                  aria-label="Close"
                >
                  <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </button>

                <div className="inline-flex items-center gap-2 rounded-full bg-lume-accent/10 py-1 pl-2.5 pr-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-lume-accent" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-lume-accent">
                    Weekly Restock Cycle
                  </span>
                </div>
                <h3
                  id="schedule-modal-title"
                  className="mt-4 font-display text-[28px] font-normal leading-[1.08] text-stone-900 sm:text-[32px]"
                >
                  How your delivery works
                </h3>
                <p className="mt-2.5 max-w-[44ch] text-[14px] leading-relaxed text-stone-900/55">
                  Harvested to order, delivered fresh - here&rsquo;s the rhythm from cutoff to doorstep.
                </p>
              </div>

              {/* ── Timeline ── */}
              <div className="relative mt-7 px-7 sm:px-9">
                {/* Continuous connector */}
                <div
                  className="absolute left-[51px] top-7 bottom-7 w-[1.5px] bg-gradient-to-b from-lume-accent/50 via-lume-accent/25 to-lume-accent/10 sm:left-[59px]"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-3.5">
                  {scheduleDetails.map((detail) => (
                    <div key={detail.title} className="relative flex items-stretch gap-4">
                      {/* Icon node */}
                      <div className="relative z-10 mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lume-accent to-lume-house text-white shadow-[0_12px_24px_-8px_rgba(0,117,74,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] ring-4 ring-[#FCFBF7]">
                        <detail.icon className="h-5 w-5" strokeWidth={1.75} />
                      </div>

                      {/* Card */}
                      <div className="flex-1 rounded-2xl border border-lume-house/[0.07] bg-gradient-to-b from-white to-[#FBFAF5] p-4 shadow-[0_1px_2px_rgba(30,57,50,0.04),0_10px_24px_-16px_rgba(30,57,50,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:border-lume-house/[0.12] hover:shadow-[0_2px_5px_rgba(30,57,50,0.05),0_20px_40px_-18px_rgba(30,57,50,0.30)]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-lume-accent">
                            {detail.day}
                          </span>
                          <span className="font-display text-[13px] leading-none text-stone-900/25">
                            {detail.step}
                          </span>
                        </div>
                        <h4 className="mt-2 text-[16.5px] font-semibold tracking-tight text-stone-900">
                          {detail.title}
                        </h4>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-stone-900/60">
                          {detail.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Flexibility footer ── */}
              <div className="px-7 pb-8 pt-5 sm:px-9">
                <div className="flex items-start gap-3.5 rounded-2xl border border-lume-house/[0.06] bg-gradient-to-b from-white to-[#F6F4EE] p-4 shadow-[0_1px_2px_rgba(30,57,50,0.03)]">
                  <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lume-house/[0.07] text-lume-house/55">
                    <Info className="h-[13px] w-[13px]" strokeWidth={2} />
                  </span>
                  <p className="text-[12.5px] leading-relaxed text-stone-900/60">
                    <span className="font-semibold text-stone-900/85">Plans stay flexible.</span>{' '}
                    Subscriptions have a 7-day window after your weekly reminder to pause or edit. One-time orders adjust up to 24 hours before the Tuesday cutoff. See our{' '}
                    <a href="/faq" className="font-semibold text-lume-accent underline-offset-2 hover:underline">
                      FAQ
                    </a>{' '}
                    for full details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
