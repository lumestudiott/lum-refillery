'use client';

import React from 'react';
import Reveal from './Reveal';

/**
 * CSS-only parallax image — reuses the `.parallax-viewport` /
 * `.parallax-img-y-sm` classes defined in `globals.css`.
 */
const ParallaxImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="parallax-viewport absolute inset-0 overflow-hidden">
    <img
      src={src}
      alt={alt}
      className="parallax-img-y-sm h-[120%] w-full object-cover"
      loading="lazy"
    />
  </div>
);

const valuePills = ['Craft', 'Transparency', 'Local Impact'] as const;

const SmallMakers: React.FC = () => {
  return (
    <section className="overflow-hidden bg-canvas">

      {/* ── Hero header ── */}
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-28 lg:px-16">
        <Reveal
          as="p"
          duration={1200}
          className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent"
        >
          Small Makers
        </Reveal>

        <Reveal
          as="h2"
          direction="up"
          duration={1000}
          className="mt-6 max-w-4xl font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] tracking-tight text-text-primary"
        >
          Some things can&apos;t be mass-produced
          <br className="hidden sm:inline" />
          &nbsp;&mdash; and they shouldn&apos;t be.
        </Reveal>
      </div>

      {/* ── Block A: Cultural Context — text left / image right ── */}
      <div className="grid lg:grid-cols-2">
        <Reveal
          direction="up"
          duration={1000}
          delay={100}
          rootMargin="0px 0px -80px 0px"
          className="flex items-center px-6 py-16 lg:px-16 lg:py-24"
        >
          <div className="max-w-lg">
            <p className="text-[16px] leading-[1.8] text-text-secondary">
              Small makers are the artisans, home processors, and agri-entrepreneurs
              who have always been the quiet backbone of Trinidad and Tobago&apos;s food
              culture. From the toolum and chow sold at the corner parlour to
              small-batch pepper sauces, preserved fruits, and handcrafted juices made
              from produce that never makes it to an export shelf — they are the
              custodians of our recipes, our ingredients, and our food identity.
            </p>

            {/* Stat callout */}
            <div className="mt-10">
              <Reveal direction="up" duration={900} delay={200}>
                <span
                  className="block font-display text-[clamp(2.4rem,5vw,4rem)] font-normal leading-none text-lume-accent"
                  aria-label="85 to 95 percent of registered businesses in Trinidad and Tobago"
                >
                  85–95%
                </span>
                <p className="mt-3 max-w-sm text-[14px] leading-[1.6] text-text-secondary">
                  of registered businesses in T&amp;T are MSMEs &amp; Agri-SMEs* — driving
                  jobs, income, and innovation across communities.
                </p>
              </Reveal>
            </div>

            <p className="mt-8 text-[16px] leading-[1.8] text-text-secondary">
              They process the fruits and vegetables our climate grows abundantly but
              can&apos;t always export, turning what might be overlooked into something
              extraordinary. Their work sustains the agri-food value chain in ways
              most consumers never see.
            </p>
          </div>
        </Reveal>

        {/* Image */}
        <Reveal
          direction="none"
          duration={1000}
          rootMargin="0px 0px -100px 0px"
          className="relative h-[50vh] min-h-[400px] lg:h-auto"
        >
          <ParallaxImage
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=90"
            alt="Small-batch artisan food production in Trinidad and Tobago"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-canvas" style={{ opacity: 0.35 }} />
        </Reveal>
      </div>

      {/* ── Block B: Lumë Definition — full-width pull-quote band ── */}
      <div className="bg-ceramic">
        <Reveal
          direction="none"
          duration={1000}
          className="mx-auto flex max-w-5xl items-stretch gap-0 px-6 py-16 lg:px-16 lg:py-20"
        >
          <div className="mr-6 hidden w-1 shrink-0 rounded-full bg-lume-accent lg:block" />
          <div>
            <p className="font-display text-[clamp(1.15rem,2vw,1.5rem)] font-normal leading-[1.6] tracking-tight text-text-primary">
              &ldquo;At Lumë Refillery, we define small makers as those who operate at a
              human scale — prioritising craft, transparency, and local impact over
              volume and price. They source with care, make in small batches, and put
              intention into every ingredient.&rdquo;
            </p>

            {/* Value pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {valuePills.map((pill, i) => (
                <Reveal key={pill} direction="none" duration={600} delay={200 + i * 80}>
                  <span className="inline-flex rounded-full bg-lume-accent/10 px-4 py-1.5 text-[13px] font-semibold tracking-tight text-lume-accent">
                    {pill}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Block C: Fair Exchange — image left / text right ── */}
      <div className="grid lg:grid-cols-2">
        {/* Image */}
        <Reveal
          direction="none"
          duration={1000}
          rootMargin="0px 0px -100px 0px"
          className="relative h-[50vh] min-h-[400px] lg:h-auto"
        >
          <ParallaxImage
            src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1400&q=90"
            alt="Fresh local produce and handcrafted goods from Trinidad makers"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-canvas" style={{ opacity: 0.35 }} />
        </Reveal>

        <Reveal
          direction="up"
          duration={1000}
          delay={100}
          rootMargin="0px 0px -80px 0px"
          className="flex items-center px-6 py-16 lg:px-16 lg:py-24"
        >
          <div className="max-w-lg">
            <p className="text-[16px] leading-[1.8] text-text-secondary">
              Their products are seasonal, often preservative-free, and deeply rooted
              in accountability to you and their community. When you see a price tag,
              know it reflects real labour, real sourcing, and real quality — a fair
              exchange for something you simply cannot find anywhere else.
            </p>

            <div className="mt-8 h-[1px] w-12 bg-lume-accent/40" />

            <p className="mt-8 font-display text-[clamp(1.1rem,2vw,1.4rem)] font-normal leading-[1.5] tracking-tight text-text-primary">
              Choosing a small maker isn&apos;t just a purchase; it&apos;s an
              investment in culture, food security, and a food system built to last.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Footnote */}
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-4 lg:px-16">
        <p className="text-[11px] leading-[1.6] text-text-secondary/50">
          * Estimated range based on publicly available data from the Ministry of
          Trade and Industry and the Central Statistical Office of Trinidad and
          Tobago.
        </p>
      </div>
    </section>
  );
};

export default SmallMakers;
