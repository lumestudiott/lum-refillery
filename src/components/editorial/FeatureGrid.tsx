'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Reveal from '../Reveal';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  points?: string[];
}

interface FeatureGridProps {
  features: Feature[];
  /**
   * Visual variant:
   *  - `bare`     — centered icon + text on the section surface (no card chrome). Default.
   *  - `divided`  — same as bare, with hairline dividers between columns.
   *  - `inline`   — icon-left, text-right rows (no chrome).
   *  - `cards`    — boxed white cards with shadow (use sparingly).
   */
  variant?: 'bare' | 'divided' | 'inline' | 'cards';
  columns?: 2 | 3 | 4;
  /** Hint for legibility when the parent surface is dark. */
  tone?: 'light' | 'dark';
}

const COL_CLASS: Record<2 | 3 | 4, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'sm:grid-cols-2 md:grid-cols-4',
};

const FeatureGrid: React.FC<FeatureGridProps> = ({
  features,
  variant = 'bare',
  columns = 3,
  tone = 'light',
}) => {
  const isDark = tone === 'dark';
  const titleColor = isDark ? 'text-white' : 'text-text-primary';
  const bodyColor = isDark ? 'text-white/70' : 'text-text-secondary';
  const iconRingBg = isDark ? 'bg-white/10' : 'bg-lume-accent/10';
  const iconColor = isDark ? 'text-white' : 'text-lume-accent';
  const dividerColor = isDark ? 'border-white/15' : 'border-black/[0.08]';

  // ── Cards (legacy / heavy chrome) ─────────────────────────────────────────
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[columns]}`}>
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Reveal
              key={feature.title}
              delay={i * 80}
              duration={560}
              className="rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-float"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconRingBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.75} />
              </div>
              <h3 className={`mt-5 text-[17px] font-semibold tracking-tight ${titleColor}`}>
                {feature.title}
              </h3>
              <p className={`mt-2 text-[14px] leading-[1.65] ${bodyColor}`}>{feature.description}</p>
              {feature.points && feature.points.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {feature.points.map((p) => (
                    <li
                      key={p}
                      className={`flex items-start gap-2 text-[13px] leading-[1.55] ${bodyColor}`}
                    >
                      <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${iconColor.replace('text-', 'bg-')}`} />
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          );
        })}
      </div>
    );
  }

  // ── Inline rows (icon left, text right; no chrome) ────────────────────────
  if (variant === 'inline') {
    return (
      <div className={`grid grid-cols-1 gap-x-12 gap-y-10 ${COL_CLASS[columns]}`}>
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.title} delay={i * 80} duration={560} className="flex gap-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconRingBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className={`text-[17px] font-semibold tracking-tight ${titleColor}`}>
                  {feature.title}
                </h3>
                <p className={`mt-2 text-[14px] leading-[1.7] ${bodyColor}`}>
                  {feature.description}
                </p>
                {feature.points && feature.points.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {feature.points.map((p) => (
                      <li
                        key={p}
                        className={`flex items-start gap-2 text-[13px] leading-[1.55] ${bodyColor}`}
                      >
                        <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${iconColor.replace('text-', 'bg-')}`} />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    );
  }

  // ── Bare & Divided (centered, no chrome) ──────────────────────────────────
  // For `divided`: vertical hairlines between columns on md+ (no extra DOM).
  const dividedCellClass =
    variant === 'divided'
      ? `md:border-l ${dividerColor} md:first:border-l-0 md:px-8 lg:px-10`
      : '';

  return (
    <div
      className={`grid grid-cols-1 gap-y-12 ${COL_CLASS[columns]} ${
        variant === 'divided' ? 'md:gap-y-0' : ''
      }`}
    >
      {features.map((feature, i) => {
        const Icon = feature.icon;
        return (
          <Reveal
            key={feature.title}
            delay={i * 80}
            duration={560}
            className={`text-center ${dividedCellClass}`}
          >
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${iconRingBg}`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.75} />
            </div>
            <h3
              className={`mt-5 font-display text-[19px] font-medium leading-tight tracking-snug ${titleColor}`}
            >
              {feature.title}
            </h3>
            <p
              className={`mx-auto mt-2 max-w-[26ch] text-[14px] leading-[1.7] ${bodyColor}`}
            >
              {feature.description}
            </p>
          </Reveal>
        );
      })}
    </div>
  );
};

export default FeatureGrid;
