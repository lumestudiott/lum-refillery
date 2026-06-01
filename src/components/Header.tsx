'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';

const navItems = [
  { label: 'Shop', href: '/shop' },
  { label: 'Why Choose Lumë', href: '/#about' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Producers', href: '/#sourcing' },
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
      transition={{ 
        duration: 0.56, // --duration-long (560ms)
        ease: [0.22, 0.61, 0.36, 1.00] // --ease-settle
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
        <div className="hidden items-center gap-3 lg:flex">
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
          className="cursor-pointer rounded-lg p-2 text-text-primary transition-colors hover:bg-canvas-light lg:hidden"
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
