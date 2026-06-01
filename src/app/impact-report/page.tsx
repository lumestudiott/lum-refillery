'use client';

import React from 'react';
import { Users, Package, Heart, Leaf, Recycle, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/editorial/PageHero';
import Section from '@/components/editorial/Section';
import StatGrid from '@/components/editorial/StatGrid';
import Reveal from '@/components/Reveal';

const METRICS = [
  { icon: Users, value: '500+', label: 'Active subscribers' },
  { icon: Package, value: '12,000+', label: 'Hauls delivered' },
  { icon: Heart, value: '150+', label: 'Supported hauls given' },
  { icon: Leaf, value: '2.5 tons', label: 'Food waste prevented' },
  { icon: Recycle, value: '85%', label: 'Packaging recycled' },
  { icon: TrendingUp, value: '$50K+', label: 'Paid to local farmers' },
];

const COMMUNITY_DATA = [
  { label: 'Families fed monthly', value: '500+', percent: 75 },
  { label: 'Supported hauls distributed', value: '150+', percent: 45 },
  { label: 'Customer satisfaction', value: '98%', percent: 98 },
];

const ENVIRONMENTAL_DATA = [
  { label: 'Carbon footprint reduction', value: '30%', percent: 30 },
  { label: 'Plastic-free packaging', value: '65%', percent: 65 },
  { label: 'Local sourcing rate', value: '80%', percent: 80 },
];

const GOALS_2025 = [
  { target: '1,000', label: 'Active subscribers', current: '500+' },
  { target: '100%', label: 'Plastic-free packaging', current: '65%' },
  { target: '500', label: 'Supported hauls / year', current: '150+' },
  { target: '90%', label: 'Local sourcing', current: '80%' },
];

function ProgressCard({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: string; percent: number }[];
}) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-card">
      <h3 className="font-display text-[20px] font-normal leading-tight tracking-snug text-text-primary">
        {title}
      </h3>
      <div className="mt-6 space-y-5">
        {data.map((d) => (
          <div key={d.label}>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[14px] text-text-secondary">{d.label}</span>
              <span className="text-[15px] font-semibold tracking-tight text-text-primary">
                {d.value}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-lume-accent"
                style={{ width: `${d.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ImpactReportPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />
      <main className="pt-[72px]">
        <PageHero
          eyebrow="2024 Report"
          title="Impact, in numbers."
          subtitle="Measuring our progress toward a more sustainable and equitable food system in Trinidad & Tobago."
          variant="dark"
        />

        <Section
          eyebrow="Key metrics"
          title="The year at a glance"
          description="Six numbers that capture what we built — and where we have to go."
        >
          <StatGrid stats={METRICS} columns={3} variant="bare" />
        </Section>

        <Section
          eyebrow="Progress"
          title="Community & environmental impact"
          description="Comparing what we promised against what we delivered."
          surface="white"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal duration={560}>
              <ProgressCard title="Community impact" data={COMMUNITY_DATA} />
            </Reveal>
            <Reveal duration={560} delay={100}>
              <ProgressCard title="Environmental impact" data={ENVIRONMENTAL_DATA} />
            </Reveal>
          </div>
        </Section>

        <Section
          eyebrow="Looking ahead"
          title="2025 Goals"
          description="The targets we're aiming for in the next twelve months."
        >
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 md:gap-y-0 lg:grid-cols-4">
            {GOALS_2025.map((g, i) => (
              <Reveal
                key={g.label}
                delay={i * 80}
                duration={560}
                className="text-center md:border-l md:border-black/[0.08] md:first:border-l-0 md:px-8"
              >
                <div className="font-display text-[clamp(2.4rem,4vw,3.2rem)] font-normal leading-[1.05] tracking-tight text-lume-accent">
                  {g.target}
                </div>
                <div className="mt-3 text-[14px] font-semibold text-text-primary">{g.label}</div>
                <div className="mt-1.5 text-[12px] uppercase tracking-[0.08em] text-text-secondary">
                  Currently {g.current}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
