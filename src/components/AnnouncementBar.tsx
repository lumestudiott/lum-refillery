'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const AnnouncementBar = () => {
  const promos = useQuery(api.promotions.listActive, {});

  // Wait for data to load
  if (promos === undefined) return null;

  const promoItems = promos
    .filter((p) => p.bannerText)
    .map((p) => p.bannerText!);

  // If no active promotions with banner text, hide the banner completely
  if (promoItems.length === 0) return null;

  // Duplicate to allow seamless infinite scroll
  const content = [...promoItems, ...promoItems];

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
