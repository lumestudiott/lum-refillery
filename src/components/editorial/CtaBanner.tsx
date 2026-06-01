'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from '../Reveal';

interface CtaBannerProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

const CtaBanner: React.FC<CtaBannerProps> = ({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}) => {
  return (
    <section className="bg-lume-house py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
        {eyebrow && (
          <Reveal
            as="span"
            duration={560}
            className="inline-block text-[13px] font-semibold uppercase tracking-[0.15em] text-white/60"
          >
            {eyebrow}
          </Reveal>
        )}
        <Reveal
          as="h2"
          duration={560}
          delay={80}
          className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.1] tracking-snug text-white"
        >
          {title}
        </Reveal>
        {description && (
          <Reveal
            as="p"
            duration={560}
            delay={160}
            className="mx-auto mt-5 max-w-xl text-[16px] leading-[1.75] text-white/70"
          >
            {description}
          </Reveal>
        )}

        <Reveal
          duration={560}
          delay={240}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href={primaryHref}
            className="btn-pill group inline-flex items-center justify-center gap-2 bg-white px-7 py-3.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-lume-house transition-all hover:bg-lume-accent hover:text-white"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="btn-pill inline-flex items-center justify-center gap-2 border border-white/30 bg-transparent px-7 py-3.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default CtaBanner;
