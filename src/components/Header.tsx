'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Cake } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';

const navItems = [
  { label: 'Shop', href: '/shop' },
  { label: 'Our Story', href: '/#about' },
  { label: 'Method', href: '/#how-it-works' },
  { label: 'Sourcing', href: '/#sourcing' },
];

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const isHome = pathname === '/';

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
      transition={{ 
        duration: 0.56,
        ease: [0.22, 0.61, 0.36, 1.00]
      }}
      className="fixed left-0 right-0 top-0 z-[100] flex flex-col bg-canvas/95 backdrop-blur-md transition-all duration-500"
    >
      <AnnouncementBar />
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Logo */}
        <Link href="/" className="group">
          <span className="font-display text-[22px] font-normal tracking-tight text-text-primary transition-colors duration-500 group-hover:text-lume-green">
            Lumë <span className="text-lume-accent transition-colors duration-500 group-hover:text-lume-green">Refillery</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const isActive = item.href === pathname;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-link-underline text-[13px] font-medium tracking-[0.04em] text-text-secondary transition-colors duration-300 hover:text-text-primary ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-4 lg:flex">
          {/* Birthday Club Button */}
          <Link href="/birthday-club">
            <button className="group relative flex cursor-pointer items-center gap-1.5 overflow-hidden rounded-full border border-lume-accent/20 bg-lume-accent/5 px-5 py-2 text-[13px] font-medium tracking-tight text-lume-accent transition-all duration-300 hover:border-lume-accent/40 hover:bg-lume-accent/10 active:scale-[0.98]">
              <Cake className="h-3.5 w-3.5 animate-pulse" />
              <span className="relative z-10 font-semibold">Birthdays</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-lume-accent/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </button>
          </Link>

          {isSignedIn ? (
            <>
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Dashboard"
                    labelIcon={<LayoutDashboard className="h-4 w-4" />}
                    href="/dashboard"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="group relative cursor-pointer overflow-hidden rounded-full border border-lume-accent bg-lume-accent px-5 py-2 text-[14px] font-medium tracking-tight text-white transition-all duration-300 hover:shadow-[0_2px_12px_rgba(0,117,74,0.25)] active:scale-[0.98]">
                  <span className="relative z-10">Get Started</span>
                  <span className="absolute inset-0 -translate-x-full bg-lume-green transition-transform duration-300 ease-out group-hover:translate-x-0" />
                </button>
              </SignInButton>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="cursor-pointer rounded-lg p-2 text-text-primary transition-colors hover:bg-black/5 lg:hidden"
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
                  className="block rounded-[12px] px-4 py-3 font-display text-[16px] font-normal text-text-primary transition-all hover:bg-black/[0.03] hover:translate-x-1"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-2.5 h-px bg-black/5" />

              {/* Mobile Birthday Club Button */}
              <Link href="/birthday-club" onClick={() => setMobileMenuOpen(false)} className="block mb-3">
                <button className="group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-full border border-lume-accent/20 bg-lume-accent/5 py-3 text-[14px] font-semibold text-lume-accent transition-all duration-300 hover:border-lume-accent/40 hover:bg-lume-accent/10 active:scale-[0.98]">
                  <Cake className="h-4 w-4 animate-pulse" />
                  <span className="relative z-10">Birthdays</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-lume-accent/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </button>
              </Link>

              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-[12px] px-4 py-3 font-display text-[16px] font-normal text-text-primary transition-all hover:bg-black/[0.03] hover:translate-x-1"
                >
                  Dashboard
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className="btn-pill w-full cursor-pointer bg-lume-accent px-4 py-3 text-[15px] font-semibold text-white transition-all hover:bg-lume-green"
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
