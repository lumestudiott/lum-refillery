'use client';

import React from 'react';
import Image from 'next/image';
import Reveal from '../Reveal';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  /** Dark overlay variant — sets the hero on a dark image background with white text. */
  variant?: 'light' | 'dark';
  children?: React.ReactNode;
}

/**
 * Editorial page hero — eyebrow + display H1 + subtitle. Optionally backed by
 * a full-bleed image with a dark overlay for the `dark` variant.
 *
 * Use this on every non-home page as the first section after the Header.
 */
const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  imageUrl,
  variant = 'light',
  children,
}) => {
  const isDark = variant === 'dark';

  return (
    <section
      className={`relative overflow-hidden ${
        isDark ? 'bg-lume-house' : 'bg-canvas'
      }`}
    >
      {imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-lume-house/70'
                : 'bg-gradient-to-b from-canvas/40 via-canvas/30 to-canvas'
            }`}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center lg:px-10 lg:py-32">
        {eyebrow && (
          <Reveal
            as="span"
            duration={560}
            className={`inline-block text-[13px] font-semibold uppercase tracking-[0.15em] ${
              isDark ? 'text-white/70' : 'text-lume-accent'
            }`}
          >
            {eyebrow}
          </Reveal>
        )}
        <Reveal
          as="h1"
          duration={560}
          delay={80}
          className={`mt-4 font-display text-[clamp(2.4rem,5vw,3.6rem)] font-normal leading-[1.1] tracking-snug ${
            isDark ? 'text-white' : 'text-text-primary'
          }`}
        >
          {title}
        </Reveal>
        {subtitle && (
          <Reveal
            as="p"
            duration={560}
            delay={160}
            className={`mx-auto mt-5 max-w-2xl text-[16px] leading-[1.75] ${
              isDark ? 'text-white/70' : 'text-text-secondary'
            }`}
          >
            {subtitle}
          </Reveal>
        )}
        {children && (
          <Reveal duration={560} delay={240} className="mt-8">
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default PageHero;
