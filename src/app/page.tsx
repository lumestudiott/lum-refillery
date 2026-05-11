'use client';

import React from 'react';
import About from '@/components/About';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Newsletter from '@/components/Newsletter';
import ScrollToTop from '@/components/ScrollToTop';
import Sourcing from '@/components/Sourcing';
import Testimonials from '@/components/Testimonials';
import WhoItsFor from '@/components/WhoItsFor';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <ScrollToTop />
      <Header />
      <Hero />
      <div id="about">
        <About />
      </div>
      <HowItWorks />
      <div id="sourcing">
        <Sourcing />
      </div>
      <WhoItsFor />
      <Testimonials />
      <FAQ />
      <Newsletter />
      <Footer />
    </div>
  );
}
