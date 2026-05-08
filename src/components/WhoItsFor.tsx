'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Banknote, Clock, HeartHandshake, ShieldCheck } from 'lucide-react';

const promises = [
  {
    icon: ShieldCheck,
    title: 'Your Box = Your Rules',
    description: 'Shop exactly what you want or skip a week. It is up to you.',
  },
  {
    icon: Clock,
    title: 'Convenient Delivery',
    description: 'Groceries arrive at your door with no line, no parking, no extra stop.',
  },
  {
    icon: Banknote,
    title: 'Money-Back Guarantee',
    description: "If something is not right, we will make it right.",
  },
];

const reasons = [
  {
    icon: HeartHandshake,
    title: 'Families',
    description: 'Keep weekly essentials moving without turning every restock into a chore.',
    bg: 'bg-refill-yellow',
  },
  {
    icon: ShieldCheck,
    title: 'Gift Givers',
    description: 'Send reliable staples and comfort foods to the people you care about.',
    bg: 'bg-refill-blue',
  },
  {
    icon: Clock,
    title: 'Busy Professionals',
    description: 'Let your pantry stay handled while your schedule stays full.',
    bg: 'bg-refill-peach',
  },
];

const WhoItsFor: React.FC = () => {
  return (
    <section className="bg-refill-yellow">
      <div className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute left-0 right-0 top-0 h-24 -translate-y-1 bg-cream-50 wave-bottom" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 py-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <img
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1100&q=85"
              alt="Packed grocery box"
              className="mx-auto aspect-[5/4] w-full max-w-[560px] rounded-[36px] object-cover shadow-soft-float"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="mb-4 text-sm font-black uppercase tracking-[0.14em]">Our quality guarantee</p>
            <h2 className="font-display text-4xl font-black leading-tight tracking-normal md:text-6xl">
              Quality you can taste
            </h2>
            <p className="mt-6 max-w-xl text-xl leading-relaxed">
              We are confident in the freshness of every haul. If anything in your delivery does not live up to your standards, we will make it right fast.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 mx-auto mt-12 max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {promises.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="text-center md:text-left"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-refill-ink bg-cream-50 md:mx-0">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-refill-ink/80">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-cream-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="font-display text-4xl font-black tracking-normal md:text-6xl">Built for real grocery habits</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {reasons.map((reason, index) => (
              <motion.article
                key={reason.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={`${reason.bg} rounded-lg p-8 text-left shadow-soft-float`}
              >
                <reason.icon className="h-9 w-9" />
                <h3 className="mt-6 text-2xl font-black">{reason.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-refill-ink/75">{reason.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoItsFor;
