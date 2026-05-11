'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const footerLinks = {
  Company: [
    { label: 'Our Mission', href: '/our-mission' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Sourcing Standards', href: '/sourcing-standards' },
    { label: 'Careers', href: '/careers' },
  ],
  Product: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Gift a Subscription', href: '/gift' },
    { label: 'Sample Hauls', href: '/sample-hauls' },
  ],
  Help: [
    { label: 'Impact Report', href: '/impact-report' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-lume-house px-6 pt-24 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* Columns */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
                </svg>
              </div>
              <span className="text-[16px] font-semibold tracking-tight text-white">
                Lume Refillery
              </span>
            </Link>
            <p className="mt-5 max-w-[200px] text-[13px] leading-[1.7] text-white/35">
              Fresh grocery hauls, delivered with less waste and more care.
            </p>
          </motion.div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links], colIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: (colIndex + 1) * 0.1 }}
            >
              <h4 className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                {title}
              </h4>
              <nav className="mt-5 space-y-3.5">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-[13px] text-white/50 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-20 border-t border-white/[0.06] py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-[12px] text-white/25">
              &copy; {new Date().getFullYear()} Lume Refillery. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[12px] text-white/25 transition-colors hover:text-white/50">Privacy</a>
              <a href="#" className="text-[12px] text-white/25 transition-colors hover:text-white/50">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
