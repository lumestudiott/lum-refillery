'use client';

import React, { Suspense } from 'react';
import { Gift, Home, Package } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';
import StatusCard from '@/components/editorial/StatusCard';

function GiftSuccessContent() {
  const searchParams = useSearchParams();
  const giftId = searchParams.get('gift_id');
  const giftSubscription = useQuery(
    api.giftSubscriptions.getGiftSubscriptionById,
    giftId ? { id: giftId as Id<'giftSubscriptions'> } : 'skip'
  );
  const tierInfo = giftSubscription
    ? SUBSCRIPTION_TIERS.find((tier) => tier.id === giftSubscription.tier)
    : null;

  return (
    <StatusCard
      variant="success"
      icon={Gift}
      title="Gift sent successfully"
      description="Your gift subscription has been purchased. The recipient will receive an email with their gift details and delivery information."
      primaryAction={{ href: '/gift', label: 'Send another gift', icon: Gift }}
      secondaryAction={{ href: '/', label: 'Back to home', icon: Home }}
    >
      {giftSubscription && tierInfo && (
        <div className="rounded-2xl bg-canvas p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            <Package className="h-4 w-4 text-lume-accent" strokeWidth={2} />
            Gift summary
          </h3>
          <dl className="mt-4 space-y-2.5 text-[14px]">
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">Package</dt>
              <dd className="font-semibold text-text-primary">{tierInfo.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">Billing</dt>
              <dd className="font-semibold capitalize text-text-primary">
                {giftSubscription.billingCycle}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">Recipient</dt>
              <dd className="font-semibold text-text-primary">{giftSubscription.recipientName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">Amount</dt>
              <dd className="font-semibold text-lume-accent">
                ${giftSubscription.amount.toFixed(2)}
              </dd>
            </div>
            {giftSubscription.giftMessage && (
              <div className="border-t border-black/[0.06] pt-3">
                <dt className="text-[12px] uppercase tracking-[0.06em] text-text-secondary">
                  Your message
                </dt>
                <dd className="mt-1 italic text-text-primary">
                  &ldquo;{giftSubscription.giftMessage}&rdquo;
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </StatusCard>
  );
}

export default function GiftSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-text-secondary">
          Loading…
        </div>
      }
    >
      <GiftSuccessContent />
    </Suspense>
  );
}
