'use client';

import React from 'react';
import { Shield, Users, Leaf, Truck, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/editorial/PageHero';
import Section from '@/components/editorial/Section';
import FeatureGrid from '@/components/editorial/FeatureGrid';
import StatGrid from '@/components/editorial/StatGrid';
import CtaBanner from '@/components/editorial/CtaBanner';
import Reveal from '@/components/Reveal';

const STANDARDS = [
  {
    icon: Shield,
    title: 'Quality assurance',
    description: 'Every product meets a strict bar for freshness, traceability, and shelf life.',
    points: [
      'All products inspected upon receipt',
      'Temperature-controlled storage',
      'Regular supplier audits',
      'Batch tracking for traceability',
    ],
  },
  {
    icon: Users,
    title: 'Supplier requirements',
    description: 'Our partners share our values around fair work and honest commerce.',
    points: [
      'Fair labor practices certification',
      'Food safety compliance',
      'Transparent pricing agreements',
      'Commitment to sustainability',
    ],
  },
  {
    icon: Leaf,
    title: 'Environmental standards',
    description: 'Every choice — from packaging to logistics — is judged on its footprint.',
    points: [
      'Minimal packaging requirements',
      'Local sourcing prioritized',
      'Organic options where available',
      'Zero single-use plastics goal',
    ],
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Identify',
    desc: 'We research and identify potential suppliers who align with our values.',
  },
  {
    step: '02',
    title: 'Evaluate',
    desc: 'Suppliers undergo rigorous evaluation for quality, ethics, and sustainability.',
  },
  {
    step: '03',
    title: 'Partner',
    desc: 'We establish fair, long-term partnerships with approved suppliers.',
  },
  {
    step: '04',
    title: 'Monitor',
    desc: 'Ongoing quality checks and audits ensure standards are maintained.',
  },
];

const STATS = [
  { icon: Truck, value: '80%', label: 'Locally sourced' },
  { icon: Users, value: '25+', label: 'Local partner farms' },
  { icon: Award, value: '100%', label: 'Fair trade commitment' },
];

export default function SourcingStandardsPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />
      <main className="pt-[72px]">
        <PageHero
          eyebrow="Sourcing"
          title="The bar we hold ourselves to."
          subtitle="From small island farms to your kitchen, every product has a story — and a standard. Here's how we ensure quality from farm to table."
        />

        <Section
          eyebrow="Standards"
          title="Three pillars of sourcing"
          description="Every supplier we partner with meets these criteria. Non-negotiable."
        >
          <FeatureGrid features={STANDARDS} variant="cards" columns={3} />
        </Section>

        {/* Process */}
        <Section
          eyebrow="The process"
          title="How we vet a producer"
          description="From first conversation to long-term partnership, here's how we work."
          surface="white"
        >
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 md:gap-y-0 lg:grid-cols-4">
            {PROCESS_STEPS.map((item, i) => (
              <Reveal
                key={item.step}
                delay={i * 80}
                duration={560}
                className="md:border-l md:border-black/[0.08] md:first:border-l-0 md:px-8"
              >
                <div className="font-display text-[clamp(2rem,3vw,2.6rem)] font-normal leading-[1] tracking-tight text-lume-accent">
                  {item.step}
                </div>
                <h3 className="mt-5 font-display text-[19px] font-medium leading-tight tracking-snug text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-text-secondary">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="By the numbers"
          title="Supporting Trinidad & Tobago"
          description="Real impact, measured and reported transparently."
        >
          <StatGrid stats={STATS} columns={3} variant="bare" />
        </Section>

        <CtaBanner
          eyebrow="Eat with confidence"
          title="Know what's on your plate"
          description="Every haul comes with sourcing details — origins, farmers, certifications. Total transparency."
          primaryHref="/sample-hauls"
          primaryLabel="Browse hauls"
          secondaryHref="/sustainability"
          secondaryLabel="Our sustainability"
        />
      </main>
      <Footer />
    </div>
  );
}
