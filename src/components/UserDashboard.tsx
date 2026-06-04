'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useClerk } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import {
  Package,
  Calendar,
  Pause,
  Play,
  X as XIcon,
  Truck,
  LogOut,
  Mail,
  User as UserIcon,
  Gift,
  ShoppingBag,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { SUBSCRIPTION_TIERS } from '../data/tiers';
import Header from './Header';
import Footer from './Footer';
import Reveal from './Reveal';
import LoyaltyCard from './LoyaltyCard';
import AddressManager from './dashboard/AddressManager';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-lume-accent/10 text-lume-accent',
  paused: 'bg-amber-50 text-amber-700',
  past_due: 'bg-red-50 text-red-700',
  cancelled: 'bg-black/[0.06] text-text-secondary',
  paid: 'bg-lume-accent/10 text-lume-accent',
  pending: 'bg-amber-50 text-amber-700',
};

function formatDate(ms?: number) {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const UserDashboard: React.FC = () => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const subscriptions = useQuery(api.subscriptions.getMySubscriptions);
  const sentGifts = useQuery(
    api.giftSubscriptions.getGiftSubscriptionsByGiver,
    user ? { giverEmail: user.emailAddresses[0]?.emailAddress || '' } : 'skip'
  );
  const receivedGifts = useQuery(
    api.giftSubscriptions.getGiftSubscriptionsByRecipient,
    user ? { recipientEmail: user.emailAddresses[0]?.emailAddress || '' } : 'skip'
  );

  const pauseSubscription = useMutation(api.subscriptions.pauseSubscription);
  const resumeSubscription = useMutation(api.subscriptions.resumeSubscription);
  const cancelSubscription = useMutation(api.subscriptions.cancelSubscription);
  
  const currentBox = useQuery(api.boxes.getCurrentBox);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-lume-accent/20 border-t-lume-accent" />
      </div>
    );
  }

  const activeSubscription = subscriptions?.find(
    (s) => s.status === 'active' || s.status === 'paused'
  );
  const tierInfo = activeSubscription
    ? SUBSCRIPTION_TIERS.find((t) => t.id === activeSubscription.tier)
    : null;

  const getNextDelivery = () => {
    if (!activeSubscription) return null;
    if (activeSubscription.nextDelivery) return activeSubscription.nextDelivery;
    if (activeSubscription.currentPeriodEnd) return activeSubscription.currentPeriodEnd;
    const start = activeSubscription.startDate ?? activeSubscription.createdAt;
    const cadence = activeSubscription.cadence ?? activeSubscription.frequency ?? 'monthly';
    const days = cadence === 'fortnightly' ? 14 : cadence === 'yearly' ? 365 : 30;
    let next = new Date(start);
    while (next.getTime() < Date.now()) {
      next = new Date(next.getTime() + days * 86_400_000);
    }
    return next.getTime();
  };

  const nextDeliveryMs = getNextDelivery();
  const status = activeSubscription?.status ?? null;

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="pt-[116px]">
        {/* ── Welcome ── */}
        <section className="relative overflow-hidden border-b border-black/[0.04] bg-canvas">
          {/* Subtle Premium Glow */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div
              className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-[0.25] blur-[100px]"
              style={{ background: 'radial-gradient(circle, var(--color-lume-accent) 0%, transparent 70%)' }}
            />
            <div
              className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.15] blur-[100px]"
              style={{ background: 'radial-gradient(circle, var(--color-lume-green) 0%, transparent 70%)' }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
            <Reveal duration={560}>
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-lume-accent">
                Member Dashboard
              </span>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,4vw,3.5rem)] font-normal leading-[1.05] tracking-tight text-text-primary">
                Welcome back, {user.firstName || 'there'}.
              </h1>
              <p className="mt-4 max-w-xl text-[16px] leading-[1.7] text-text-secondary">
                Manage your subscription, track deliveries, and keep your kitchen running smoothly.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Main grid ── */}
        <section className="relative z-20 mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* ── Left: subscription + history ── */}
            <div className="space-y-8 lg:col-span-2">
              {/* Active subscription */}
              {activeSubscription && tierInfo ? (
                <Reveal duration={560} className="overflow-hidden rounded-[32px] border border-white/60 bg-white/50 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] p-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-lume-accent" strokeWidth={2} />
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                          Your subscription
                        </span>
                      </div>
                      <h2 className="mt-2 font-display text-[24px] font-normal leading-tight tracking-snug text-text-primary">
                        {tierInfo.name}
                      </h2>
                      <p className="mt-1 text-[13px] capitalize text-text-secondary">
                        {activeSubscription.cadence ?? activeSubscription.frequency ?? 'monthly'} delivery
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                        STATUS_BADGE[status ?? ''] ?? 'bg-black/[0.06] text-text-secondary'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="space-y-6 p-6">
                    {status === 'active' && nextDeliveryMs && (
                      <div className="flex items-center gap-4 rounded-2xl bg-lume-accent/[0.06] p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lume-accent/15">
                          <Truck className="h-5 w-5 text-lume-accent" strokeWidth={1.75} />
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-lume-accent">
                            Next delivery
                          </div>
                          <div className="mt-0.5 font-display text-[20px] font-medium leading-tight tracking-tight text-text-primary">
                            {formatDate(nextDeliveryMs)}
                          </div>
                        </div>
                      </div>
                    )}

                    {status === 'paused' && (
                      <div className="rounded-2xl bg-amber-50 p-5">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                          Subscription paused
                        </div>
                        <p className="mt-1.5 text-[14px] leading-[1.6] text-text-secondary">
                          Your deliveries are on hold. Resume anytime to continue receiving hauls.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {status === 'active' ? (
                        <button
                          onClick={() =>
                            pauseSubscription({ subscriptionId: activeSubscription._id })
                          }
                          className="btn-pill inline-flex items-center gap-2 bg-lume-house px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black active:scale-[0.97]"
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </button>
                      ) : status === 'paused' ? (
                        <button
                          onClick={() =>
                            resumeSubscription({ subscriptionId: activeSubscription._id })
                          }
                          className="btn-pill inline-flex items-center gap-2 bg-lume-accent px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-lume-green active:scale-[0.97]"
                        >
                          <Play className="h-4 w-4" />
                          Resume
                        </button>
                      ) : null}
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this subscription?')) {
                            cancelSubscription({
                              subscriptionId: activeSubscription._id,
                              atPeriodEnd: true,
                            });
                          }
                        }}
                        className="btn-pill inline-flex items-center gap-2 border border-black/[0.08] bg-white px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-text-primary transition-all hover:bg-black/[0.04] active:scale-[0.97]"
                      >
                        <XIcon className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </Reveal>
              ) : (
                <Reveal duration={560} className="rounded-[32px] border border-white/60 bg-white/50 p-12 text-center backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lume-accent/10">
                    <Package className="h-6 w-6 text-lume-accent" strokeWidth={1.75} />
                  </div>
                  <h2 className="mt-6 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-normal leading-[1.15] tracking-snug text-text-primary">
                    No active subscription
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-[14px] leading-[1.7] text-text-secondary">
                    Browse our hauls or take the quiz to find a perfect match for your household.
                  </p>
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                      href="/shop"
                      className="btn-pill inline-flex items-center justify-center gap-2 bg-lume-house px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black"
                    >
                      Browse
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/quiz"
                      className="btn-pill inline-flex items-center justify-center gap-2 border border-black/[0.08] bg-white px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-text-primary transition-all hover:bg-black/[0.04]"
                    >
                      Take the quiz
                    </Link>
                  </div>
                </Reveal>
              )}

              {/* Current Box Status */}
              {currentBox && (
                <Reveal duration={560} delay={100} className="rounded-[32px] border border-white/60 bg-white/50 p-8 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2 mb-6">
                    <Truck className="h-5 w-5 text-lume-accent" strokeWidth={2} />
                    <h2 className="font-display text-[20px] font-normal leading-tight tracking-snug text-text-primary">
                      Current Box
                    </h2>
                  </div>
                  
                  <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary block">Status</span>
                      <span className={`mt-1 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${STATUS_BADGE[currentBox.status] ?? 'bg-black/[0.06] text-text-secondary'}`}>
                        {currentBox.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary block">Delivery Date</span>
                      <span className="text-[14px] font-medium text-text-primary mt-1 block">
                        {formatDate(currentBox.deliveryDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary block">Cutoff</span>
                      <span className="text-[14px] font-medium text-text-primary mt-1 block">
                        {formatDate(currentBox.cutoffAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary border-b border-black/[0.06] pb-2">
                      Contents ({currentBox.items.length})
                    </h3>
                    {currentBox.items.length > 0 ? (
                      <ul className="divide-y divide-black/[0.04]">
                        {currentBox.items.map((item) => (
                          <li key={item._id} className="py-2 flex justify-between items-center text-[13px]">
                            <span>{item.productName} <span className="text-text-secondary">x{item.quantity}</span></span>
                            <span>${(item.unitPriceCentsAtLock / 100 * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-text-secondary italic">Box is empty.</p>
                    )}
                  </div>
                  
                  {currentBox.status === "draft" && (
                    <div className="mt-6">
                      <Link href={`/dashboard/box/${currentBox._id}`} className="btn-pill inline-flex items-center gap-2 border border-black/[0.08] bg-white px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-text-primary transition-all hover:bg-black/[0.04]">
                        Customize Box
                      </Link>
                    </div>
                  )}
                </Reveal>
              )}

              {/* Subscription history */}
              <Reveal duration={560} delay={120} className="rounded-[32px] border border-white/60 bg-white/50 p-8 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
                <h2 className="font-display text-[20px] font-normal leading-tight tracking-snug text-text-primary">
                  Subscription history
                </h2>
                {subscriptions && subscriptions.length > 0 ? (
                  <ul className="mt-4 divide-y divide-black/[0.04]">
                    {subscriptions.map((sub) => {
                      const tier = SUBSCRIPTION_TIERS.find((t) => t.id === sub.tier);
                      return (
                        <li
                          key={sub._id}
                          className="flex items-center justify-between gap-3 py-4"
                        >
                          <div>
                            <div className="text-[14px] font-semibold text-text-primary">
                              {tier?.name || sub.tier}
                            </div>
                            <div className="mt-0.5 text-[12px] text-text-secondary">
                              Started {new Date(sub.startDate ?? sub.createdAt).toLocaleDateString()}
                              {' · '}
                              <span className="capitalize">
                                {sub.cadence ?? sub.frequency ?? 'monthly'}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
                              STATUS_BADGE[sub.status] ?? 'bg-black/[0.06] text-text-secondary'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-4 py-8 text-center text-[14px] text-text-secondary">
                    No subscription history yet.
                  </p>
                )}
              </Reveal>

              {/* Gift subscriptions */}
              {((sentGifts && sentGifts.length > 0) ||
                (receivedGifts && receivedGifts.length > 0)) && (
                <Reveal
                  duration={560}
                  delay={180}
                  className="rounded-[32px] border border-white/60 bg-white/50 p-8 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-lume-accent" strokeWidth={2} />
                    <h2 className="font-display text-[20px] font-normal leading-tight tracking-snug text-text-primary">
                      Gift subscriptions
                    </h2>
                  </div>

                  {sentGifts && sentGifts.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                        Sent
                      </h3>
                      <ul className="mt-3 space-y-2">
                        {sentGifts.map((gift) => {
                          const tier = SUBSCRIPTION_TIERS.find((t) => t.id === gift.tier);
                          return (
                            <li
                              key={gift._id}
                              className="flex items-center justify-between gap-3 rounded-xl bg-canvas p-4"
                            >
                              <div>
                                <div className="text-[14px] font-semibold text-text-primary">
                                  {tier?.name || gift.tier} → {gift.recipientName}
                                </div>
                                <div className="mt-0.5 text-[12px] text-text-secondary">
                                  {new Date(gift.createdAt).toLocaleDateString()} · $
                                  {gift.amount.toFixed(2)}
                                </div>
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
                                  STATUS_BADGE[gift.status] ?? 'bg-black/[0.06] text-text-secondary'
                                }`}
                              >
                                {gift.status}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {receivedGifts && receivedGifts.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                        Received
                      </h3>
                      <ul className="mt-3 space-y-2">
                        {receivedGifts.map((gift) => {
                          const tier = SUBSCRIPTION_TIERS.find((t) => t.id === gift.tier);
                          return (
                            <li
                              key={gift._id}
                              className="rounded-xl bg-lume-accent/[0.05] p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-[14px] font-semibold text-text-primary">
                                    {tier?.name || gift.tier} from {gift.giverName}
                                  </div>
                                  <div className="mt-0.5 text-[12px] text-text-secondary">
                                    {new Date(gift.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
                                    STATUS_BADGE[gift.status] ??
                                    'bg-black/[0.06] text-text-secondary'
                                  }`}
                                >
                                  {gift.status}
                                </span>
                              </div>
                              {gift.giftMessage && (
                                <p className="mt-2 text-[13px] italic leading-[1.6] text-text-secondary">
                                  &ldquo;{gift.giftMessage}&rdquo;
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </Reveal>
              )}
            </div>

            {/* ── Right: sidebar ── */}
            <aside className="space-y-6">
              {/* Loyalty Card */}
              <Reveal duration={560} delay={60}>
                {(() => {
                  const signupMs = user.createdAt ?? Date.now();
                  const signupDate = new Date(signupMs);
                  
                  let start = new Date(signupDate);
                  const now = new Date();
                  let end = new Date(start);
                  end.setMonth(start.getMonth() + 6);

                  // Keep advancing the 6-month window until it contains the current date
                  while (end <= now) {
                    start = new Date(end);
                    end = new Date(start);
                    end.setMonth(start.getMonth() + 6);
                  }

                  const periodSpentCents = (subscriptions ?? []).reduce((sum, s) => {
                    // Only count spending from subscriptions created within this period
                    if (s._creationTime < start.getTime() || s._creationTime > end.getTime()) {
                      return sum;
                    }
                    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === s.tier);
                    if (!tier || s.status === 'cancelled') return sum;
                    return sum + (tier.price ?? 0) * 100;
                  }, 0);

                  return (
                    <LoyaltyCard
                      memberName={user.fullName || user.firstName || 'Member'}
                      memberId={user.id}
                      memberSince={signupDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      periodStartMs={start.getTime()}
                      periodEndMs={end.getTime()}
                      totalSpentCents={periodSpentCents}
                      creditsCents={0}
                    />
                  );
                })()}
              </Reveal>

              {/* Account */}
              <Reveal duration={560} delay={80} className="rounded-[32px] border border-white/60 bg-white/50 p-8 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                  Account
                </h2>
                <div className="mt-4 flex items-center gap-3 border-b border-black/[0.06] pb-4">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lume-accent/10">
                      <UserIcon className="h-5 w-5 text-lume-accent" strokeWidth={1.75} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold text-text-primary">
                      {user.fullName || 'User'}
                    </div>
                    <div className="truncate text-[12px] text-text-secondary">
                      {user.emailAddresses[0]?.emailAddress}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <button
                    onClick={() => openUserProfile()}
                    className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-[13px] font-medium text-text-secondary transition-colors hover:bg-canvas hover:text-text-primary"
                  >
                    <Mail className="h-4 w-4" strokeWidth={1.75} />
                    Edit profile
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-[13px] font-medium text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    Sign out
                  </button>
                </div>
              </Reveal>

              {/* Address Manager */}
              <Reveal duration={560} delay={120}>
                <AddressManager />
              </Reveal>

              {/* Quick links */}
              <Reveal duration={560} delay={140} className="rounded-[32px] border border-white/60 bg-white/50 p-8 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                  Quick links
                </h2>
                <nav className="mt-4 space-y-1">
                  {[
                    { href: '/shop', label: 'Browse', Icon: Package },
                    { href: '/shop', label: 'Shop chilled items', Icon: ShoppingBag },
                    { href: '/quiz', label: 'Take the quiz', Icon: Calendar },
                    { href: '/gift', label: 'Send a gift', Icon: Gift },
                  ].map(({ href, label, Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex items-center gap-3 rounded-lg p-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-canvas hover:text-text-primary"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      {label}
                    </Link>
                  ))}
                </nav>
              </Reveal>

              {/* Help */}
              <Reveal
                duration={560}
                delay={200}
                className="rounded-3xl bg-lume-accent/[0.06] p-6"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-lume-accent" strokeWidth={2} />
                  <h2 className="text-[14px] font-semibold tracking-tight text-text-primary">
                    Need help?
                  </h2>
                </div>
                <p className="mt-2 text-[13px] leading-[1.6] text-text-secondary">
                  Have questions about your subscription or delivery? We're here to help.
                </p>
                <a
                  href="mailto:lumestudiott@gmail.com"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-lume-accent transition-colors hover:text-lume-green"
                >
                  Contact support
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </Reveal>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
