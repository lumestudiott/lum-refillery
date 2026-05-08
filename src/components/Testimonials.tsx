'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Family of 4',
    quote: 'Lume changed how we shop. Our essentials show up, the produce is beautiful, and we waste far less.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=85',
  },
  {
    name: 'James K.',
    role: 'Solo subscriber',
    quote: 'The portions are right for me, and the refill packaging makes the whole thing feel smarter.',
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=800&q=85',
  },
  {
    name: 'Priya D.',
    role: '2-year subscriber',
    quote: 'We have discovered more local staples through Lume than we ever found at the supermarket.',
    image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=800&q=85',
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-refill-lime px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute left-0 right-0 top-0 h-24 -translate-y-1 bg-refill-blue wave-bottom" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <h2 className="mx-auto max-w-4xl text-center font-display text-4xl font-black leading-tight tracking-normal md:text-6xl">
          Our customers have saved thousands of grocery trips
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={`${index === 1 ? 'md:-mt-10' : 'md:mt-10'} overflow-hidden rounded-lg bg-white shadow-soft-float`}
            >
              <img src={item.image} alt="" className="h-64 w-full object-cover" />
              <div className="p-8">
                <Quote className="h-8 w-8 fill-copper-600 text-copper-600" />
                <p className="mt-4 text-lg leading-relaxed text-refill-ink/75">{item.quote}</p>
                <div className="mt-6">
                  <h3 className="font-black">{item.name}</h3>
                  <p className="text-sm font-bold text-refill-ink/55">{item.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
