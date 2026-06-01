'use client';

import React from 'react';
import { Sprout, ShoppingCart, Package, Truck, Leaf, Recycle, Heart, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/editorial/PageHero';
import Section from '@/components/editorial/Section';
import FeatureGrid from '@/components/editorial/FeatureGrid';
import CtaBanner from '@/components/editorial/CtaBanner';

const PROCESS = [
  {
    icon: Sprout,
    title: 'Source from local farms',
    description:
      'We partner with sustainable farms across Trinidad & Tobago to bring you the freshest seasonal produce.',
  },
  {
    icon: ShoppingCart,
    title: 'Curate your haul',
    description:
      'Our team carefully selects premium items based on your subscription tier and dietary preferences.',
  },
  {
    icon: Package,
    title: 'Pack with care',
    description:
      'Everything is packed in eco-friendly materials to maintain freshness during delivery.',
  },
  {
    icon: Truck,
    title: 'Deliver to your door',
    description:
      'Fresh groceries arrive at your doorstep on your scheduled day — no fridge runs needed.',
  },
];

const COMMITMENTS = [
  {
    icon: Leaf,
    title: 'Carbon footprint reduction',
    description:
      'By sourcing locally and optimizing delivery routes, we minimize transportation emissions and support regional food systems.',
  },
  {
    icon: Recycle,
    title: 'Sustainable packaging',
    description:
      'All packaging materials are reusable, recyclable, or compostable. We are committed to zero single-use plastics.',
  },
  {
    icon: Heart,
    title: 'Community support',
    description:
      'Every subscription directly supports local farmers and food producers, strengthening our regional economy.',
  },
  {
    icon: Globe,
    title: 'Regenerative agriculture',
    description:
      'We prioritize partnerships with farms practicing regenerative agriculture that improves soil health and biodiversity.',
  },
];

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />
      <main className="pt-[72px]">
        <PageHero
          eyebrow="Sustainability"
          title="Sustainability isn't a buzzword. It's the foundation."
          subtitle="From the field to your fridge, every step is designed with environmental responsibility and community impact in mind."
          variant="dark"
          imageUrl="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop"
        />

        <Section
          eyebrow="The process"
          title="How we work sustainably"
          description="Four steps from farm to your table — each chosen to minimize impact and maximize freshness."
        >
          <FeatureGrid features={PROCESS} variant="inline" columns={2} />
        </Section>

        <Section
          eyebrow="Our commitments"
          title="What we promise"
          description="Concrete commitments — not vague intentions — that shape every operational decision."
        >
          <FeatureGrid features={COMMITMENTS} variant="inline" columns={2} />
        </Section>

        <CtaBanner
          eyebrow="Take part"
          title="Join the sustainable food movement"
          description="Every subscription supports local farmers, reduces food miles, and helps build a more sustainable food system."
          primaryHref="/sample-hauls"
          primaryLabel="Start a subscription"
          secondaryHref="/sourcing-standards"
          secondaryLabel="See our sourcing"
        />
      </main>
      <Footer />
    </div>
  );
}
