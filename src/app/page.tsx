// This page is a React Server Component. Each child section that needs
// client-side interactivity (Header/Hero/About/etc.) carries its own
// `'use client'` boundary, so removing the directive here lets Next.js
// stream the static document shell without waiting for the client
// bundle to download + hydrate first.
import React from 'react';
import About from '@/components/About';
import BrandScroller from '@/components/BrandScroller';
import BentoGrid from '@/components/BentoGrid';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import ScrollToTop from '@/components/ScrollToTop';
import Sourcing from '@/components/Sourcing';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      {/* React 19 hoists this <link> into <head>. The browser begins
          fetching the hero MP4 as a critical resource in parallel with
          HTML/CSS — so by the time <Hero> hydrates and calls .play(),
          the video is already buffered enough to start. Replaces the
          need for preload="auto" on the <video> element itself, which
          would otherwise compete for bandwidth with the JS bundle. */}
      <link
        rel="preload"
        as="video"
        href="/videos/hero-bg.mp4"
        type="video/mp4"
      />
      <ScrollToTop />
      <Header />
      <Hero />
      <BrandScroller />
      <BentoGrid />
      <div id="about">
        <About />
      </div>
      <HowItWorks />
      <div id="sourcing">
        <Sourcing />
      </div>
      <FAQ />
      <Footer />
    </div>
  );
}
