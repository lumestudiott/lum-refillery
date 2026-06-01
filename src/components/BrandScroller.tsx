'use client';

import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  { name: 'S.M. Jaleel' },
  { name: 'Solo Beverages' },
  { name: 'Blue Waters' },
  { name: 'Carib Brewery' },
  { name: 'Angostura' },
  { name: 'HADCO' },
  { name: 'Creamery Novelties' },
  { name: 'Dairy Distributors' },
  { name: 'Nestlé Caribbean' },
];

const BrandScroller: React.FC = () => {
  return (
    <div className="relative py-6">
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent" />

        <motion.div
          className="flex w-max gap-16 px-8"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={`${brand.name}-${i}`}
              className="inline-flex shrink-0 select-none items-center gap-3 whitespace-nowrap font-display text-[clamp(1.1rem,2vw,1.5rem)] font-normal tracking-tight text-text-primary/20 transition-colors duration-300 hover:text-text-primary/60"
            >
              {brand.name}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BrandScroller;
