'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useConvexAuth, useMutation } from 'convex/react';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Truck,
  CreditCard,
  ShoppingBasket,
  CalendarClock,
  Leaf,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { TT_REGIONS, TT_COUNTRY_NAME } from '@/data/ttRegions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentCardForm from './PaymentCardForm';

type Step = 'delivery' | 'payment';

const fieldClass =
  'w-full rounded-xl border border-black/[0.12] bg-white px-3.5 py-2.5 text-[14px] text-text-primary outline-none transition-all placeholder:text-text-secondary/50 focus:border-lume-accent focus:ring-4 focus:ring-lume-accent/10';
const labelClass =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-text-secondary';

/* ────────────────────────────────────────────────
   Stepper
   ──────────────────────────────────────────────── */

function Stepper({ step }: { step: Step }) {
  const steps = [
    { id: 'account', label: 'Account', done: true },
    { id: 'delivery', label: 'Delivery', done: step === 'payment' },
    { id: 'payment', label: 'Payment', done: false },
  ];
  const activeIndex = step === 'delivery' ? 1 : 2;

  return (
    <div className="mx-auto mb-10 flex max-w-xl items-center">
      {steps.map((s, i) => {
        const isActive = i === activeIndex;
        const isComplete = s.done;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[13px] font-semibold transition-colors ${
                  isComplete
                    ? 'border-lume-accent bg-lume-accent text-white'
                    : isActive
                      ? 'border-lume-accent bg-white text-lume-accent'
                      : 'border-black/15 bg-white text-text-secondary'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-[12px] font-semibold tracking-tight ${
                  isActive || isComplete ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="relative mx-2 h-0.5 flex-1 rounded-full bg-black/10">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-lume-accent transition-all duration-500"
                  style={{ width: i < activeIndex ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Sidebar — "What you'll get" / "How it'll work"
   ──────────────────────────────────────────────── */

function Sidebar() {
  return (
    <aside className="space-y-5">
      <div className="rounded-[24px] border border-white/60 bg-white/60 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <h3 className="font-display text-[20px] font-normal tracking-tight text-text-primary">
          What you&apos;ll get
        </h3>
        <ul className="mt-4 space-y-4 text-[14px] leading-[1.6]">
          <li>
            <div className="flex items-center gap-2 font-semibold text-text-primary">
              <ShoppingBasket className="h-4 w-4 text-lume-accent" />
              A curated first haul
            </div>
            <p className="mt-0.5 pl-6 text-text-secondary">
              Caribbean essentials, thoughtfully sourced — add or remove anything you like.
            </p>
          </li>
          <li>
            <div className="flex items-center gap-2 font-semibold text-text-primary">
              <Leaf className="h-4 w-4 text-lume-accent" />
              Low-waste delivery
            </div>
            <p className="mt-0.5 pl-6 text-text-secondary">
              Reusable packaging that comes back to us next round.
            </p>
          </li>
          <li>
            <div className="flex items-center gap-2 font-semibold text-text-primary">
              <Truck className="h-4 w-4 text-lume-accent" />
              Free delivery on orders $60+
            </div>
            <p className="mt-0.5 pl-6 text-text-secondary">
              Across Trinidad &amp; Tobago, on the Saturday Restock schedule.
            </p>
          </li>
        </ul>
      </div>

      <div className="rounded-[24px] border border-white/60 bg-white/60 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <h3 className="font-display text-[20px] font-normal tracking-tight text-text-primary">
          How it&apos;ll work
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lume-accent/10">
              <CalendarClock className="h-5 w-5 text-lume-accent" strokeWidth={1.8} />
            </div>
            <div className="text-[13px] leading-[1.5]">
              <span className="font-semibold text-text-primary">Customize</span> during
              your shopping window — until{' '}
              <span className="font-semibold text-text-primary">Tuesday midnight</span>.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lume-accent/10">
              <Truck className="h-5 w-5 text-lume-accent" strokeWidth={1.8} />
            </div>
            <div className="text-[13px] leading-[1.5]">
              Your haul arrives on the{' '}
              <span className="font-semibold text-text-primary">following Saturday</span> —
              fresh, in low-waste packaging.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────
   Delivery step
   ──────────────────────────────────────────────── */

function DeliveryStep({ onDone }: { onDone: () => void }) {
  const { user } = useUser();
  const addAddress = useMutation(api.addresses.add);
  const updateContact = useMutation(api.users.updateContactInfo);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    line1: '',
    line2: '',
    city: '',
    state: TT_REGIONS[0] as string,
    zip: '',
    phone: '',
    deliveryInstructions: '',
    marketingOptIn: false,
  });

  // Prefill name from Clerk once.
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: f.firstName || user.firstName || '',
        lastName: f.lastName || user.lastName || '',
      }));
    }
  }, [user]);

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.line1.trim() || !form.city.trim()) {
      setError('Please fill in your street address and town/city.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addAddress({
        label: 'Home',
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        zip: form.zip.trim() || undefined,
        country: 'TT',
        deliveryInstructions: form.deliveryInstructions.trim() || undefined,
        setPrimary: true,
      });
      if (form.phone.trim() || form.marketingOptIn) {
        await updateContact({
          phone: form.phone.trim() || undefined,
          marketingOptIn: form.marketingOptIn,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your details.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="font-display text-[clamp(1.9rem,3vw,2.6rem)] font-normal leading-[1.05] tracking-tight text-text-primary">
          Delivery information
        </h1>
        <p className="mt-2 text-[14px] text-text-secondary">
          Where in Trinidad &amp; Tobago should we deliver your hauls?
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-lume-accent/20 bg-lume-accent/[0.06] px-3.5 py-2.5 text-[13px] text-text-secondary">
        <span aria-hidden="true">🇹🇹</span>
        <span>
          Delivering within{' '}
          <strong className="font-semibold text-text-primary">{TT_COUNTRY_NAME}</strong>{' '}
          only.
        </span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>First name *</label>
          <input
            required
            className={fieldClass}
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Last name *</label>
          <input
            required
            className={fieldClass}
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Street address *</label>
        <input
          required
          className={fieldClass}
          placeholder="123 Main St"
          value={form.line1}
          onChange={(e) => set('line1', e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Apartment, unit, etc. (optional)</label>
        <input
          className={fieldClass}
          placeholder="Apt 4B"
          value={form.line2}
          onChange={(e) => set('line2', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Town / City *</label>
          <input
            required
            className={fieldClass}
            placeholder="Port of Spain"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Region / Corporation *</label>
          <select
            className={fieldClass}
            value={form.state}
            onChange={(e) => set('state', e.target.value)}
          >
            {TT_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Postal code (optional)</label>
          <input
            className={fieldClass}
            placeholder="000000"
            value={form.zip}
            onChange={(e) => set('zip', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Phone number *</label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-black/[0.12] bg-black/[0.03] px-3 text-[14px] text-text-secondary">
              +1 868
            </span>
            <input
              required
              type="tel"
              className={`${fieldClass} rounded-l-none`}
              placeholder="313-8899"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Delivery instructions (optional)</label>
        <textarea
          className={`${fieldClass} min-h-[80px] resize-y`}
          placeholder="Leave package by the side door, gate code, etc."
          value={form.deliveryInstructions}
          onChange={(e) => set('deliveryInstructions', e.target.value)}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.5] text-text-secondary">
        <input
          type="checkbox"
          checked={form.marketingOptIn}
          onChange={(e) => set('marketingOptIn', e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-lume-accent"
        />
        I&apos;d like to receive occasional updates and offers from Lumë.
      </label>

      <button
        type="submit"
        disabled={saving}
        className="btn-pill inline-flex w-full items-center justify-center gap-2 bg-lume-accent px-7 py-3.5 text-[15px] font-semibold tracking-tight text-white shadow-frap transition-all hover:bg-lume-green disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Continue to payment
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

/* ────────────────────────────────────────────────
   Payment step (UI shell — see note in chat)
   ──────────────────────────────────────────────── */

function PaymentStep({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[clamp(1.9rem,3vw,2.6rem)] font-normal leading-[1.05] tracking-tight text-text-primary">
          Payment
        </h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-text-secondary">
          Signing up is free — you&apos;re not locked into placing an order, and you can
          skip or cancel anytime during your shopping window.
        </p>
      </div>

      <div className="rounded-[20px] border border-black/[0.08] bg-white p-6">
        <div className="mb-1 flex items-center gap-2 text-[14px] font-semibold text-text-primary">
          <CreditCard className="h-5 w-5 text-lume-accent" />
          Secure card payment
        </div>
        <p className="mb-4 text-[13px] leading-[1.6] text-text-secondary">
          We save your card so checkout is one tap later. Your first weekly payment is
          only authorized when an order ships — nothing is charged today.
        </p>
        <PaymentCardForm onSaved={() => router.push('/dashboard')} />
      </div>

      <div className="flex items-center justify-between text-[13px]">
        <button
          onClick={onBack}
          className="font-semibold text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Back
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="font-semibold text-text-secondary transition-colors hover:text-text-primary"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Flow
   ──────────────────────────────────────────────── */

function OnboardingFlow() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const addresses = useQuery(
    api.addresses.listMine,
    isAuthenticated ? undefined : 'skip'
  );
  const [step, setStep] = useState<Step>('delivery');

  // Already onboarded (has an address) → straight to the dashboard.
  const hasAddress = useMemo(
    () => addresses !== undefined && addresses.length > 0,
    [addresses]
  );
  useEffect(() => {
    if (hasAddress && step === 'delivery') router.push('/dashboard');
  }, [hasAddress, step, router]);

  if (!isAuthenticated || addresses === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-lume-accent" />
      </div>
    );
  }
  if (hasAddress && step === 'delivery') return null;

  return (
    <div className="relative overflow-hidden bg-canvas">
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #00754A 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-14 lg:py-20">
        <Stepper step={step} />
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[28px] border border-white/60 bg-white/55 p-7 shadow-[0_8px_40px_rgba(0,0,0,0.03)] backdrop-blur-xl sm:p-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              >
                {step === 'delivery' ? (
                  <DeliveryStep onDone={() => setStep('payment')} />
                ) : (
                  <PaymentStep onBack={() => setStep('delivery')} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <SignedIn>
          <OnboardingFlow />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </main>
      <Footer />
    </>
  );
}
