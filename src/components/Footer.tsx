'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Mail, RefreshCw, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-refill-ink px-4 pb-8 pt-16 text-cream-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-cream-50 bg-refill-green">
                <RefreshCw className="h-5 w-5 text-refill-ink" />
              </div>
              <span className="font-display text-2xl font-black tracking-normal text-white">Lume Refillery</span>
            </div>
            <p className="text-sm leading-relaxed text-cream-50/70">
              Reliable grocery subscriptions, thoughtfully built for everyday tables and lower-waste routines.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Mail].map((Icon, index) => (
                <a key={index} href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream-50 transition-colors hover:bg-refill-yellow hover:text-refill-ink">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-black uppercase tracking-[0.12em] text-refill-yellow">Shop</h4>
            <ul className="space-y-3 text-sm text-cream-50/75">
              <li><Link href="/sample-hauls" className="hover:text-white">Essential Hauls</Link></li>
              <li><Link href="/sample-hauls" className="hover:text-white">Premium Hauls</Link></li>
              <li><Link href="/sample-hauls" className="hover:text-white">Bulk Orders</Link></li>
              <li><Link href="/gift" className="hover:text-white">Gift a Subscription</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-black uppercase tracking-[0.12em] text-refill-yellow">Company</h4>
            <ul className="space-y-3 text-sm text-cream-50/75">
              <li><Link href="/our-mission" className="hover:text-white">About Us</Link></li>
              <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
              <li><Link href="/sustainability" className="hover:text-white">Sustainability</Link></li>
              <li><Link href="/sourcing-standards" className="hover:text-white">Sourcing Standards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-black uppercase tracking-[0.12em] text-refill-yellow">Support</h4>
            <ul className="space-y-3 text-sm text-cream-50/75">
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="mailto:lumestudiott@gmail.com" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white">Returns</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 text-xs text-cream-50/55 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Lume Refillery. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
