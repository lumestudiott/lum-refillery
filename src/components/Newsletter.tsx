'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');

    try {
      const result = await subscribe({ email });
      setStatus('success');
      setMessage(result.message);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="bg-refill-yellow px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-4xl text-center"
      >
        <h2 className="font-display text-4xl font-black leading-tight tracking-normal md:text-6xl">Get fresh updates</h2>
        <p className="mx-auto mt-4 max-w-2xl text-xl leading-relaxed text-refill-ink/80">
          Seasonal refill drops, local maker features, and subscriber-only offers.
        </p>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-full border-2 border-refill-ink bg-white px-6 py-4 font-black"
          >
            <Check className="h-5 w-5" />
            <span>{message}</span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="your@email.com"
              className={`min-w-0 flex-1 rounded border-2 bg-white px-5 py-4 text-refill-ink placeholder:text-refill-ink/45 focus:outline-none focus:ring-4 focus:ring-white/60 ${
                status === 'error' ? 'border-copper-600' : 'border-refill-ink'
              }`}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-refill-ink bg-refill-pink px-8 py-4 font-black text-white shadow-[4px_4px_0_0_#2B2B2B] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Subscribe <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        )}

        {status === 'error' && <p className="mt-3 text-sm font-black text-copper-600">{message}</p>}
      </motion.div>
    </section>
  );
};

export default Newsletter;
