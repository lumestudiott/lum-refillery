'use client';

import React from 'react';
import { motion } from 'framer-motion';

const AnnouncementBar = () => {
  const items = [
    "New Arrival: The Extended Family Haul is now live",
    "10% off your first refill with code LUMEFIRST",
    "Free local delivery on orders over $50",
    "Try our new seasonal fruit tarts this week",
  ];

  // Duplicate to allow seamless infinite scroll
  const content = [...items, ...items];

  return (
    <div className="relative flex h-9 w-full items-center overflow-hidden bg-lume-house text-[10px] font-medium tracking-[0.25em] text-[#F2F0EA]/90 uppercase sm:text-[11px] sm:h-[38px] border-b border-white/5">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: [0, '-50%'],
        }}
        transition={{
          duration: 40,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {content.map((item, i) => (
          <span key={i} className="mx-10 flex items-center">
            {item}
            <span className="mx-10 text-white/30 text-[10px]">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default AnnouncementBar;
