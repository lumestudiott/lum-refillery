'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const bentoItems = [
  {
    title: 'Curated Hauls',
    subtitle: 'The Essential & Extended Family',
    image: '/images/bento/caribbean_curated_hauls_bento.png',
    colSpan: 'lg:col-span-2',
    rowSpan: 'lg:row-span-2',
    link: '#',
    comingSoon: true,
  },
  {
    title: 'Pantry Staples',
    subtitle: 'Dry Goods & Grains',
    image: '/images/bento/pantry_staples_bento_1779397114716.png',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
    link: '#',
    comingSoon: true,
  },
  {
    title: 'Fresh Produce',
    subtitle: 'Local & Seasonal',
    image: '/images/bento/caribbean_foods_bento.png',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
    link: '#',
    comingSoon: true,
  },
  {
    title: 'Beverages',
    subtitle: 'Fresh Juices, Coffee & Tea',
    image: '/images/bento/beverages_bento_1779397383920.png',
    colSpan: 'lg:col-span-2',
    rowSpan: 'lg:row-span-1',
    link: '#',
    comingSoon: true,
  },
  {
    title: 'Weekly Specials',
    subtitle: 'Last Chance Deals',
    image: '/images/bento/fresh_produce_bento_1779397173433.png', // Fallback for rate-limited image
    colSpan: 'lg:col-span-2',
    rowSpan: 'lg:row-span-1',
    link: '#',
    comingSoon: true,
  },
  {
    title: 'Dairy & Eggs',
    subtitle: 'Farm Fresh',
    image: '/images/bento/dairy_eggs_bento_1779397358758.png',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
    link: '#',
    comingSoon: true,
  },
  {
    title: 'Snacks',
    subtitle: 'Peckish Discoveries',
    image: '/images/bento/pantry_staples_bento_1779397114716.png', // Placeholder image pending a dedicated snacks photo
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
    link: '#',
    comingSoon: true,
  },
];

const BentoGrid: React.FC = () => {
  return (
    <section className="w-full bg-canvas px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-text-primary/60">
            The Catalog
          </p>
          <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.08] text-text-primary">
            Shop by Category.
          </h2>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-text-primary/70">
            From the core essentials to those special treats, discover our curated selection of food built for your body.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 lg:gap-6">
          {bentoItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl ${item.colSpan} ${item.rowSpan} ${item.rowSpan.includes('2') ? 'min-h-[400px] md:min-h-[500px]' : 'min-h-[250px]'
                }`}
            >
              <Link href={item.link} className="absolute inset-0 z-10 block">
                <span className="sr-only">Shop {item.title}</span>
              </Link>

              {/* Background Image */}
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Subtle gradient overlay to ensure white text is readable across all images */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                {/* Coming Soon sticker */}
                {(item as any).comingSoon && (
                  <div className="absolute top-4 right-4 z-20 md:top-5 md:right-5">
                    <span className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-lume-accent px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(0,117,74,0.45)] ring-1 ring-white/25">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      <span className="relative z-10">Coming Soon</span>
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    </span>
                  </div>
                )}

                {/* Badge at top */}
                {(item as any).badge && (
                  <div className="absolute top-6 left-6 md:top-8 md:left-8">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                      {(item as any).isUrgent && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                        </span>
                      )}
                      {(item as any).badge}
                    </span>
                  </div>
                )}

                <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white/80">
                    {item.subtitle}
                  </p>
                  <h3 className="font-display text-2xl tracking-tight text-white md:text-3xl">
                    {item.title}
                  </h3>

                  {/* Urgency Slider */}
                  {(item as any).isUrgent && (
                    <div className="mt-4 w-full max-w-[200px]">
                      <div className="mb-1.5 flex justify-between text-[10px] font-medium uppercase text-white/90">
                        <span>Claimed</span>
                        <span className="text-red-400">85%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
                        <motion.div 
                          className="h-full rounded-full bg-red-500" 
                          initial={{ width: 0 }}
                          whileInView={{ width: '85%' }}
                          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Reveal Arrow on hover */}
                <div className="mt-4 flex items-center gap-2 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:opacity-100 translate-y-2">
                  <span className="text-[13px] font-medium text-white">Shop Now</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
