'use client';

import React from 'react';
import Reveal from './Reveal';

const problems = [
  {
    icon: '/icons/pomodoro-technique.png',
    title: 'Time Consuming',
    description: 'Unplanned grocery runs steal your evenings and eat into your weekends.',
    blob: '60% 40% 70% 30% / 50% 60% 40% 50%',
  },
  {
    icon: '/icons/garbage.png',
    title: 'Wasteful',
    description: 'Single-use packaging piles up every week with no easy alternative.',
    blob: '40% 60% 30% 70% / 55% 45% 60% 40%',
  },
  {
    icon: '/icons/store.png',
    title: 'Big Brands Only',
    description: 'Big stores leave no room for local makers who can\u2019t pay for shelf space.',
    blob: '50% 50% 60% 40% / 40% 65% 35% 60%',
  },
  {
    icon: '/icons/money.png',
    title: 'Surprise Bills',
    description: 'A simple restock becomes an unpredictable expense every single trip.',
    blob: '70% 30% 50% 50% / 45% 55% 50% 50%',
  },
  {
    icon: '/icons/forbidden.png',
    title: 'Cosmetic Waste',
    description: 'Good produce gets wasted for cosmetic reasons. Foods are just shaped different.',
    blob: '45% 55% 65% 35% / 60% 40% 55% 45%',
  },
  {
    icon: '/icons/refresh.png',
    title: 'Same-Old, Same-Old',
    description: 'There\u2019s no easy way to build a refill habit or discover new local finds.',
    blob: '55% 45% 40% 60% / 50% 50% 65% 35%',
  },
];


const benefits = [
  {
    title: 'Curated Hauls',
    description: 'We offer light-bulk grocery shopping, food hauls inspired by the six Caribbean food groups, household and personal care items, all thoughtfully curated to improve access to nutrition-rich foods without making you think as hard.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=1400&q=90',
  },
  {
    title: 'Built for Caribbean Life',
    description: ' Caribbean Life is shaped by the climate and landscape. Our culture, history, the heat and humidity, the way we live, cook, and think.',
    image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1400&q=90',
  },
  {
    title: 'Honouring Food Rituals',
    description: 'Because food is never just one thing. It is fuel, yes, but it is also culture, memory, celebration, and daily ritual. It is the Sunday morning fry bake, the pot of soup that fixes everything, and the spread that brings everyone to the table.',
  },
  {
    title: 'Beverages for Every Moment',
    description: 'Whether you\u2019re pushing your limits at the gym, raising a glass at a celebration, reaching for your morning brew, or simply existing quietly, there is something here for you.',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1400&q=90',
  },
  {
    title: 'A Deliberate Low-Waste Approach',
    description: "We believe in doing better by the planet, one small step at a time. Lumë takes a low-waste approach, not a perfect one, but a deliberate one. Because hygiene, health, and regulatory compliance mean some packaging is non-negotiable, you may notice that certain items are lightly packaged while others appear more protected than expected. Please don't be alarmed, every decision is made with your safety and well-being in mind.",
    image: 'https://images.unsplash.com/photo-1522184216316-3c25379f9760?auto=format&fit=crop&w=1400&q=90',
  },
  {
    title: 'Exactly What You Need',
    description: 'We\u2019re not here to be everything. We\u2019re here to be exactly what you need.',
  },
];

/**
 * CSS-only parallax image.
 *
 * The outer div uses `.parallax-viewport` to publish a `view-timeline`, and
 * the inner `<img>` uses `.parallax-img-y` to animate off of it. In browsers
 * without `animation-timeline: view()` the image renders statically, which
 * is the intended graceful degradation.
 */
const ParallaxImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => (
  <div className={`parallax-viewport overflow-hidden ${className || ''}`}>
    <img
      src={src}
      alt={alt}
      className="parallax-img-y h-[125%] w-full object-cover"
      loading="lazy"
    />
  </div>
); const About: React.FC = () => {
  return (
    <section id="about" className="overflow-hidden">

      {/* ── Problem Statement ── */}
      <div className="relative bg-canvas overflow-hidden">
        {/* Wavy Background Shape */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <svg
            viewBox="0 0 1440 2000"
            preserveAspectRatio="none"
            className="w-full h-full text-[#A8D5A2]"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,150 C480,-250 960,400 1440,150 L1440,1700 C960,2000 480,1400 0,1700 Z" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-2 pt-32 text-center lg:px-16">
          <Reveal as="p" duration={1200} className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent">
            The problem
          </Reveal>

          <Reveal as="h2" direction="up" duration={1000} className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] tracking-tight text-text-primary">
            The grocery system is broken
          </Reveal>

          <Reveal as="p" direction="none" duration={800} delay={150} className="mx-auto mt-5 max-w-none text-[16px] leading-[1.8] text-text-secondary">
            Big Grocery puts profit over people and the planet, making nutrition-rich foods harder to access. Everyone loses and here&apos;s what you&apos;re left with:
          </Reveal>
        </div>

        {/* Problem grid */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 pb-96 pt-8 lg:px-16">
          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem, index) => (
              <Reveal
                key={problem.title}
                duration={800}
                delay={index * 80}
                direction="up"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center bg-gradient-to-br from-lume-accent/80 via-lume-accent/50 to-lume-green/30"
                    style={{ borderRadius: problem.blob }}
                  >
                    <img
                      src={problem.icon}
                      alt={problem.title}
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                  <h3 className="text-[16px] font-bold tracking-tight text-text-primary">
                    {problem.title}
                  </h3>
                </div>
                <p className="mt-3 text-[14px] leading-[1.7] text-text-secondary">
                  {problem.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── Benefits (Compact Bento Row Layout) ── */}
      <div className="bg-canvas pt-12 pb-32 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-lume-green/[0.04] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-amber-500/[0.03] pointer-events-none translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-4 text-center lg:px-16">
          <Reveal as="div" duration={1200} className="mb-4 inline-block text-[13px] font-bold uppercase tracking-widest text-lume-accent">
            Why Choose Lumë
          </Reveal>
          <Reveal as="h2" direction="up" duration={1000} className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] tracking-tight text-text-primary">
            Why Lumë is different
          </Reveal>
          <Reveal as="p" direction="none" duration={800} delay={150} className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.7] text-text-secondary">
            Life is expensive and time is scarce. Eating well shouldn&apos;t feel like a second job. We exist to trade you back two of your most valuable resources: time and mental energy.
          </Reveal>
        </div>

        {/* Bento Grid — 6 cards */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-16 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">

            {/* ── Card 1: Curated Grocery Hauls (7/12) — image card ── */}
            <Reveal duration={800} delay={50} direction="up" className="md:col-span-7 flex">
              <div className="bg-lume-house rounded-3xl border border-white/[0.05] overflow-hidden flex flex-col w-full group hover:shadow-soft-float hover:-translate-y-1 transition-all duration-500">
                <div className="relative aspect-[2/1] w-full overflow-hidden shrink-0">
                  <img
                    src={benefits[0].image}
                    alt={benefits[0].title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/5 text-[11px] font-bold tracking-widest text-white mb-4">01</span>
                    <h3 className="font-display text-[20px] font-normal leading-snug text-white">
                      {benefits[0].title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/80">
                      {benefits[0].description}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ── Card 2: Built for Caribbean Life (5/12) — image card ── */}
            <Reveal duration={800} delay={150} direction="up" className="md:col-span-5 flex">
              <div className="bg-[#DAB257] rounded-3xl border border-black/[0.04] overflow-hidden flex flex-col w-full group hover:shadow-soft-float hover:-translate-y-1 transition-all duration-500">
                <div className="relative aspect-video md:aspect-[4/3] w-full overflow-hidden shrink-0">
                  <img
                    src={benefits[1].image}
                    alt={benefits[1].title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 border border-white/10 text-[11px] font-bold tracking-widest text-white mb-4">02</span>
                    <h3 className="font-display text-[20px] font-normal leading-snug text-white">
                      {benefits[1].title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/90">
                      {benefits[1].description}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ── Card 3: Honouring Food Rituals (4/12) — text-only dark card ── */}
            <Reveal duration={800} delay={100} direction="up" className="md:col-span-4 flex">
              <div className="bg-[#B05A32] rounded-3xl border border-white/[0.05] overflow-hidden flex flex-col w-full p-6 md:p-8 group hover:shadow-soft-float hover:-translate-y-1 transition-all duration-500">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 border border-white/10 text-[11px] font-bold tracking-widest text-white mb-4">03</span>
                <h3 className="font-display text-[22px] font-normal leading-snug text-white">
                  {benefits[2].title}
                </h3>
                <p className="mt-3 text-[13px] leading-[1.8] text-white/85 flex-grow">
                  {benefits[2].description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[12px] font-medium text-white/60">
                  <span className="inline-block w-8 h-[1px] bg-white/30" />
                  We honour all of it.
                </div>
              </div>
            </Reveal>

            {/* ── Card 4: Beverages for Every Moment (4/12) — image card ── */}
            <Reveal duration={800} delay={200} direction="up" className="md:col-span-4 flex">
              <div className="bg-[#7C9046] rounded-3xl border border-black/[0.04] overflow-hidden flex flex-col w-full group hover:shadow-soft-float hover:-translate-y-1 transition-all duration-500">
                <div className="relative aspect-video w-full overflow-hidden shrink-0">
                  <img
                    src={benefits[3].image}
                    alt={benefits[3].title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 border border-white/10 text-[11px] font-bold tracking-widest text-white mb-4">04</span>
                    <h3 className="font-display text-[18px] font-normal leading-snug text-white">
                      {benefits[3].title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/90">
                      {benefits[3].description}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ── Card 5: Exactly What You Need (4/12) — accent statement card ── */}
            <Reveal duration={800} delay={300} direction="up" className="md:col-span-4 flex">
              <div className="bg-[#3A4C22] rounded-3xl border border-white/10 overflow-hidden flex flex-col w-full p-6 md:p-8 group hover:shadow-soft-float hover:-translate-y-1 transition-all duration-500 justify-center items-center text-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/5 text-[11px] font-bold tracking-widest text-white mb-4">05</span>
                <h3 className="font-display text-[clamp(1.4rem,2.5vw,1.8rem)] font-normal leading-snug text-white">
                  {benefits[5].title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.7] text-white/80 max-w-xs">
                  {benefits[5].description}
                </p>
                <a href="#faq" className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-white bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-all duration-300">
                  Have questions?
                  <svg className="w-3.5 h-3.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>
            </Reveal>

            {/* ── Card 6: Low-Waste Approach (12/12) — wide dark card with image ── */}
            <Reveal duration={800} delay={250} direction="up" className="md:col-span-12 flex">
              <div className="bg-[#466723] rounded-3xl border border-white/[0.05] overflow-hidden w-full grid grid-cols-1 md:grid-cols-12 group hover:shadow-soft-float hover:-translate-y-1 transition-all duration-500">
                <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-center text-white order-2 md:order-1">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 border border-white/10 text-[11px] font-bold tracking-widest text-white mb-4">06</span>
                  <h3 className="font-display text-[22px] font-normal leading-snug text-white">
                    {benefits[4].title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/90 max-w-xl">
                    {benefits[4].description}
                  </p>
                </div>
                <div className="md:col-span-5 relative min-h-[200px] md:min-h-full overflow-hidden order-1 md:order-2">
                  <img
                    src={benefits[4].image}
                    alt={benefits[4].title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
