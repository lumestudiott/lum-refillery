'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';

const categories = [
  {
    title: 'Specialty Produce',
    description: 'Sourced from small farms growing seasonal produce and lesser-known varieties.',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=760&q=85',
    label: 'Fresh',
  },
  {
    title: 'Small Makers',
    description: 'Pantry goods and household staples from independent producers with big flavor.',
    image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=760&q=85',
    label: 'Local',
  },
  {
    title: 'Rescued Refills',
    description: 'High-quality groceries that deserve a home before they become waste.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=760&q=85',
    label: 'Saved',
  },
];

const cards = [
  {
    title: 'Oversized Produce',
    description: 'The carrots, squash, and greens that taste great even when they look different.',
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=720&q=85',
  },
  {
    title: 'Pantry Ends',
    description: 'Useful dry goods, sauces, and snacks rescued from overstocked shelves.',
    image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=720&q=85',
  },
  {
    title: 'Reusable Delivery',
    description: 'Bins and packaging that come back to us so your weekly restock stays lighter.',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=720&q=85',
  },
];

const Sourcing: React.FC = () => {
  return (
    <section className="overflow-hidden bg-cream-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-3">
          {categories.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="text-center"
            >
              <div className="relative mx-auto mb-6 h-56 max-w-sm">
                <img src={item.image} alt="" className="h-full w-full rounded-[28px] object-cover" />
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rotate-[-3deg] rounded-full border-4 border-refill-ink bg-refill-yellow px-8 py-4 text-2xl font-black shadow-[4px_4px_0_0_#2B2B2B]">
                  {item.label}
                </div>
              </div>
              <h3 className="text-2xl font-black">{item.title}</h3>
              <p className="mx-auto mt-3 max-w-sm text-lg leading-relaxed text-refill-ink/80">{item.description}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-24 grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative"
          >
            <div className="absolute inset-8 rounded-full bg-refill-green" />
            <img
              src="https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=85"
              alt="Fresh groceries being packed for delivery"
              className="relative mx-auto aspect-square w-full max-w-[520px] rounded-[36px] object-cover shadow-soft-float"
            />
            <div className="absolute bottom-6 right-8 flex items-center gap-2 rounded-full border-2 border-refill-ink bg-cream-50 px-5 py-3 text-xl font-black shadow-[4px_4px_0_0_#2B2B2B]">
              Upcycled <ArrowUpRight className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-refill-yellow px-4 py-2 text-sm font-black uppercase tracking-[0.12em]">
              <BadgeCheck className="h-4 w-4" />
              Quality guarantee
            </div>
            <h2 className="font-display text-4xl font-black leading-tight tracking-normal md:text-6xl">
              How we fight food waste
            </h2>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-refill-ink/80">
              We source the fresh, useful food that traditional grocery stores often overlook: unusual sizes, overstock, refill-ready pantry goods, and local finds with plenty of life left.
            </p>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {cards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="overflow-hidden rounded-lg bg-white shadow-soft-float"
            >
              <img src={card.image} alt="" className="h-56 w-full object-cover" />
              <div className="p-7">
                <h3 className="text-xl font-black">{card.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-refill-ink/70">{card.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sourcing;
