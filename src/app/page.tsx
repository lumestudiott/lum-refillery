'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ChevronDown, Menu, RefreshCw, UserRound, X } from 'lucide-react';
import About from '@/components/About';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Newsletter from '@/components/Newsletter';
import ScrollToTop from '@/components/ScrollToTop';
import Sourcing from '@/components/Sourcing';
import Testimonials from '@/components/Testimonials';
import TiersDisplay from '@/components/TiersDisplay';
import WhoItsFor from '@/components/WhoItsFor';

const navItems = [
  { label: 'How It Works', href: '#how-it-works', dropdown: true },
  { label: 'Our Food', href: '#pricing', dropdown: true },
  { label: 'Impact', href: '#about', dropdown: false },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-cream-50 text-refill-ink">
      <ScrollToTop />

      <motion.header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-refill-ink/10 bg-cream-50/95 shadow-sm backdrop-blur-md'
            : 'border-b border-refill-ink/5 bg-cream-100/95 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-refill-ink bg-refill-green">
              <RefreshCw className="h-5 w-5 text-refill-ink" />
            </div>
            <span className="font-display text-2xl font-black tracking-normal text-refill-ink sm:text-3xl">
              Lume Refillery
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-1 px-4 py-2 text-base font-extrabold text-refill-ink transition-colors hover:text-forest-800"
              >
                {item.label}
                {item.dropdown && <ChevronDown className="h-4 w-4" />}
              </a>
            ))}
            <Link href="/dashboard" className="px-4 py-2 text-base font-extrabold text-refill-ink transition-colors hover:text-forest-800">
              My Calendar
            </Link>
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-base font-extrabold text-refill-ink transition-colors hover:text-forest-800">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="flex cursor-pointer items-center gap-2 text-base font-extrabold text-refill-ink transition-colors hover:text-forest-800">
                    <UserRound className="h-6 w-6" />
                    Sign In
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="cursor-pointer rounded border-2 border-refill-ink bg-refill-yellow px-8 py-3 text-base font-black text-refill-ink shadow-[3px_3px_0_0_#2B2B2B] transition-transform hover:-translate-y-0.5">
                    Get Started
                  </button>
                </SignInButton>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="cursor-pointer rounded-lg border-2 border-refill-ink p-2 text-refill-ink transition-colors hover:bg-refill-yellow lg:hidden"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-refill-ink/10 bg-cream-50 lg:hidden"
            >
              <div className="space-y-1 px-4 py-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl px-4 py-3 font-extrabold text-refill-ink hover:bg-cream-100"
                  >
                    {item.label}
                  </a>
                ))}
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 font-extrabold text-refill-ink hover:bg-cream-100">
                  My Calendar
                </Link>
                <Link href="/gift" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 font-extrabold text-refill-ink hover:bg-cream-100">
                  Gift a Subscription
                </Link>
                {isSignedIn ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 font-extrabold text-refill-ink hover:bg-cream-100">
                    Dashboard
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button className="mt-3 w-full cursor-pointer rounded border-2 border-refill-ink bg-refill-yellow px-4 py-3 font-black text-refill-ink">
                      Get Started
                    </button>
                  </SignInButton>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <Hero />
      <div id="about">
        <About />
      </div>
      <HowItWorks />
      <Sourcing />
      <WhoItsFor />
      <div id="pricing">
        <TiersDisplay />
      </div>
      <Testimonials />
      <FAQ />
      <Newsletter />
      <Footer />
    </div>
  );
}
