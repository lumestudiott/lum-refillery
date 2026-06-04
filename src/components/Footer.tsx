'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const footerLinks = {
  Company: [
    { label: 'Our Mission', href: '/mission' },
    { label: 'Our Vision', href: '/vision' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Sourcing Standards', href: '/sourcing' },
  ],
  Product: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Shop', href: '/shop' },
    { label: 'Quiz', href: '/quiz' },
  ],
  'Contact Us': [
    { label: 'FAQ', href: '/faq' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Support', href: '/support' },
  ],
};

const socials = [
  {
    name: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    )
  },
  {
    name: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    )
  },
  {
    name: 'TikTok',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
      </svg>
    )
  },
  {
    name: 'Twitter',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
      </svg>
    )
  },
  {
    name: 'YouTube',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
        <rect width="20" height="14" x="2" y="5" rx="4"/>
        <path d="M10 9l5 3-5 3z"/>
      </svg>
    )
  },
  {
    name: 'Pinterest',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 22l3-11a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3 4 4 0 0 1-4 4h-2l-2 7"/>
      </svg>
    )
  }
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-canvas border-t border-black/5 px-6 pt-24 lg:px-16">
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
            <Link href="/" className="inline-block">
              <span className="text-[22px] tracking-tight">
                <span className="font-display text-text-primary">Lumë</span>{' '}
                <span className="font-display text-lume-accent">Refillery</span>
              </span>
            </Link>
            <p className="mt-4 max-w-[220px] text-[13px] leading-[1.7] text-text-primary/60">
              Just food Built for Your table.
            </p>
            {/* Social Icons */}
            <div className="mt-12 flex items-center gap-4">
              {socials.map((social, idx) => {
                const blobs = [
                  '42% 58% 62% 38% / 45% 55% 45% 55%',
                  '62% 38% 42% 58% / 55% 45% 55% 45%',
                  '38% 62% 58% 42% / 45% 55% 45% 55%',
                  '58% 42% 38% 62% / 55% 45% 55% 45%',
                  '50% 50% 60% 40% / 40% 65% 35% 60%',
                  '45% 55% 45% 55% / 58% 42% 38% 62%',
                ];
                return (
                  <a 
                    key={social.name} 
                    href="#" 
                    className="group flex h-11 w-11 items-center justify-center bg-lume-green/10 text-lume-house transition-transform duration-300 hover:scale-110 hover:bg-lume-green hover:text-white"
                    style={{ borderRadius: blobs[idx % blobs.length] }}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                );
              })}
            </div>
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
              <h4 className="text-[11px] font-medium uppercase tracking-[0.15em] text-text-primary/40">
                {title}
              </h4>
              <nav className="mt-5 space-y-3.5">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-[13px] text-text-primary/60 transition-colors duration-300 hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-20 border-t border-black/5 pt-8 pb-12">
          <div className="flex flex-col items-center justify-center gap-8">


            <div className="flex flex-col items-center justify-between w-full gap-4 sm:flex-row">
              <p className="text-[12px] text-text-primary/40">
                &copy; {new Date().getFullYear()} Lumë Refillery. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-[12px] text-text-primary/40 transition-colors hover:text-text-primary/80">Privacy Policy</a>
                <a href="#" className="text-[12px] text-text-primary/40 transition-colors hover:text-text-primary/80">Terms & Services</a>
                <a href="#" className="text-[12px] text-text-primary/40 transition-colors hover:text-text-primary/80">Cookies Policy</a>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
