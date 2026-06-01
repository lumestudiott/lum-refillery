'use client';

import React from 'react';
import Reveal from './Reveal';

const sources = [
  {
    label: 'Fresh',
    title: 'Specialty Produce',
    description:
      'Seasonal produce and rare varieties with real flavor.',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=90',
    bg: '#A4A67B', // Vintage Olive
    rotateClass: '-rotate-6',
  },
  {
    label: 'Local',
    title: 'Small Makers',
    description:
      "Pantry goods from independent producers you won't find in big stores.",
    image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=90',
    bg: '#F37941', // Vintage Orange
    rotateClass: 'rotate-0',
  },
  {
    label: 'Saved',
    title: 'Rescued Refills',
    description:
      'High-quality groceries that deserve a home. Still fresh, always useful.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=90',
    bg: '#E7AD47', // Vintage Mustard
    rotateClass: 'rotate-6',
  },
];

const Sourcing: React.FC = () => {
  return (
    <section className="overflow-hidden bg-canvas">
      <style>{`
        .fan-card {
          transition: z-index 0s linear 0.5s;
        }
        .fan-card:hover {
          z-index: 50 !important;
          transition: z-index 0s linear 0s;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="px-6 pt-24 pb-4 lg:px-16">
        <div className="mx-auto max-w-7xl text-center">
          <Reveal as="p" duration={1200} className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent">
            Where it comes from
          </Reveal>

          <Reveal
            as="h2"
            direction="up"
            duration={1000}
            rootMargin="0px 0px -60px 0px"
            className="mt-6 font-display text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.08] tracking-tight text-text-primary"
          >
            Sourced with intention.
          </Reveal>
        </div>
      </div>

      {/* ── Premium Fanned Cards ── */}
      <div className="relative px-6 pb-32 pt-20 lg:px-16 overflow-visible">
        <div className="mx-auto flex max-w-5xl items-center justify-center">
          {sources.map((item, index) => {
            const isFirst = index === 0;
            const marginClass = isFirst ? '' : '-ml-[70px] sm:-ml-[100px] md:-ml-[130px] lg:-ml-[160px]';
            const baseZ = [10, 20, 30][index];

            return (
              <Reveal
                key={item.title}
                direction="up"
                duration={900}
                delay={index * 150}
                className={`fan-card group relative ${marginClass}`}
                style={{ zIndex: baseZ }}
              >
                <div
                  className={`flex h-[460px] w-[280px] cursor-pointer flex-col overflow-hidden rounded-[4px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] transition-all duration-500 group-hover:-translate-y-8 group-hover:rotate-0 group-hover:scale-[1.04] group-hover:shadow-[0_40px_70px_-15px_rgba(0,0,0,0.5)] sm:h-[520px] sm:w-[320px] lg:h-[600px] lg:w-[380px] ${item.rotateClass}`}
                  style={{ backgroundColor: item.bg }}
                >
                  {/* Text Section (Top) */}
                  <div className="flex flex-col px-6 pt-6 pb-4 sm:px-8 sm:pt-8 flex-1">
                    <h3 className="font-display text-[38px] font-normal leading-[0.95] tracking-tight text-[#2B2B2B] sm:text-[44px] lg:text-[54px] lg:leading-[0.9]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-[16px] font-medium leading-[1.3] text-[#2B2B2B]/85 lg:text-[18px]">
                      {item.description}
                    </p>
                  </div>

                  {/* Image Section (Bottom Bleed) */}
                  <div className="relative h-[220px] w-full shrink-0 sm:h-[260px] lg:h-[320px] border-t-2 border-[#2B2B2B]/5">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Learn More Ribbon */}
                    <div className="absolute bottom-6 right-0 bg-[#E8D5B7] pl-5 pr-4 py-2 shadow-lg transition-transform duration-500 group-hover:translate-x-0 group-hover:-translate-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[14px] uppercase tracking-widest text-[#2B2B2B] italic">
                          Learn More
                        </span>
                        <svg className="h-4 w-4 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Sourcing;
