'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import Reveal from './Reveal';

type Source = {
  label: string;
  title: string;
  description: string;
  image: string;
  bg: string;
  rotateClass: string;
  href: string;
  comingSoon?: boolean;
  ctaLabel?: string;
  ctaTag?: string;
  ctaHref?: string;
};

const sources: Source[] = [
  {
    label: 'Fresh',
    title: 'Specialty Produce',
    description:
      'Seasonal produce and rare varieties with real flavor.',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=90',
    bg: '#A4A67B', // Vintage Olive
    rotateClass: '-rotate-6',
    href: '/sourcing-standards/specialty-produce',
  },
  {
    label: 'Local',
    title: 'Small Makers',
    description:
      "Pantry goods from independent producers you won't find in big stores.",
    image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=90',
    bg: '#F37941', // Vintage Orange
    rotateClass: 'rotate-0',
    href: '/sourcing-standards/small-makers',
    comingSoon: true,
    ctaLabel: 'Apply to be featured',
    ctaTag: "It's free",
    ctaHref: 'mailto:lumestudiott@gmail.com?subject=Apply to be featured - Small Makers',
  },
  {
    label: 'Saved',
    title: 'Rescued Refills',
    description:
      'High-quality groceries that deserve a home. Still fresh, always useful.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=90',
    bg: '#E7AD47', // Vintage Mustard
    rotateClass: 'rotate-6',
    href: '/sourcing-standards/rescued-refills',
    comingSoon: true,
    ctaLabel: 'Seeking collaborators',
    ctaHref: 'mailto:lumestudiott@gmail.com?subject=Seeking Collaborators - Rescued Refills',
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
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-24 pb-6 lg:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <Reveal direction="up" duration={800}>
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent">
              Where it comes from
            </p>
          </Reveal>
          <Reveal direction="up" duration={800} delay={100}>
            <h2 className="mt-4 font-display text-[56px] font-normal leading-[1.08] tracking-tight text-[#2B2B2B] sm:text-[64px] lg:text-[84px] lg:leading-[0.95]">
              Sourced with intention.
            </h2>
          </Reveal>
        </div>
      </div>

      {/* ── Premium Fanned Cards ── */}
      <div className="relative px-6 pb-32 pt-28 lg:px-16 lg:pt-32 overflow-visible">
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
                  <div className={`flex flex-col px-6 pt-6 pb-4 sm:px-8 sm:pt-8 flex-1 transition-opacity duration-500 ${item.comingSoon ? 'opacity-85 group-hover:opacity-100' : ''}`}>
                    <h3 className="font-display text-[38px] font-normal leading-[0.95] tracking-tight text-[#2B2B2B] sm:text-[44px] lg:text-[54px] lg:leading-[0.9]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-[16px] font-medium leading-[1.3] text-[#2B2B2B]/85 lg:text-[18px]">
                      {item.description}
                    </p>

                    {/* Premium CTA Button (visible for Coming Soon) */}
                    {item.comingSoon && item.ctaLabel && (
                      <a
                        href={item.ctaHref}
                        className="mt-6 inline-flex w-fit items-center gap-2.5 rounded-full bg-[#2B2B2B] py-2.5 pl-5 pr-4 text-[14px] font-semibold tracking-tight text-[#FBF7EE] shadow-[0_8px_18px_-6px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.55)] active:translate-y-0 active:scale-95"
                      >
                        <span>{item.ctaLabel}</span>
                        {item.ctaTag && (
                          <span className="rounded-full bg-[#FBF7EE]/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#FBF7EE]">
                            {item.ctaTag}
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </a>
                    )}
                  </div>

                  {/* Image Section (Bottom Bleed) */}
                  <div className="relative h-[220px] w-full shrink-0 sm:h-[260px] lg:h-[320px] border-t-2 border-[#2B2B2B]/5 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1.2s] ease-out group-hover:scale-110 ${item.comingSoon ? 'grayscale-[35%] opacity-80 group-hover:grayscale-0 group-hover:opacity-100' : ''}`}
                      loading="lazy"
                    />
                    
                    {/* Learn More Ribbon */}
                    <Link href={item.href} className="absolute bottom-6 right-0 bg-[#E8D5B7] pl-5 pr-4 py-2 shadow-lg transition-transform duration-500 group-hover:translate-x-0 group-hover:-translate-y-1 hover:bg-[#d8c29d] z-20">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[14px] uppercase tracking-widest text-[#2B2B2B] italic">
                          Learn More
                        </span>
                        <svg className="h-4 w-4 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </Link>
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


