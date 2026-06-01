'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Reveal from '../Reveal';

export interface Stat {
  icon?: LucideIcon;
  value: string;
  label: string;
}

interface StatGridProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
  /**
   * Visual variant:
   *  - `bare`    — big display number on the section surface, hairlines between cells. Default.
   *  - `cards`   — white boxed cards with shadow (use sparingly).
   */
  variant?: 'bare' | 'cards';
  /** Hint for legibility when the parent surface is dark. */
  tone?: 'light' | 'dark';
}

const COL_CLASS: Record<2 | 3 | 4, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'sm:grid-cols-2 md:grid-cols-4',
};

const StatGrid: React.FC<StatGridProps> = ({
  stats,
  columns = 3,
  variant = 'bare',
  tone = 'light',
}) => {
  const isDark = tone === 'dark';
  const valueColor = isDark ? 'text-white' : 'text-text-primary';
  const labelColor = isDark ? 'text-white/60' : 'text-text-secondary';
  const iconColor = isDark ? 'text-white' : 'text-lume-accent';
  const dividerColor = isDark ? 'border-white/15' : 'border-black/[0.08]';

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 gap-6 ${COL_CLASS[columns]}`}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Reveal
              key={stat.label}
              delay={i * 80}
              duration={560}
              className="rounded-2xl bg-white p-8 text-center shadow-card"
            >
              {Icon && (
                <Icon
                  className={`mx-auto mb-4 h-7 w-7 ${iconColor}`}
                  strokeWidth={1.5}
                />
              )}
              <div className={`font-display text-[clamp(2.4rem,4vw,3.2rem)] font-normal leading-none tracking-tight ${valueColor}`}>
                {stat.value}
              </div>
              <div className={`mt-3 text-[13px] font-medium uppercase tracking-[0.08em] ${labelColor}`}>
                {stat.label}
              </div>
            </Reveal>
          );
        })}
      </div>
    );
  }

  // Bare: editorial typography on the section surface, hairlines between cells.
  return (
    <div className={`grid grid-cols-1 gap-y-12 ${COL_CLASS[columns]} md:gap-y-0`}>
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Reveal
            key={stat.label}
            delay={i * 80}
            duration={560}
            className={`text-center md:border-l ${dividerColor} md:first:border-l-0 md:px-8`}
          >
            {Icon && (
              <Icon
                className={`mx-auto mb-4 h-6 w-6 ${iconColor}`}
                strokeWidth={1.5}
              />
            )}
            <div
              className={`font-display text-[clamp(2.4rem,4.5vw,3.6rem)] font-normal leading-[1.05] tracking-tight ${valueColor}`}
            >
              {stat.value}
            </div>
            <div
              className={`mt-3 text-[12px] font-semibold uppercase tracking-[0.1em] ${labelColor}`}
            >
              {stat.label}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
};

export default StatGrid;
