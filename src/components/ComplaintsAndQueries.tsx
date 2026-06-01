'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, MessageCircle } from 'lucide-react';
import Reveal from './Reveal';

const cards = [
  {
    icon: AlertCircle,
    title: 'File a Complaint',
    description:
      'Received an error in your order or something wasn\u2019t right? Let us know and we\u2019ll make it right.',
    href: '/complaints',
    label: 'Open Complaints Form',
  },
  {
    icon: MessageCircle,
    title: 'Contact Us',
    description:
      'Have a general query about our products, services, or partnerships? We\u2019d love to hear from you.',
    href: '/contact-us',
    label: 'Open Contact Form',
  },
] as const;

const ComplaintsAndQueries: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-lume-house px-6 py-28 lg:px-16">

      {/* Subtle background watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="whitespace-nowrap font-display text-[clamp(8rem,20vw,18rem)] font-normal leading-none text-white/[0.02]">
          We Care
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <Reveal
          as="p"
          duration={1200}
          className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/30"
        >
          We&apos;re Listening
        </Reveal>

        <Reveal
          as="h2"
          direction="up"
          duration={1000}
          delay={100}
          className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] text-white"
        >
          Something not right?
          <br />
          Let&apos;s fix it.
        </Reveal>

        <Reveal
          as="p"
          direction="none"
          duration={800}
          delay={200}
          className="mx-auto mt-6 max-w-xl text-[16px] leading-[1.8] text-white/45"
        >
          If for some reason you received an error in your order or are
          unsatisfied, please accept our apology. Everyone is essential to us.
          That&apos;s why we&apos;ve made it easy to reach us.
        </Reveal>

        {/* ── Two-card grid ── */}
        <div className="mx-auto mt-14 grid max-w-2xl gap-6 sm:grid-cols-2">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Reveal
                key={card.title}
                direction="up"
                duration={800}
                delay={300 + index * 150}
              >
                <Link
                  href={card.href}
                  aria-label={card.label}
                  className="group flex flex-col items-center rounded-2xl border border-white/[0.08] bg-white/[0.06] p-8 text-center backdrop-blur-sm transition-all duration-[var(--duration-deliberate)] ease-[var(--ease-settle)] hover:border-white/[0.15] hover:bg-white/[0.10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-5 w-5 text-white/70" strokeWidth={1.5} />
                  </div>

                  <h3 className="mt-5 text-[18px] font-semibold tracking-tight text-white">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-[14px] leading-[1.7] text-white/50">
                    {card.description}
                  </p>

                  <span className="btn-pill mt-6 inline-flex items-center gap-2 bg-white px-6 py-2.5 text-[13px] font-semibold tracking-tight text-lume-house transition-colors duration-[var(--duration-fast)] group-hover:bg-white/90">
                    {card.label}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Respect line */}
        <Reveal direction="none" duration={800} delay={400}>
          <p className="mt-10 text-[13px] text-white/25">
            We simply ask that you are respectful in doing so.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default ComplaintsAndQueries;
