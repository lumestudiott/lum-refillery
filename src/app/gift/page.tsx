'use client';

import React, { useState } from 'react';
import { Gift, Check, Sparkles } from 'lucide-react';
import { useMutation } from 'convex/react';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';
import { calculateYearlySavings } from '@/utils/pricing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/editorial/PageHero';
import { api } from '../../../convex/_generated/api';

type BillingCycle = 'fortnightly' | 'monthly' | 'yearly';

const inputClass =
  'w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-all focus:border-lume-accent focus:ring-2 focus:ring-lume-accent/30';

export default function GiftSubscriptionPage() {
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createGiftSubscription = useMutation(api.giftSubscriptions.createGiftSubscription);
  const cancelPendingGiftSubscription = useMutation(
    api.giftSubscriptions.cancelPendingGiftSubscription
  );

  const [formData, setFormData] = useState({
    giverName: '',
    giverEmail: '',
    recipientName: '',
    recipientEmail: '',
    recipientAddress: '',
    recipientCity: '',
    recipientState: '',
    recipientZip: '',
    giftMessage: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) {
      setFormError('Please select a haul to gift.');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);

    let pendingId: Awaited<ReturnType<typeof createGiftSubscription>> | null = null;
    try {
      const tier = SUBSCRIPTION_TIERS.find((t) => t.id === selectedTier);
      if (!tier) throw new Error('Selected haul not found');

      const price = tier.price[billingCycle];
      const giftId = await createGiftSubscription({
        giverName: formData.giverName,
        giverEmail: formData.giverEmail,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        recipientAddress: formData.recipientAddress,
        recipientCity: formData.recipientCity,
        recipientState: formData.recipientState,
        recipientZip: formData.recipientZip,
        tier: selectedTier,
        billingCycle,
        giftMessage: formData.giftMessage || undefined,
        amount: price,
      });
      pendingId = giftId;

      const response = await fetch('/api/checkout/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: selectedTier,
          billingCycle,
          giftSubscriptionId: giftId,
          giverName: formData.giverName,
          giverEmail: formData.giverEmail,
          recipientName: formData.recipientName,
          recipientEmail: formData.recipientEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
      if (data.url) window.location.href = data.url;
    } catch (error) {
      if (pendingId) {
        try {
          await cancelPendingGiftSubscription({ id: pendingId });
        } catch (cleanupError) {
          console.error('Error cancelling pending gift:', cleanupError);
        }
      }
      setFormError(
        error instanceof Error ? error.message : 'There was an error processing your gift. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const tierData = SUBSCRIPTION_TIERS.find((t) => t.id === selectedTier);
  const totalPrice = tierData ? tierData.price[billingCycle] : 0;

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="pt-[72px]">
        <PageHero
          eyebrow="Send a gift"
          title="Share fresh groceries with someone you love."
          subtitle="A Lumë gift subscription delivers chilled, locally-sourced provisions to their door — and a personal note from you."
        />

        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
              {/* ── Left: choose haul ── */}
              <div>
                <h2 className="font-display text-[clamp(1.6rem,2.6vw,2rem)] font-normal leading-[1.2] tracking-snug text-text-primary">
                  Choose a haul
                </h2>

                {/* Billing toggle */}
                <div className="mt-6 inline-flex rounded-pill bg-canvas p-1.5 shadow-card">
                  {(['fortnightly', 'monthly', 'yearly'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setBillingCycle(cycle)}
                      className={`relative rounded-pill px-5 py-2 text-[13px] font-semibold tracking-tight transition-all ${
                        billingCycle === cycle
                          ? 'bg-lume-accent text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {cycle[0].toUpperCase() + cycle.slice(1)}
                      {cycle === 'yearly' && (
                        <span className="absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-full bg-lume-accent px-2 py-0.5 text-[10px] font-semibold text-white">
                          <Sparkles className="h-2.5 w-2.5" /> Save
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <ul className="mt-6 space-y-3">
                  {SUBSCRIPTION_TIERS.map((tier) => {
                    const selected = selectedTier === tier.id;
                    return (
                      <li key={tier.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedTier(tier.id)}
                          className={`w-full rounded-2xl border p-5 text-left transition-all ${
                            selected
                              ? 'border-lume-accent bg-lume-accent/[0.06] shadow-card'
                              : 'border-black/[0.08] bg-white hover:border-lume-accent/40 hover:shadow-card'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-1 items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                                  selected
                                    ? 'border-lume-accent bg-lume-accent'
                                    : 'border-black/20'
                                }`}
                              >
                                {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                              </div>
                              <div>
                                <h3 className="font-display text-[18px] font-medium leading-tight tracking-tight text-text-primary">
                                  {tier.name}
                                </h3>
                                <p className="mt-1.5 text-[13px] leading-[1.6] text-text-secondary">
                                  {tier.description}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-[20px] font-semibold tracking-tight text-text-primary">
                                ${tier.price[billingCycle].toFixed(2)}
                              </div>
                              <div className="text-[11px] uppercase tracking-[0.06em] text-text-secondary">
                                /{billingCycle === 'yearly' ? 'year' : billingCycle}
                              </div>
                              {billingCycle === 'yearly' && (
                                <div className="mt-1 text-[11px] font-semibold text-lume-accent">
                                  Save ${calculateYearlySavings(tier)}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* ── Right: gift details ── */}
              <div>
                <h2 className="font-display text-[clamp(1.6rem,2.6vw,2rem)] font-normal leading-[1.2] tracking-snug text-text-primary">
                  Gift details
                </h2>

                <div className="mt-6 space-y-8">
                  <fieldset>
                    <legend className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                      Your information
                    </legend>
                    <div className="mt-4 space-y-3">
                      <input
                        type="text"
                        name="giverName"
                        placeholder="Your name"
                        value={formData.giverName}
                        onChange={handleInputChange}
                        className={inputClass}
                        required
                      />
                      <input
                        type="email"
                        name="giverEmail"
                        placeholder="Your email"
                        value={formData.giverEmail}
                        onChange={handleInputChange}
                        className={inputClass}
                        required
                      />
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                      Recipient
                    </legend>
                    <div className="mt-4 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          name="recipientName"
                          placeholder="Recipient's name"
                          value={formData.recipientName}
                          onChange={handleInputChange}
                          className={inputClass}
                          required
                        />
                        <input
                          type="email"
                          name="recipientEmail"
                          placeholder="Recipient's email"
                          value={formData.recipientEmail}
                          onChange={handleInputChange}
                          className={inputClass}
                          required
                        />
                      </div>
                      <input
                        type="text"
                        name="recipientAddress"
                        placeholder="Delivery address"
                        value={formData.recipientAddress}
                        onChange={handleInputChange}
                        className={inputClass}
                        required
                      />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input
                          type="text"
                          name="recipientCity"
                          placeholder="City"
                          value={formData.recipientCity}
                          onChange={handleInputChange}
                          className={inputClass}
                          required
                        />
                        <input
                          type="text"
                          name="recipientState"
                          placeholder="State"
                          value={formData.recipientState}
                          onChange={handleInputChange}
                          className={inputClass}
                          required
                        />
                        <input
                          type="text"
                          name="recipientZip"
                          placeholder="ZIP"
                          value={formData.recipientZip}
                          onChange={handleInputChange}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                      Personal message
                    </legend>
                    <textarea
                      name="giftMessage"
                      placeholder="Write a note for the recipient…"
                      value={formData.giftMessage}
                      onChange={handleInputChange}
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </fieldset>

                  {tierData && (
                    <div className="rounded-2xl bg-canvas p-5">
                      <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                        Order summary
                      </h3>
                      <dl className="mt-3 space-y-2 text-[14px]">
                        <div className="flex justify-between gap-3">
                          <dt className="text-text-secondary">Haul</dt>
                          <dd className="font-semibold text-text-primary">{tierData.name}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-text-secondary">Billing</dt>
                          <dd className="font-semibold capitalize text-text-primary">
                            {billingCycle}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3 border-t border-black/[0.06] pt-3">
                          <dt className="text-[15px] font-semibold text-text-primary">Total</dt>
                          <dd className="font-display text-[24px] font-normal leading-none text-text-primary">
                            ${totalPrice.toFixed(2)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  {formError && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium leading-[1.5] text-red-700">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedTier || isSubmitting}
                    className={`btn-pill flex w-full items-center justify-center gap-2 px-6 py-4 text-[14px] font-semibold uppercase tracking-[0.04em] transition-all ${
                      selectedTier && !isSubmitting
                        ? 'bg-lume-house text-white hover:bg-black active:scale-[0.97]'
                        : 'cursor-not-allowed bg-black/[0.06] text-text-secondary'
                    }`}
                  >
                    <Gift className="h-4 w-4" />
                    {isSubmitting
                      ? 'Processing…'
                      : selectedTier
                        ? 'Complete gift purchase'
                        : 'Select a haul to continue'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
