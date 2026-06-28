'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import {
  Users,
  Package,
  Repeat,
  Truck,
  ShoppingBag,
  Gift,
  Mail,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import { MotionCard, Loading, cents, StatusBadge, useCountUp } from '../lib';

type NavTarget = 'products' | 'users' | 'subscriptions' | 'orders';

function AnimatedNumber({
  value,
  currency = false,
}: {
  value: number;
  currency?: boolean;
}) {
  const v = useCountUp(value);
  return (
    <>
      {currency
        ? cents(Math.round(v))
        : Math.round(v).toLocaleString('en-US')}
    </>
  );
}

function Stat({
  label,
  value,
  sub,
  Icon,
  currency,
  delay,
  onClick,
}: {
  label: string;
  value: number;
  sub?: string;
  Icon: typeof Users;
  currency?: boolean;
  delay: number;
  onClick?: () => void;
}) {
  return (
    <MotionCard
      delay={delay}
      lift={!!onClick}
      className={`group p-5 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div onClick={onClick} className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            {label}
          </div>
          <div className="mt-2 font-display text-[30px] font-normal leading-none tracking-tight text-text-primary">
            <AnimatedNumber value={value} currency={currency} />
          </div>
          {sub && (
            <div className="mt-1.5 text-[12px] text-text-secondary">{sub}</div>
          )}
        </div>
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-lume-accent/10 transition-colors group-hover:bg-lume-accent/15">
          <Icon className="h-5 w-5 text-lume-accent" strokeWidth={1.9} />
          {onClick && (
            <ArrowUpRight className="absolute -right-1 -top-1 h-3.5 w-3.5 text-lume-accent opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>
    </MotionCard>
  );
}

export default function Overview({
  onNavigate,
}: {
  onNavigate: (s: NavTarget) => void;
}) {
  const data = useQuery(api.admin.overview);
  if (data === undefined) return <Loading />;

  const { counts, revenue, subStatusCounts, boxStatusCounts } = data;

  return (
    <div>
      <div className="mb-7">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-lume-accent">
          Dashboard
        </div>
        <h1 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] font-normal leading-[1.05] tracking-tight text-text-primary">
          Welcome back.
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-secondary">
          A live snapshot of Lumë Refillery. Everything here is editable from the
          sections in the sidebar.
        </p>
      </div>

      {/* Revenue hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative mb-5 overflow-hidden rounded-[24px] bg-gradient-to-br from-lume-house via-lume-accent to-lume-green p-7 text-white shadow-frap"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-2xl"
          style={{ background: 'radial-gradient(circle, #cba258 0%, transparent 70%)' }}
        />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/80">
              <TrendingUp className="h-4 w-4" />
              Total revenue
            </div>
            <div className="mt-2 font-display text-[clamp(2.4rem,5vw,3.4rem)] font-normal leading-none tracking-tight">
              <AnimatedNumber value={revenue.totalCents} currency />
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <RevChip label="Shop" value={cents(revenue.shopCents)} />
            <RevChip label="Boxes" value={cents(revenue.boxCents)} />
            <RevChip label="Gifts" value={cents(revenue.giftCents)} />
            <RevChip
              label="Credit out"
              value={cents(revenue.creditsOutstandingCents)}
            />
          </div>
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Active subscriptions"
          value={counts.activeSubscriptions}
          sub={`${counts.subscriptions} total`}
          Icon={Repeat}
          delay={0.05}
          onClick={() => onNavigate('subscriptions')}
        />
        <Stat
          label="Customers"
          value={counts.users}
          sub={`${counts.admins} admins`}
          Icon={Users}
          delay={0.1}
          onClick={() => onNavigate('users')}
        />
        <Stat
          label="Products"
          value={counts.products}
          sub={`${counts.activeProducts} active`}
          Icon={Package}
          delay={0.15}
          onClick={() => onNavigate('products')}
        />
        <Stat
          label="Delivery boxes"
          value={counts.boxes}
          sub={`${counts.shopOrders} shop orders`}
          Icon={Truck}
          delay={0.2}
          onClick={() => onNavigate('orders')}
        />
      </div>

      {/* Secondary stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Shop orders"
          value={counts.shopOrders}
          Icon={ShoppingBag}
          delay={0.25}
          onClick={() => onNavigate('orders')}
        />
        <Stat
          label="Newsletter"
          value={counts.newsletter}
          sub={`${counts.referrals} referrals`}
          Icon={Mail}
          delay={0.3}
        />
        <Stat
          label="Gifts pending"
          value={counts.pendingGifts}
          sub={`${counts.gifts} total gifts`}
          Icon={Gift}
          delay={0.35}
        />
      </div>

      {/* Breakdowns */}
      <div className="grid gap-5 lg:grid-cols-2">
        <MotionCard delay={0.4} className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            <Repeat className="h-4 w-4 text-lume-accent" /> Subscriptions by status
          </h2>
          <Breakdown counts={subStatusCounts} />
        </MotionCard>
        <MotionCard delay={0.45} className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            <Truck className="h-4 w-4 text-lume-accent" /> Boxes by status
          </h2>
          <Breakdown counts={boxStatusCounts} />
        </MotionCard>
      </div>
    </div>
  );
}

function RevChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/12 px-4 py-2.5 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/65">
        {label}
      </div>
      <div className="mt-0.5 font-display text-[17px] tracking-tight">{value}</div>
    </div>
  );
}

function Breakdown({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0) || 1;
  if (entries.length === 0)
    return <p className="text-[13px] text-text-secondary">No data yet.</p>;
  return (
    <div className="space-y-3.5">
      {entries.map(([status, n], i) => (
        <div key={status} className="flex items-center gap-3">
          <div className="w-24 shrink-0">
            <StatusBadge status={status} />
          </div>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(n / total) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.22, 0.61, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-lume-accent to-lume-green"
            />
          </div>
          <div className="w-9 shrink-0 text-right font-display text-[15px] tabular-nums text-text-primary">
            {n}
          </div>
        </div>
      ))}
    </div>
  );
}
