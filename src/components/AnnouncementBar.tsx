'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Inner component that calls useQuery. If the Convex query throws a server
 * error, React will propagate it to the nearest error boundary — which we
 * deliberately keep scoped to *just* this banner so the rest of the app
 * survives.
 */
const AnnouncementBarInner = () => {
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

/**
 * Scoped error boundary: if the promotions query fails, the banner simply
 * disappears instead of taking down the whole page.
 */
class AnnouncementBarBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('[AnnouncementBar] Query failed, hiding banner:', error.message, info);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const AnnouncementBar = () => (
  <AnnouncementBarBoundary>
    <AnnouncementBarInner />
  </AnnouncementBarBoundary>
);

export default AnnouncementBar;
