'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  PackageCheck,
  RefreshCw,
  Shield,
  Truck,
} from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/editorial/PageHero';
import Section from '@/components/editorial/Section';
import FeatureGrid from '@/components/editorial/FeatureGrid';
import CtaBanner from '@/components/editorial/CtaBanner';
import TierCard from '@/components/TierCard';
import Reveal from '@/components/Reveal';

const FEATURES = [
  {
    icon: Truck,
    title: 'Delivery stays scheduled',
    description: 'Fortnightly, monthly, or yearly cadence — choose what fits your kitchen.',
  },
  {
    icon: Shield,
    title: 'Substitutions are explicit',
    description: 'Every tier comes with a written substitution policy. No surprises in the box.',
  },
  {
    icon: RefreshCw,
    title: 'Reusable by default',
    description: 'Built around refills and returns — minimal packaging, maximum reuse.',
  },
  {
    icon: CalendarDays,
    title: 'Pause anytime',
    description: "Skip a delivery, pause for travel — designed for real life's rhythms.",
  },
];

export default function SampleHaulsPage() {
  const [billingCycle, setBillingCycle] = useState<'fortnightly' | 'monthly' | 'yearly'>('monthly');
  const [priceRange, setPriceRange] = useState<'all' | 'under50' | '50to100' | 'over100'>('all');

  const filtered = SUBSCRIPTION_TIERS.filter((tier) => {
    if (priceRange === 'all') return true;
    const price = tier.price[billingCycle];
    if (priceRange === 'under50') return price < 50;
    if (priceRange === '50to100') return price >= 50 && price <= 100;
    return price > 100;
  });

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="pt-[72px]">
        <PageHero
          eyebrow="Sample Hauls"
          title="Preview the rhythm before you subscribe."
          subtitle="These aren't one-off product listings. Each haul shows the kind of provisions, substitution policy, and billing rhythm Lumë plans for a household."
        >
          <div className="inline-flex items-center gap-2 rounded-pill bg-lume-accent/10 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-lume-accent">
            <PackageCheck className="h-4 w-4" />
            {filtered.length} previews
          </div>
        </PageHero>

        {/* Why hauls */}
        <Section
          eyebrow="Why hauls work"
          title="Designed around your kitchen — not ours"
          description="Four ideas that shape every haul we plan."
        >
          <FeatureGrid features={FEATURES} variant="divided" columns={4} />
        </Section>

        {/* Filter bar + grid */}
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-normal leading-[1.15] tracking-snug text-text-primary">
                Browse hauls
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={billingCycle}
                  onChange={(e) =>
                    setBillingCycle(e.target.value as 'fortnightly' | 'monthly' | 'yearly')
                  }
                  className="rounded-pill border border-black/[0.08] bg-canvas px-4 py-2 text-[13px] font-medium text-text-primary outline-none transition-colors hover:border-black/[0.15] focus:border-lume-accent"
                >
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <select
                  value={priceRange}
                  onChange={(e) =>
                    setPriceRange(e.target.value as 'all' | 'under50' | '50to100' | 'over100')
                  }
                  className="rounded-pill border border-black/[0.08] bg-canvas px-4 py-2 text-[13px] font-medium text-text-primary outline-none transition-colors hover:border-black/[0.15] focus:border-lume-accent"
                >
                  <option value="all">All prices</option>
                  <option value="under50">Under $50</option>
                  <option value="50to100">$50 — $100</option>
                  <option value="over100">Over $100</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tier, index) => (
                <Reveal key={tier.id} delay={index * 60} duration={560}>
                  <TierCard tier={tier} billingCycle={billingCycle} index={index} />
                </Reveal>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-12 rounded-2xl bg-canvas p-12 text-center">
                <p className="text-[15px] text-text-secondary">
                  No hauls match those filters. Try a different price range.
                </p>
              </div>
            )}
          </div>
        </section>

        <CtaBanner
          eyebrow="Not sure?"
          title="Take the quiz to find your match"
          description="Answer a few questions about your household and we'll match a haul to your rhythm and cooking style."
          primaryHref="/quiz"
          primaryLabel="Take the quiz"
          secondaryHref="/shop"
          secondaryLabel="Browse the shop"
        />

        {/* Back link */}
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.06em] text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
