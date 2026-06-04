'use client';

import React, { useMemo } from 'react';
import { Leaf, Star, Sparkles, Crown, RotateCcw } from 'lucide-react';

/* ── Tier thresholds (per 6-month period) ── */
const TIERS = [
  { name: 'Seedling',  floor: 0,    icon: Leaf,     gradient: 'from-[#1E3932] via-[#2b5148] to-[#1E3932]' },
  { name: 'Sprout',    floor: 500,  icon: Star,     gradient: 'from-[#006241] via-[#00754A] to-[#006241]' },
  { name: 'Bloom',     floor: 2000, icon: Sparkles, gradient: 'from-[#00754A] via-[#2b8a6a] to-[#006241]' },
  { name: 'Harvest',   floor: 5000, icon: Crown,    gradient: 'from-[#8B6914] via-[#cba258] to-[#8B6914]' },
] as const;

function getDaysUntilReset(endMs: number): number {
  const now = new Date();
  return Math.max(0, Math.ceil((endMs - now.getTime()) / 86_400_000));
}

function getTier(points: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].floor) return { ...TIERS[i], index: i };
  }
  return { ...TIERS[0], index: 0 };
}

function formatCardNumber(id: string) {
  const raw = id.replace(/[^a-zA-Z0-9]/g, '').slice(-16).padStart(16, '0').toUpperCase();
  return `${raw.slice(0, 4)}  ${raw.slice(4, 8)}  ${raw.slice(8, 12)}  ${raw.slice(12, 16)}`;
}

interface LoyaltyCardProps {
  memberName: string;
  memberId: string;
  memberSince: string;
  periodStartMs: number;
  periodEndMs: number;
  totalSpentCents: number; // spending within the current 6-month period
  creditsCents: number;
}

export default function LoyaltyCard({
  memberName,
  memberId,
  memberSince,
  periodStartMs,
  periodEndMs,
  totalSpentCents,
  creditsCents,
}: LoyaltyCardProps) {
  // 1 point per dollar spent (within the current period)
  const points = Math.floor(totalSpentCents / 100);
  const tier = useMemo(() => getTier(points), [points]);
  const nextTier = TIERS[tier.index + 1] ?? null;
  const progress = nextTier
    ? ((points - tier.floor) / (nextTier.floor - tier.floor)) * 100
    : 100;

  const TierIcon = tier.icon;
  const cardNumber = useMemo(() => formatCardNumber(memberId), [memberId]);
  
  const periodLabel = useMemo(() => {
    const start = new Date(periodStartMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const end = new Date(periodEndMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} – ${end}`;
  }, [periodStartMs, periodEndMs]);

  const daysLeft = useMemo(() => getDaysUntilReset(periodEndMs), [periodEndMs]);

  return (
    <div className="group perspective-[1200px]">
      <div
        className={`
          relative w-full aspect-[1.6/1] max-w-[420px] rounded-[20px] p-6 sm:p-8
          bg-gradient-to-br ${tier.gradient}
          shadow-[0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]
          overflow-hidden select-none
          transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
          group-hover:rotate-y-1 group-hover:-rotate-x-1 group-hover:scale-[1.02]
        `}
      >
        {/* ── Decorative overlay pattern ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-[0.08] blur-2xl"
            style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full opacity-[0.06] blur-3xl"
            style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                135deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,0.5) 20px,
                rgba(255,255,255,0.5) 21px
              )`,
            }}
          />
        </div>

        {/* ── Card header ── */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="font-display text-[18px] sm:text-[20px] font-normal tracking-tight text-white/90">
              Lumë{' '}
              <span className="text-white/70">Refillery</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1">
            <TierIcon className="h-3.5 w-3.5 text-white/80" strokeWidth={2} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
              {tier.name}
            </span>
          </div>
        </div>

        {/* ── Card number ── */}
        <div className="relative z-10 mt-4 sm:mt-6">
          <span className="font-mono text-[14px] sm:text-[16px] font-medium tracking-[0.15em] text-white/50">
            {cardNumber}
          </span>
        </div>

        {/* ── Card footer ── */}
        <div className="relative z-10 mt-auto pt-4 sm:pt-6 flex items-end justify-between">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/40">
              Member
            </div>
            <div className="text-[13px] sm:text-[14px] font-semibold tracking-tight text-white/90 mt-0.5">
              {memberName}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/40 flex items-center justify-end gap-1">
              <RotateCcw className="h-2.5 w-2.5" />
              Resets In
            </div>
            <div className="text-[13px] sm:text-[14px] font-medium text-white/70 mt-0.5">
              {daysLeft} days
            </div>
          </div>
        </div>
      </div>

      {/* ── Points summary below card ── */}
      <div className="mt-5 max-w-[420px] space-y-4">
        {/* Points + Credits row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[28px] sm:text-[32px] font-display font-normal tracking-tight text-text-primary leading-none">
              {points.toLocaleString()}
            </span>
            <span className="ml-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
              points
            </span>
          </div>
          {creditsCents > 0 && (
            <div className="text-right">
              <span className="text-[18px] font-display font-normal tracking-tight text-lume-accent leading-none">
                ${(creditsCents / 100).toFixed(2)}
              </span>
              <span className="ml-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
                credit
              </span>
            </div>
          )}
        </div>

        {/* Progress bar to next tier */}
        {nextTier && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                {tier.name}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                {nextTier.name}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-black/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-lume-accent transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[12px] text-text-secondary">
              <span className="font-semibold text-text-primary">
                {(nextTier.floor - points).toLocaleString()}
              </span>{' '}
              more points to reach {nextTier.name}
            </p>
          </div>
        )}

        {!nextTier && (
          <p className="text-[12px] text-text-secondary flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-gold" />
            You've reached the highest tier — thank you for your loyalty!
          </p>
        )}
      </div>
    </div>
  );
}

