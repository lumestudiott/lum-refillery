'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Family of 4',
    quote: 'Lume changed how we shop. Our essentials show up, the produce is beautiful, and we waste far less than we used to.',
  },
  {
    name: 'James K.',
    role: 'Solo subscriber',
    quote: 'The portions are right for me, and the refill packaging makes the whole thing feel smarter. It just works.',
  },
  {
    name: 'Priya D.',
    role: '2-year subscriber',
    quote: 'We have discovered more local staples through Lume than we ever found at the supermarket.',
  },
];

const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="overflow-hidden bg-canvas px-6 py-36 lg:px-16">
      <div className="mx-auto max-w-5xl">

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="text-center text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent"
        >
          Testimonials
        </motion.p>

        {/* Large featured quote */}
        <div className="relative mt-16 min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <p className="mx-auto max-w-3xl font-display text-[clamp(1.6rem,3.5vw,2.8rem)] font-normal leading-[1.3] tracking-tight text-text-primary">
                &ldquo;{testimonials[current].quote}&rdquo;
              </p>

              <div className="mt-12">
                <p className="text-[15px] font-semibold tracking-tight text-text-primary">
                  {testimonials[current].name}
                </p>
                <p className="mt-1 text-[13px] text-text-secondary">
                  {testimonials[current].role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="mt-16 flex items-center justify-center gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className="relative h-[2px] cursor-pointer overflow-hidden rounded-full bg-black/10 transition-all duration-500"
              style={{ width: index === current ? 48 : 16 }}
            >
              {index === current && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6, ease: 'linear' }}
                  className="absolute inset-0 origin-left bg-lume-accent"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
