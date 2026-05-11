'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const promises = [
  { title: 'Your Box, Your Rules', text: 'Shop what you want or skip — full control, always.' },
  { title: 'Doorstep Delivery', text: 'No lines, no parking, no extra stops.' },
  { title: 'Money-Back Guarantee', text: "If it's not right, we make it right." },
];

const audiences = [
  {
    title: 'Families',
    description: 'Keep weekly essentials moving without turning every restock into a chore.',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Gift Givers',
    description: 'Send reliable staples and comfort foods to the people you care about.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Busy Professionals',
    description: 'Let your pantry stay handled while your schedule stays full.',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=1800&q=90',
  },
];

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

const WhoItsFor: React.FC = () => {
  return (
    <section className="overflow-hidden">

      {/* ── Quality Guarantee — cinematic split ── */}
      <div className="grid lg:grid-cols-2">
        <div className="relative h-[50vh] min-h-[420px] lg:h-auto">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1400&q=90"
            alt="Packed grocery box"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center bg-canvas px-10 py-24 lg:px-20 lg:py-32"
        >
          <div className="max-w-lg">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent">
              Our guarantee
            </p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] tracking-tight text-text-primary">
              Quality you
              <br />
              can taste.
            </h2>
            <p className="mt-6 text-[16px] leading-[1.8] text-text-secondary">
              {"We're confident in the freshness of every haul. If anything doesn't live up to your standards, we'll make it right — fast."}
            </p>

            {/* Promises — minimal editorial list */}
            <div className="mt-12 space-y-0">
              {promises.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-5 border-t border-black/[0.05] py-5"
                >
                  <div className="mt-1 h-4 w-4 shrink-0 rounded-full bg-lume-accent/15 ring-[1.5px] ring-lume-accent/40" />
                  <div>
                    <h4 className="text-[14px] font-semibold tracking-tight text-text-primary">{item.title}</h4>
                    <p className="mt-0.5 text-[13px] text-text-secondary">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Audiences — immersive full-bleed panels ── */}
      <div className="bg-lume-house px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/35"
          >
            Who it's for
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.08] text-white"
          >
            Built for real
            <br />
            grocery habits.
          </motion.h2>
        </div>
      </div>

      {/* Stacked immersive image panels */}
      {audiences.map((item, index) => (
        <ImmersivePanel key={item.title} item={item} index={index} />
      ))}
    </section>
  );
};

const ImmersivePanel: React.FC<{ item: typeof audiences[0]; index: number }> = ({ item, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.05]);
  const textY = useTransform(scrollYProgress, [0.2, 0.5], [60, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  return (
    <div
      ref={ref}
      className="relative flex h-[80vh] min-h-[500px] items-end overflow-hidden lg:h-[90vh]"
    >
      {/* Background image with scroll-driven scale */}
      <motion.img
        style={{ scale: imgScale }}
        src={item.image}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 w-full px-8 pb-16 lg:px-20 lg:pb-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-8">
            <div>
              <span className="font-display text-[14px] italic text-white/30">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-display text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[1.05] tracking-tight text-white">
                {item.title}
              </h3>
              <p className="mt-4 max-w-md text-[16px] leading-[1.7] text-white/65">
                {item.description}
              </p>
            </div>

            {/* Scroll indicator line */}
            <div className="hidden h-16 w-px bg-white/20 lg:block" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WhoItsFor;
