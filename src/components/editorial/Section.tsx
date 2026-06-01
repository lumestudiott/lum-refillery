'use client';

import React from 'react';
import Reveal from '../Reveal';

interface SectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Background color/style — `canvas` (default) or `white` for elevated rows. */
  surface?: 'canvas' | 'white' | 'house';
  /** Whether to center the header block (default: true). */
  centered?: boolean;
  /** Vertical padding scale. */
  spacing?: 'compact' | 'normal' | 'spacious';
  className?: string;
  children?: React.ReactNode;
}

const SURFACE: Record<NonNullable<SectionProps['surface']>, string> = {
  canvas: 'bg-canvas',
  white: 'bg-white',
  house: 'bg-lume-house text-white',
};

const SPACING: Record<NonNullable<SectionProps['spacing']>, string> = {
  compact: 'py-16',
  normal: 'py-20 lg:py-24',
  spacious: 'py-24 lg:py-32',
};

/**
 * Editorial content section — header (eyebrow / title / description) + body.
 * Pair with `FeatureGrid`, `StatGrid`, or any custom children for layout.
 */
const Section: React.FC<SectionProps> = ({
  eyebrow,
  title,
  description,
  surface = 'canvas',
  centered = true,
  spacing = 'normal',
  className = '',
  children,
}) => {
  const isHouse = surface === 'house';
  return (
    <section className={`${SURFACE[surface]} ${SPACING[spacing]} ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {(eyebrow || title || description) && (
          <div className={`mb-12 ${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}`}>
            {eyebrow && (
              <Reveal
                as="span"
                duration={560}
                className={`inline-block text-[13px] font-semibold uppercase tracking-[0.15em] ${
                  isHouse ? 'text-white/70' : 'text-lume-accent'
                }`}
              >
                {eyebrow}
              </Reveal>
            )}
            {title && (
              <Reveal
                as="h2"
                duration={560}
                delay={80}
                className={`mt-4 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-normal leading-[1.15] tracking-snug ${
                  isHouse ? 'text-white' : 'text-text-primary'
                }`}
              >
                {title}
              </Reveal>
            )}
            {description && (
              <Reveal
                as="p"
                duration={560}
                delay={160}
                className={`mt-4 text-[16px] leading-[1.75] ${
                  isHouse ? 'text-white/70' : 'text-text-secondary'
                }`}
              >
                {description}
              </Reveal>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
