'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'About', href: '/#about' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Our Food', href: '/#sourcing' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Gift', href: '/gift' },
];

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const isHome = pathname === '/';

  // On non-home pages, always show the solid header
  const showSolid = scrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        showSolid
          ? 'bg-canvas/95 shadow-nav backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-500 ${
            showSolid ? 'bg-lume-accent' : 'bg-white/15 backdrop-blur-sm'
          }`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
            </svg>
          </div>
          <span className={`text-lg font-semibold tracking-tight transition-colors duration-500 ${
            showSolid ? 'text-text-primary' : 'text-white'
          }`}>
            Lume Refillery
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const isActive = item.href === pathname || (item.href.startsWith('/#') && isHome);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-link-underline font-display text-[16px] font-normal tracking-wide transition-colors duration-300 ${
                  showSolid
                    ? 'text-text-secondary hover:text-lume-green'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`text-[14px] font-medium tracking-tight transition-colors ${
                  showSolid ? 'text-text-secondary hover:text-text-primary' : 'text-white/75 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className={`btn-pill cursor-pointer px-5 py-2 text-[14px] font-medium tracking-tight transition-all ${
                  showSolid
                    ? 'border border-text-primary/20 text-text-primary hover:border-text-primary/40'
                    : 'border border-white/30 text-white hover:border-white/60'
                }`}>
                  Sign In
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className={`btn-pill cursor-pointer px-5 py-2 text-[14px] font-semibold tracking-tight transition-all ${
                  showSolid
                    ? 'bg-lume-accent text-white hover:bg-lume-green'
                    : 'bg-white text-lume-house hover:bg-white/90'
                }`}>
                  Get Started
                </button>
              </SignInButton>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`cursor-pointer rounded-lg p-2 transition-colors lg:hidden ${
            showSolid ? 'text-text-primary hover:bg-canvas-light' : 'text-white hover:bg-white/10'
          }`}
          aria-label="Toggle mobile navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden border-t border-black/5 bg-canvas/98 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-6 py-5">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-card px-4 py-3 font-display text-[16px] font-normal text-text-primary transition-colors hover:bg-canvas-light"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-black/5" />

              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-card px-4 py-3 text-[15px] font-medium text-text-primary transition-colors hover:bg-canvas-light"
                >
                  Dashboard
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className="btn-pill mt-2 w-full cursor-pointer bg-lume-accent px-4 py-3 text-[15px] font-semibold text-white transition-all hover:bg-lume-green"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </button>
                </SignInButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
