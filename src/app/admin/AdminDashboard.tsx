'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Package,
  Users,
  Repeat,
  Truck,
  MapPin,
  Megaphone,
  ExternalLink,
  LogOut,
  ShieldAlert,
  Menu,
  X,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Spinner, ToastProvider } from './lib';
import GroceryField from './GroceryField';
import Overview from './sections/Overview';
import Products from './sections/Products';
import UsersSection from './sections/Users';
import Subscriptions from './sections/Subscriptions';
import Orders from './sections/Orders';
import Zones from './sections/Zones';
import Marketing from './sections/Marketing';

type SectionId =
  | 'overview'
  | 'products'
  | 'users'
  | 'subscriptions'
  | 'orders'
  | 'zones'
  | 'marketing';

const NAV: { id: SectionId; label: string; Icon: typeof Package }[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'products', label: 'Products', Icon: Package },
  { id: 'users', label: 'Users', Icon: Users },
  { id: 'subscriptions', label: 'Subscriptions', Icon: Repeat },
  { id: 'orders', label: 'Orders', Icon: Truck },
  { id: 'zones', label: 'Delivery Zones', Icon: MapPin },
  { id: 'marketing', label: 'Marketing', Icon: Megaphone },
];

/** Soft brand glows behind the canvas — mirrors the marketing site. */
function CanvasGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full opacity-[0.18] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #00754A 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-52 left-[20%] h-[520px] w-[520px] rounded-full opacity-[0.12] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #cba258 0%, transparent 70%)' }}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const admin = useQuery(api.admin.amIAdmin);
  const [section, setSection] = useState<SectionId>('overview');
  const [navOpen, setNavOpen] = useState(false);

  if (admin === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (admin === false) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-canvas px-6 text-center">
        <CanvasGlow />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-copper-600/10">
            <ShieldAlert className="h-7 w-7 text-copper-600" />
          </div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-normal tracking-tight text-text-primary">
            Admin access required
          </h1>
          <p className="max-w-md text-[14px] leading-[1.7] text-text-secondary">
            This area is restricted to administrators. Ask an existing admin to
            grant your account the admin role.
          </p>
          <Link
            href="/"
            className="btn-pill mt-2 inline-flex items-center gap-2 bg-lume-house px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black"
          >
            Back to site
          </Link>
        </motion.div>
      </div>
    );
  }

  const sections: Record<SectionId, React.ReactNode> = {
    overview: <Overview onNavigate={setSection} />,
    products: <Products />,
    users: <UsersSection />,
    subscriptions: <Subscriptions />,
    orders: <Orders />,
    zones: <Zones />,
    marketing: <Marketing />,
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-lume-house to-[#152822] text-white">
      <div className="flex items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-[22px] tracking-tight text-white">
          Lumë <span className="text-gold-light">Admin</span>
        </Link>
        <button
          onClick={() => setNavOpen(false)}
          className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ id, label, Icon }) => {
          const active = section === id;
          return (
            <button
              key={id}
              onClick={() => {
                setSection(id);
                setNavOpen(false);
              }}
              className={`relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[14px] font-medium transition-colors ${
                active ? 'text-white' : 'text-white/55 hover:text-white/90'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute inset-0 rounded-xl bg-white/[0.12] ring-1 ring-inset ring-white/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gold-light" />
              )}
              <Icon
                className="relative z-10 h-[18px] w-[18px]"
                strokeWidth={1.9}
              />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-3 pb-3 pt-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-light/20 font-display text-[15px] text-gold-light">
            {(user?.firstName?.[0] ?? user?.emailAddresses[0]?.emailAddress?.[0] ?? 'A').toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-white">
              {user?.fullName || 'Admin'}
            </div>
            <div className="truncate text-[11px] text-white/50">
              {user?.emailAddresses[0]?.emailAddress}
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          View site
        </Link>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-white/55 transition-colors hover:bg-copper-600/20 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-canvas text-text-primary">
        <GroceryField />

        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 lg:block">
          {sidebar}
        </aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {navOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-lume-house/40 backdrop-blur-sm lg:hidden"
                onClick={() => setNavOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 360, damping: 36 }}
                className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
              >
                {sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="relative z-10 lg:pl-64">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-black/[0.06] bg-canvas/80 px-4 py-3 backdrop-blur-xl lg:hidden">
            <button
              onClick={() => setNavOpen(true)}
              className="rounded-lg p-1.5 text-text-primary hover:bg-black/[0.05]"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display text-[18px] tracking-tight">
              Lumë <span className="text-lume-accent">Admin</span>
            </span>
          </div>

          <main className="mx-auto max-w-7xl px-5 py-8 lg:px-12 lg:py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              >
                {sections[section]}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
