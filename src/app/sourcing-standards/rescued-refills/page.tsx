'use client';

import React from 'react';
import { PackageOpen, Recycle, DollarSign } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/editorial/PageHero';
import Section from '@/components/editorial/Section';
import FeatureGrid from '@/components/editorial/FeatureGrid';
import CtaBanner from '@/components/editorial/CtaBanner';

const FEATURES = [
  {
    icon: PackageOpen,
    title: 'Imperfect Packaging',
    description: 'We purchase high-quality goods that have dented boxes, misprinted labels, or discontinued packaging from premium brands.',
  },
  {
    icon: Recycle,
    title: 'Preventing Waste',
    description: 'Perfectly good food often goes to landfills due to cosmetic standards. We intercept these items and give them a home.',
  },
  {
    icon: DollarSign,
    title: 'Accessible Pricing',
    description: 'By rescuing these items, we secure them at a lower cost and pass those savings directly on to you in your weekly haul.',
  },
];

export default function RescuedRefillsPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />
      <main className="pt-[72px]">
        <PageHero
          eyebrow="Sourcing / Saved"
          title="Rescued Refills"
          subtitle="High-quality groceries that deserve a home. Still fresh, always useful. It's our answer to unnecessary food waste."
        />

        <Section
          eyebrow="The Standard"
          title="Perfectly imperfect"
          description="We evaluate every rescued item to ensure it is 100% safe, fresh, and delicious, regardless of what the outside looks like."
        >
          <FeatureGrid features={FEATURES} variant="cards" columns={3} />
        </Section>

        {/* Highlight Section */}
        <Section
          eyebrow="The Impact"
          title="Redefining value"
          description="A new way to look at grocery shopping."
          surface="white"
        >
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-[#E7AD47]/20">
              <img 
                src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1200&q=90" 
                alt="Rescued refills"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center space-y-6">
              <h3 className="font-display text-[32px] text-lume-house">Quality remains</h3>
              <p className="text-[16px] leading-[1.8] text-text-secondary">
                The modern grocery industry operates on strict aesthetic standards. If a jar has a scuffed label or a box is slightly crushed during transit, it's often thrown away—even if the food inside is completely untouched.
              </p>
              <p className="text-[16px] leading-[1.8] text-text-secondary">
                We've built relationships with distributors and producers to take these "imperfect" items off their hands. The result is less waste for the planet, and exceptional pantry staples for your kitchen at a fraction of the cost.
              </p>
            </div>
          </div>
        </Section>

        <CtaBanner
          eyebrow="Join the effort"
          title="Shop the rescued collection"
          description="Explore our current inventory of rescued pantry staples and snacks."
          primaryHref="/shop"
          primaryLabel="Browse Rescued"
          secondaryHref="/sourcing-standards"
          secondaryLabel="All Sourcing Standards"
        />
      </main>
      <Footer />
    </div>
  );
}
