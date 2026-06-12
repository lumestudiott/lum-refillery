'use client';

import React from 'react';
import { Leaf, Award, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/editorial/PageHero';
import Section from '@/components/editorial/Section';
import FeatureGrid from '@/components/editorial/FeatureGrid';
import CtaBanner from '@/components/editorial/CtaBanner';

const FEATURES = [
  {
    icon: Leaf,
    title: 'Peak Season Only',
    description: 'We only source produce when it naturally thrives, ensuring optimal flavor and nutrition without artificial growing environments.',
  },
  {
    icon: Award,
    title: 'Rare Heritage Varieties',
    description: 'We partner with farmers who cultivate forgotten heirloom varieties that prioritize taste and biodiversity over transport durability.',
  },
  {
    icon: MapPin,
    title: 'Direct from the Soil',
    description: 'By bypassing traditional wholesale markets, your produce spends less time in transit and more time retaining its vitality.',
  },
];

export default function SpecialtyProducePage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />
      <main className="pt-[72px]">
        <PageHero
          eyebrow="Sourcing / Fresh"
          title="Specialty Produce"
          subtitle="Seasonal produce and rare varieties with real flavor. We believe vegetables should taste like they used to — grown for flavor, not for logistics."
        />

        <Section
          eyebrow="The Standard"
          title="Farmed with intention"
          description="Our produce standards are uncompromising. We prioritize soil health, regenerative practices, and exceptional taste."
        >
          <FeatureGrid features={FEATURES} variant="cards" columns={3} />
        </Section>

        {/* Highlight Section */}
        <Section
          eyebrow="Our Process"
          title="Harvest to Haul"
          description="How we ensure the freshest possible delivery."
          surface="white"
        >
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-[#A4A67B]/20">
              <img 
                src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=1200&q=90" 
                alt="Fresh produce"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center space-y-6">
              <h3 className="font-display text-[32px] text-lume-house">Timing is everything</h3>
              <p className="text-[16px] leading-[1.8] text-text-secondary">
                Unlike traditional supermarkets where produce can sit in cold storage for weeks or even months, our supply chain is designed for immediacy. 
              </p>
              <p className="text-[16px] leading-[1.8] text-text-secondary">
                When you order a Lumë Haul, the produce is often still in the ground. It is harvested, packed, and delivered to your door in a continuous flow, ensuring you get it at the absolute peak of its lifespan.
              </p>
            </div>
          </div>
        </Section>

        <CtaBanner
          eyebrow="Taste the difference"
          title="Build your weekly haul"
          description="Ready to experience produce the way it was meant to taste? Explore this week's seasonal harvest."
          primaryHref="/shop"
          primaryLabel="Browse Produce"
          secondaryHref="/sourcing-standards"
          secondaryLabel="All Sourcing Standards"
        />
      </main>
      <Footer />
    </div>
  );
}
