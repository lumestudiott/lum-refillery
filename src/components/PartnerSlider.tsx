'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Partner {
  name: string;
  tagline: string;
}

const partners: Partner[] = [
  { name: 'NAMDEVCO', tagline: 'Farmers\' Markets' },
  { name: 'Massy Stores', tagline: 'Retail Partner' },
  { name: 'Chief', tagline: 'Seasonings & Spices' },
  { name: 'Bermudez', tagline: 'Local Heritage' },
  { name: 'Kiss Baking', tagline: 'Fresh Bakery' },
  { name: 'National Flour Mills', tagline: 'Staple Goods' },
  { name: 'HADCO', tagline: 'Distribution' },
  { name: 'A.S. Bryden', tagline: 'Supply Chain' },
  { name: 'Solo', tagline: 'Beverages' },
  { name: 'Sunshine Snacks', tagline: 'Local Snacks' },
];

// Duplicate for seamless loop
const allPartners = [...partners, ...partners];

const PartnerSlider: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-canvas py-20 border-t border-black/[0.04]">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="text-canvas font-medium uppercase tracking-[0.2em] text-emerald-700 mb-4">
            Trusted Partners
          </p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-stone-900 leading-[1.15]">
            Companies we work with across<br />Trinidad &amp; Tobago
          </h2>
        </motion.div>
      </div>

      {/* Slider Track — Row 1 (left to right) */}
      <div className="relative mb-5">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-canvas to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-canvas to-transparent" />

        <motion.div
          className="flex gap-5"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 35,
              ease: 'linear',
            },
          }}
        >
          {allPartners.map((partner, i) => (
            <PartnerCard key={`row1-${i}`} partner={partner} />
          ))}
        </motion.div>
      </div>

      {/* Slider Track — Row 2 (right to left) */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-canvas to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-canvas to-transparent" />

        <motion.div
          className="flex gap-5"
          animate={{ x: ['-50%', '0%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 40,
              ease: 'linear',
            },
          }}
        >
          {[...allPartners].reverse().map((partner, i) => (
            <PartnerCard key={`row2-${i}`} partner={partner} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const PartnerCard: React.FC<{ partner: Partner }> = ({ partner }) => {
  // Deterministic color based on name
  const hue = partner.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div className="group relative flex-shrink-0">
      <div className="flex items-center gap-4 rounded-full border border-stone-200 bg-white px-6 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-500 hover:border-emerald-200 hover:shadow-[0_4px_20px_rgba(16,185,129,0.08)]">
        {/* Logo placeholder — styled monogram */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white transition-transform duration-500 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 45%, 55%), hsl(${(hue + 30) % 360}, 40%, 45%))`,
          }}
        >
          {partner.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p className="text-[14px] font-semibold tracking-tight text-stone-900 whitespace-nowrap">
            {partner.name}
          </p>
          <p className="text-[11px] text-stone-400 whitespace-nowrap">
            {partner.tagline}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerSlider;
