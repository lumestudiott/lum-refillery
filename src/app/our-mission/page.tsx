'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Users, Leaf, Target } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/editorial/PageHero';
import Section from '@/components/editorial/Section';
import FeatureGrid from '@/components/editorial/FeatureGrid';
import CtaBanner from '@/components/editorial/CtaBanner';
import Reveal from '@/components/Reveal';

const VALUES = [
  {
    icon: Heart,
    title: 'Community First',
    description:
      'We prioritize the wellbeing of our community, ensuring everyone has access to nutritious food.',
  },
  {
    icon: Users,
    title: 'Fair Partnerships',
    description:
      'We pay fair prices to farmers and suppliers, building lasting relationships built on trust.',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    description:
      'We minimize waste, use eco-friendly packaging, and support regenerative farming practices.',
  },
  {
    icon: Target,
    title: 'Transparency',
    description:
      'We believe you should know where your food comes from and how it reaches your table.',
  },
];

export default function OurMissionPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />
      <main className="pt-[72px]">
        <PageHero
          eyebrow="Our Mission"
          title="Fresh, fair groceries for every Trinidadian table."
          subtitle="Connecting households directly with local farms — cutting out middlemen, reducing waste, and ensuring everyone gets a fair deal."
        />

        {/* Why we started */}
        <Section spacing="spacious">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <Reveal duration={700}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&auto=format&fit=crop"
                  alt="Fresh local produce"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal duration={700} delay={120}>
              <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-lume-accent">
                Why we started
              </span>
              <h2 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-normal leading-[1.15] tracking-snug text-text-primary">
                A simple observation about the food we eat.
              </h2>
              <div className="mt-5 space-y-4 text-[15px] leading-[1.8] text-text-secondary">
                <p>
                  Too many families struggle to access fresh, quality groceries at fair prices,
                  while local farmers struggle to find consistent markets for their produce.
                </p>
                <p>
                  We created a subscription model that solves both problems. By connecting
                  households directly with local suppliers, we cut out middlemen, reduce waste,
                  and ensure everyone gets a fair deal.
                </p>
                <p>
                  Our name <em>Lumë</em> means light in Albanian — representing our commitment to
                  bringing transparency and clarity to the food supply chain.
                </p>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Core values */}
        <Section
          eyebrow="Our values"
          title="The principles behind every box"
          description="These commitments guide every decision we make, from sourcing to delivery."
        >
          <FeatureGrid features={VALUES} variant="divided" columns={4} />
        </Section>

        <CtaBanner
          eyebrow="Get involved"
          title="Join our mission"
          description="Every subscription helps build a more sustainable food system for Trinidad & Tobago."
          primaryHref="/shop"
          primaryLabel="Start a subscription"
          secondaryHref="/shop"
          secondaryLabel="Browse the shop"
        />
      </main>
      <Footer />
    </div>
  );
}
