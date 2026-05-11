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
    if (!email || !email.includes('@')) { setStatus('error'); setMessage('Please enter a valid email'); return; }
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
    <section className="relative overflow-hidden bg-lume-house px-6 py-36 lg:px-16">

      {/* Subtle background text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="whitespace-nowrap font-display text-[clamp(8rem,20vw,18rem)] font-normal leading-none text-white/[0.02]">
          Stay Fresh
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/30"
        >
          Newsletter
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-normal leading-[1.1] text-white"
        >
          Get fresh updates.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-5 max-w-lg text-[16px] leading-[1.8] text-white/45"
        >
          Seasonal drops, local maker features, and subscriber-only offers — straight to your inbox.
        </motion.p>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-12 flex max-w-md items-center justify-center gap-3 text-[15px] font-medium text-white/80"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lume-accent">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
            <span>{message}</span>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="mx-auto mt-12 flex max-w-md gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
              placeholder="your@email.com"
              className={`min-w-0 flex-1 border-b bg-transparent pb-3 text-[15px] text-white placeholder:text-white/25 transition-all focus:outline-none ${
                status === 'error' ? 'border-red-400/60' : 'border-white/15 focus:border-white/40'
              }`}
            />
            <motion.button
              type="submit"
              disabled={status === 'loading'}
              whileTap={{ scale: 0.95 }}
              className="btn-pill flex shrink-0 cursor-pointer items-center gap-2 bg-white px-6 py-2.5 text-[13px] font-semibold tracking-tight text-lume-house transition-all hover:bg-white/90 disabled:opacity-50"
            >
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>Subscribe <ArrowRight className="h-3.5 w-3.5" /></>
              )}
            </motion.button>
          </motion.form>
        )}

        {status === 'error' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[13px] text-red-300">
            {message}
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
