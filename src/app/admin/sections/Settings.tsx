'use client';

import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Check, CreditCard, Landmark, AlertTriangle } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import { Card, Loading, SectionHeader, useToast } from '../lib';

type Provider = 'stripe' | 'wipay';

export default function Settings() {
  const provider = useQuery(api.payments.getActiveProvider);
  const setProvider = useMutation(api.payments.setActiveProvider);
  const toast = useToast();

  async function choose(p: Provider) {
    if (p === provider) return;
    try {
      await setProvider({ provider: p });
      toast(`Payment provider set to ${p === 'wipay' ? 'WiPay' : 'Stripe'}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Store configuration." />

      <Card className="max-w-2xl p-6">
        <h2 className="font-display text-[20px] font-normal tracking-tight text-text-primary">
          Payment provider
        </h2>
        <p className="mt-1 text-[13px] leading-[1.6] text-text-secondary">
          Which gateway the storefront uses for checkout and onboarding. Flip this once
          WiPay is registered — customers switch instantly.
        </p>

        {provider === undefined ? (
          <Loading />
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Option
              active={provider === 'stripe'}
              onClick={() => choose('stripe')}
              Icon={CreditCard}
              name="Stripe"
              desc="Inline card payments. Live now."
              tag="Active &amp; ready"
              tagOk
            />
            <Option
              active={provider === 'wipay'}
              onClick={() => choose('wipay')}
              Icon={Landmark}
              name="WiPay"
              desc="Caribbean gateway (TTD), hosted redirect."
              tag="Scaffolded — needs credentials"
            />
          </div>
        )}

        {provider === 'wipay' && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/50 bg-amber-50 px-3.5 py-3 text-[12.5px] leading-[1.5] text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              WiPay is selected but <strong>not configured yet</strong>. Add the{' '}
              <code className="font-mono">WIPAY_ACCOUNT_NUMBER</code> and{' '}
              <code className="font-mono">WIPAY_API_KEY</code> env vars (and finish the
              integration) before going live. Until then, customers see a “not available”
              notice at payment.
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

function Option({
  active,
  onClick,
  Icon,
  name,
  desc,
  tag,
  tagOk,
}: {
  active: boolean;
  onClick: () => void;
  Icon: typeof CreditCard;
  name: string;
  desc: string;
  tag: string;
  tagOk?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
        active
          ? 'border-lume-accent bg-lume-accent/[0.05]'
          : 'border-black/[0.08] bg-white hover:border-lume-accent/30'
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-lume-accent text-white">
          <Check className="h-3 w-3" />
        </span>
      )}
      <Icon className="h-6 w-6 text-lume-accent" strokeWidth={1.8} />
      <div className="mt-3 text-[15px] font-semibold text-text-primary">{name}</div>
      <div className="mt-0.5 text-[12.5px] leading-[1.4] text-text-secondary">{desc}</div>
      <div
        className={`mt-2.5 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.04em] ${
          tagOk ? 'bg-lume-accent/10 text-lume-accent' : 'bg-gold/15 text-[#8a6a22]'
        }`}
        dangerouslySetInnerHTML={{ __html: tag }}
      />
    </button>
  );
}
