'use client';

import React from 'react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { CalendarDays, PackageCheck, SlidersHorizontal } from 'lucide-react';

const steps = [
  {
    icon: SlidersHorizontal,
    title: 'Choose your refill rhythm',
    description: 'Tell us your household size, pantry staples, and produce preferences.',
  },
  {
    icon: CalendarDays,
    title: 'Skip, swap, or add anytime',
    description: 'Keep the subscription flexible with easy changes before delivery day.',
  },
  {
    icon: PackageCheck,
    title: 'Receive and reuse',
    description: 'Your haul arrives fresh in low-waste packaging that comes back next round.',
  },
];

const HowItWorks: React.FC = () => {
  const { isSignedIn } = useUser();

  const cta = (
    <button
      onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
      className="mx-auto mt-12 flex cursor-pointer items-center justify-center rounded border-2 border-refill-ink bg-white px-10 py-4 text-lg font-black text-refill-ink shadow-[4px_4px_0_0_#2B2B2B] transition-transform hover:-translate-y-0.5"
    >
      Learn How It Works
    </button>
  );

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-refill-green py-24 text-refill-ink scroll-mt-24">
      <div className="absolute left-0 right-0 top-0 h-24 -translate-y-1 bg-cream-50 wave-bottom" />
      <div className="absolute bottom-0 left-0 right-0 h-24 translate-y-1 bg-cream-50 wave-top" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-4xl font-black leading-tight tracking-normal md:text-6xl">
            Try our flexible, commitment-free grocery subscription
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="text-center md:text-left">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border-2 border-refill-ink bg-cream-50 md:mx-0">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-refill-yellow text-2xl font-black">
                {index + 1}
              </div>
              <h3 className="text-xl font-black">{step.title}</h3>
              <p className="mt-3 text-lg leading-relaxed text-refill-ink/80">{step.description}</p>
            </article>
          ))}
        </div>

        {isSignedIn ? cta : <SignInButton mode="modal">{cta}</SignInButton>}
      </div>
    </section>
  );
};

export default HowItWorks;
