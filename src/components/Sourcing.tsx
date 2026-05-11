'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';

const TrinidadMap = dynamic(() => import('./TrinidadMap'), { ssr: false, loading: () => <div className="h-[420px] w-full animate-pulse rounded-[8px] bg-white/5" /> });

const sources = [
  {
    label: 'Fresh',
    title: 'Specialty Produce',
    description: 'Sourced from small farms growing seasonal produce and lesser-known varieties with real flavor.',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=1400&q=90',
  },
  {
    label: 'Local',
    title: 'Small Makers',
    description: "Pantry goods and household staples from independent producers you won't find in big stores.",
    image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1400&q=90',
  },
  {
    label: 'Saved',
    title: 'Rescued Refills',
    description: 'High-quality groceries that deserve a home before they become waste. Still fresh, always useful.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1400&q=90',
  },
];

// T&T: ~400,000 tons wasted/year ≈ ~12.7 kg/second
const WASTE_PER_SECOND = 12.7;

const LiveWasteSection: React.FC = () => {
  const [wastedLbs, setWastedLbs] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Start counting when section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Tick the counter
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
      setWastedLbs(prev => prev + WASTE_PER_SECOND);
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return Math.floor(num).toLocaleString();
    return Math.floor(num).toString();
  };

  return (
    <div ref={sectionRef} className="bg-lume-house px-6 py-28 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left — live counter */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/30">
              Live food waste — Trinidad & Tobago
            </p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] text-white">
              While you read this.
            </h2>

            {/* Live counter */}
            <div className="mt-12 border-t border-white/[0.06] pt-10">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[clamp(3rem,7vw,5rem)] font-normal leading-none tracking-tight text-white tabular-nums">
                  {formatNumber(wastedLbs)}
                </span>
                <span className="font-display text-[clamp(1.2rem,2.5vw,1.8rem)] font-normal text-white/30">
                  kg
                </span>
              </div>
              <p className="mt-2 text-[14px] text-white/40">
                of food wasted in T&T since you opened this page
              </p>
              <p className="mt-1 text-[12px] tabular-nums text-white/20">
                {elapsed}s elapsed &middot; ~{WASTE_PER_SECOND} kg/sec
              </p>
            </div>

            {/* Contextual stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/[0.06] pt-8">
              <div>
                <span className="text-[24px] font-semibold tracking-tight text-white">400<span className="text-white/40">K</span></span>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/25">tons wasted / yr</p>
              </div>
              <div>
                <span className="text-[24px] font-semibold tracking-tight text-white">30<span className="text-white/40">%</span></span>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/25">of food purchased</p>
              </div>
              <div>
                <span className="text-[24px] font-semibold tracking-tight text-white">$2.8<span className="text-white/40">B</span></span>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/25">value lost yearly</p>
              </div>
            </div>
          </motion.div>

          {/* Right — Leaflet Trinidad & Tobago map */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            <TrinidadMap />
            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-lume-accent" />
                <span className="text-[11px] text-white/25">Waste hotspot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white/60" />
                <span className="text-[11px] text-white/25">Click markers for details</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ParallaxImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.img style={{ y }} src={src} alt={alt} className="h-[120%] w-full object-cover" />
    </div>
  );
};

const Sourcing: React.FC = () => {
  return (
    <section className="overflow-hidden">

      {/* ── Horizontal scroll gallery ── */}
      <div className="bg-canvas px-6 pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent"
          >
            Where it comes from
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-4xl font-display text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.08] tracking-tight text-text-primary"
          >
            Sourced with intention.
          </motion.h2>
        </div>
      </div>

      {/* Gallery — full-bleed horizontal scroll with tall editorial images */}
      <div className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 scrollbar-hide lg:px-16">
        {sources.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
            className="group relative min-w-[340px] flex-shrink-0 snap-start sm:min-w-[440px] lg:min-w-[520px]"
          >
            <div className="relative h-[520px] overflow-hidden rounded-[4px] lg:h-[600px]">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

              {/* Label */}
              <span className="absolute left-6 top-6 text-[11px] font-medium uppercase tracking-[0.15em] text-white/70">
                {item.label}
              </span>

              {/* Content — revealed on hover */}
              <div className="absolute inset-x-0 bottom-0 translate-y-4 p-8 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                <h3 className="font-display text-[26px] font-normal tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-xs text-[14px] leading-[1.6] text-white/75">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Live Food Waste Data Visualization ── */}
      <LiveWasteSection />

      {/* ── Food waste — cinematic split ── */}
      <div className="grid lg:grid-cols-2">
        <div className="relative h-[50vh] min-h-[420px] lg:h-auto">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1400&q=90"
            alt="Fresh groceries being packed"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center bg-ceramic px-10 py-24 lg:px-20 lg:py-32"
        >
          <div className="max-w-lg">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent">
              Our commitment
            </p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.1] tracking-tight text-text-primary">
              How we fight
              <br />
              food waste.
            </h2>
            <p className="mt-6 text-[16px] leading-[1.8] text-text-secondary">
              We source the fresh, useful food that traditional grocery stores often overlook — unusual sizes, overstock, refill-ready pantry goods, and local finds with plenty of life left.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = '/pricing')}
              className="btn-pill mt-10 inline-flex cursor-pointer items-center gap-2.5 bg-lume-accent px-7 py-3.5 text-[14px] font-semibold tracking-tight text-white transition-all hover:bg-lume-green"
            >
              Start your refill
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Sourcing;
