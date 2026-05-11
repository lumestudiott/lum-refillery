'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const problems = [
  'Unplanned grocery runs steal your evenings',
  'Single-use packaging piles up every week',
  'Big stores leave no room for local makers',
  'A simple restock becomes a surprise bill',
  'Good produce gets wasted for cosmetic reasons',
  "There's no easy way to build a refill habit",
];

const benefits = [
  {
    title: 'Fresh, higher-quality groceries',
    description: 'Seasonal produce and premium staples, hand-selected for flavor — not shelf life.',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=1400&q=90',
  },
  {
    title: 'Staples refilled by real people',
    description: 'Your pantry essentials, weighed and packed with care every single week.',
    image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1400&q=90',
  },
  {
    title: 'Less waste with every delivery',
    description: 'Reusable containers that come back, get cleaned, and go out again.',
    image: 'https://images.unsplash.com/photo-1522184216316-3c25379f9760?auto=format&fit=crop&w=1400&q=90',
  },
];

const ParallaxImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <div ref={ref} className={`overflow-hidden ${className || ''}`}>
      <motion.img
        style={{ y }}
        src={src}
        alt={alt}
        className="h-[125%] w-full object-cover"
      />
    </div>
  );
};

const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.3], ['0%', '100%']);

  return (
    <section ref={sectionRef} className="overflow-hidden">

      {/* ── Problem Statement — cinematic opening ── */}
      <div className="relative bg-canvas">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-32 lg:px-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2 }}
            className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent"
          >
            The problem
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-4xl font-display text-[clamp(2.8rem,6vw,5.5rem)] font-normal leading-[1.05] tracking-tight text-text-primary"
          >
            The grocery system
            <br />
            wasn't built for you.
          </motion.h2>
        </div>

        {/* Numbered manifest — editorial list */}
        <div className="mx-auto max-w-7xl px-6 pb-32 lg:px-16">
          <motion.div
            style={{ width: lineWidth }}
            className="mb-0 h-[1px] bg-text-primary/10"
          />
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              className="group flex items-baseline gap-8 border-b border-black/[0.04] py-6 sm:gap-12 sm:py-7"
            >
              <span className="shrink-0 font-display text-[14px] italic text-text-primary/25 transition-colors duration-500 group-hover:text-lume-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-[clamp(1rem,2vw,1.25rem)] leading-[1.5] tracking-tight text-text-primary/50 transition-colors duration-500 group-hover:text-text-primary">
                {problem}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Full-bleed visual break ── */}
      <div className="relative h-[70vh] min-h-[500px]">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=2000&q=90"
          alt="Fresh farmers market produce"
          className="absolute inset-0 h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas via-transparent to-canvas" />

        {/* Centered statement over image */}
        <div className="relative flex h-full items-center justify-center px-6">
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl text-center font-display text-[clamp(1.8rem,4vw,3.2rem)] font-normal leading-[1.2] tracking-tight text-text-primary"
          >
            You deserve groceries that respect your time, your taste, and the planet.
          </motion.p>
        </div>
      </div>

      {/* ── Benefits — editorial alternating strips ── */}
      <div className="bg-canvas pt-20">
        <div className="mx-auto max-w-7xl px-6 pb-8 lg:px-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent"
          >
            The difference
          </motion.p>
        </div>

        {benefits.map((benefit, index) => (
          <div
            key={benefit.title}
            className="grid lg:grid-cols-2"
          >
            {/* Image */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`relative h-[50vh] min-h-[400px] lg:h-[600px] ${
                index % 2 === 1 ? 'lg:order-2' : ''
              }`}
            >
              <ParallaxImage
                src={benefit.image}
                alt={benefit.title}
                className="absolute inset-0 h-full"
              />
              {/* Blend edges into canvas */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-canvas via-transparent to-canvas" style={{ opacity: 0.5 }} />
              <div className={`pointer-events-none absolute inset-0 ${
                index % 2 === 0
                  ? 'bg-gradient-to-r from-transparent to-canvas'
                  : 'bg-gradient-to-l from-transparent to-canvas'
              }`} style={{ opacity: 0.4 }} />
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className={`flex items-center px-8 py-16 lg:px-20 lg:py-24 ${
                index % 2 === 1 ? 'lg:order-1' : ''
              }`}
            >
              <div className="max-w-md">
                <span className="font-display text-[80px] font-normal leading-none text-text-primary/[0.06]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-[-20px] font-display text-[clamp(1.6rem,3vw,2.4rem)] font-normal leading-[1.15] tracking-tight text-text-primary">
                  {benefit.title}
                </h3>
                <p className="mt-5 text-[16px] leading-[1.8] text-text-secondary">
                  {benefit.description}
                </p>
                <div className="mt-8 h-[1px] w-12 bg-lume-accent/40" />
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
