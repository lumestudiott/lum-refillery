'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Ban, CalendarX, Leaf, PackageX, Recycle, WalletCards } from 'lucide-react';

const problems = [
  {
    icon: CalendarX,
    title: 'Unplanned Runs',
    description: 'Last-minute grocery trips steal evenings and still miss the essentials.',
  },
  {
    icon: PackageX,
    title: 'Too Much Packaging',
    description: 'Single-use plastic piles up around the items you buy every week.',
  },
  {
    icon: Ban,
    title: 'Same Old Shelves',
    description: 'Big-store aisles leave little room for local makers and seasonal surprises.',
  },
  {
    icon: WalletCards,
    title: 'Hard-To-Track Spend',
    description: 'A few impulse buys can turn a simple pantry restock into a surprise bill.',
  },
  {
    icon: Leaf,
    title: 'Food Waste',
    description: 'Perfectly good produce gets passed over for tiny cosmetic reasons.',
  },
  {
    icon: Recycle,
    title: 'No Refill Habit',
    description: 'The reusable option should be easy enough to repeat without thinking.',
  },
];

const benefits = [
  {
    title: 'Fresh, higher-quality groceries',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=720&q=85',
    bg: 'bg-refill-peach',
  },
  {
    title: 'Staples refilled by real people',
    image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=720&q=85',
    bg: 'bg-refill-tan',
  },
  {
    title: 'Less waste with every delivery',
    image: 'https://images.unsplash.com/photo-1522184216316-3c25379f9760?auto=format&fit=crop&w=960&q=85',
    bg: 'bg-refill-green',
    wide: true,
  },
  {
    title: 'Unique local finds most stores skip',
    image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=960&q=85',
    bg: 'bg-[#F3D88F]',
    wide: true,
  },
  {
    title: 'The best for less, planned ahead',
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=960&q=85',
    bg: 'bg-refill-yellow',
    wide: true,
  },
];

const About: React.FC = () => {
  return (
    <section className="overflow-hidden bg-cream-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-5xl text-center"
        >
          <h2 className="font-display text-4xl font-black leading-tight tracking-normal text-refill-ink md:text-6xl">
            The grocery system is too much work
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg font-medium leading-relaxed text-refill-ink/80 md:text-xl">
            When convenience means waste, rushed choices, and another errand, everyone loses. Lume Refillery is built for regular life: better restocks, fewer decisions, and reusable packaging that actually fits your routine.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="flex items-start gap-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-refill-ink bg-white">
                <problem.icon className="h-5 w-5 text-copper-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-refill-ink">{problem.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-refill-ink/75">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <h2 className="font-display text-4xl font-black tracking-normal text-refill-ink md:text-6xl">
            You deserve better
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <motion.article
              key={benefit.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className={`${benefit.wide ? 'lg:col-span-2' : ''} ${benefit.bg} overflow-hidden rounded-[18px] border-2 border-refill-ink/0 shadow-soft-float`}
            >
              <div className="h-40 overflow-hidden">
                <img src={benefit.image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
              </div>
              <p className="px-5 pb-5 pt-3 text-center text-lg font-black leading-tight text-refill-ink">
                {benefit.title}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
