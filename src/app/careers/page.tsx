'use client';

import React from 'react';
import { Clock, MapPin, Heart, Users, Leaf, Briefcase, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/editorial/PageHero';
import Section from '@/components/editorial/Section';
import FeatureGrid from '@/components/editorial/FeatureGrid';
import Reveal from '@/components/Reveal';

const BENEFITS = [
  {
    icon: Heart,
    title: 'Meaningful work',
    description:
      'Every day, you help families access nutritious food and support local farmers.',
  },
  {
    icon: Users,
    title: 'Great team',
    description: 'Work alongside passionate people who care about making a difference.',
  },
  {
    icon: Leaf,
    title: 'Sustainability focus',
    description: 'Be part of building a more sustainable food system for future generations.',
  },
  {
    icon: Briefcase,
    title: 'Growth opportunities',
    description: 'As we grow, so do opportunities for advancement and skill development.',
  },
];

const POSITIONS = [
  {
    title: 'Delivery Driver',
    type: 'Part-time',
    location: 'Port of Spain',
    description:
      'Join our delivery team and help bring fresh groceries to families across Trinidad.',
  },
  {
    title: 'Warehouse Associate',
    type: 'Full-time',
    location: 'Port of Spain',
    description: 'Help us pack and prepare hauls with care and attention to quality.',
  },
  {
    title: 'Customer Success Representative',
    type: 'Full-time',
    location: 'Remote',
    description:
      'Be the friendly voice that helps our subscribers get the most from their hauls.',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />
      <main className="pt-[72px]">
        <PageHero
          eyebrow="Careers"
          title="Join the team building a better food system."
          subtitle="We're looking for passionate people who care about community, quality, and Trinidad & Tobago."
        />

        <Section
          eyebrow="Why Lumë"
          title="Reasons to come work with us"
          description="It's hard, honest work — but it matters."
        >
          <FeatureGrid features={BENEFITS} variant="divided" columns={4} />
        </Section>

        {/* Open positions */}
        <Section
          eyebrow="Open positions"
          title="We're hiring"
          description="Join us. These are the roles we're actively filling."
          surface="white"
          centered={false}
        >
          <ul className="space-y-4">
            {POSITIONS.map((pos, i) => (
              <Reveal
                key={pos.title}
                as="li"
                delay={i * 80}
                duration={560}
                className="flex flex-col gap-4 rounded-2xl bg-canvas p-6 transition-shadow duration-300 hover:shadow-card md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold tracking-tight text-text-primary">
                    {pos.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-[1.65] text-text-secondary">
                    {pos.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-text-secondary">
                      <Clock className="h-3 w-3" strokeWidth={2} />
                      {pos.type}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-text-secondary">
                      <MapPin className="h-3 w-3" strokeWidth={2} />
                      {pos.location}
                    </span>
                  </div>
                </div>
                <a
                  href={`mailto:lumestudiott@gmail.com?subject=Application: ${pos.title}`}
                  className="btn-pill inline-flex shrink-0 items-center justify-center gap-2 bg-lume-house px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black active:scale-[0.97]"
                >
                  Apply now
                </a>
              </Reveal>
            ))}
          </ul>
        </Section>

        {/* Spontaneous application */}
        <Section spacing="compact">
          <Reveal duration={560} className="rounded-3xl bg-lume-accent/[0.06] p-10 text-center md:p-14">
            <h3 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-normal leading-[1.15] tracking-snug text-text-primary">
              Don't see your role?
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.7] text-text-secondary">
              We're always looking for talented people who share our passion for sustainable food
              systems. Send your resume and tell us how you'd like to contribute.
            </p>
            <a
              href="mailto:lumestudiott@gmail.com?subject=General Application - Lumë Refillery"
              className="btn-pill mt-6 inline-flex items-center gap-2 bg-lume-accent px-7 py-3.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-lume-green"
            >
              <Mail className="h-4 w-4" strokeWidth={2} />
              Send your resume
            </a>
          </Reveal>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
