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
  Shop: [
    { label: 'Fresh produce', href: '/shop?category=fresh-produce' },
    { label: 'Meat & seafood', href: '/shop?category=meat-seafood' },
    { label: 'Dairy & eggs', href: '/shop?category=dairy-eggs' },
    { label: 'Bakery', href: '/shop?category=bakery' },
    { label: 'Pantry essentials', href: '/shop?category=pantry-essentials' },
    { label: 'Weekly specials', badge: 'Sale', href: '/shop?category=weekly-specials' },
  ],
  Orders: [
    { label: 'Delivery & pickup', href: '/delivery-pickup' },
    { label: 'Track your order', href: '/track-order' },
    { label: 'Order history', href: '/order-history' },
    { label: 'Returns & refunds', href: '/returns-refunds' },
    { label: 'Gift cards', href: '/gift-cards' },
  ],
  Community: [
    { label: 'Recipes', href: '/recipes' },
    { label: 'Small Makers', href: '/small-makers' },
    { label: 'Loyalty rewards', href: '/loyalty-rewards' },
    { label: 'Events & tastings', href: '/events-tastings' },
    { label: 'Rescued Refills', href: '/rescued-refills' },
  ],
  Help: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact us', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'News', href: '/news' },
  ],
};

const socials = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/lumerefillery/',
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
    href: 'https://www.facebook.com/profile.php?id=61564508792967',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    )
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@lumerefillery?is_from_webapp=1&sender_device=pc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
      </svg>
    )
  },
  {
    name: 'X',
    href: 'https://x.com/LumeRefillery',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
        <path d="M4 4l16 16"/>
        <path d="M20 4L4 20"/>
      </svg>
    )
  }
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-canvas border-t border-black/5 px-6 pt-24 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* Columns */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 xl:gap-16">

          {/* Brand */}
          <motion.div
            className="lg:w-[280px] xl:w-[320px] flex-shrink-0"
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
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
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
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 lg:gap-4 xl:gap-8">
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
                {links.map((link: any) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group flex items-center gap-2 text-[13px] text-text-primary/60 transition-colors duration-300 hover:text-text-primary"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-full bg-copper-600/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-copper-600 transition-colors group-hover:bg-copper-600/20">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </motion.div>
          ))}
          </div>
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
                <Link href="/substitution-policy" className="text-[12px] text-text-primary/40 transition-colors hover:text-text-primary/80">Substitution Policy</Link>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
