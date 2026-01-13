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
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Join the Table</h2>
          <p className="text-lg text-stone-600 mb-8 max-w-2xl mx-auto">
            Get seasonal recipes, farmer stories, and exclusive offers delivered to your inbox. No spam, just good food.
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-emerald-600 bg-emerald-50 py-4 px-6 rounded-full max-w-md mx-auto"
            >
              <Check className="w-5 h-5" />
              <span className="font-medium">{message}</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="Enter your email" 
                className={`flex-grow px-6 py-4 rounded-full bg-stone-50 border focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                  status === 'error' ? 'border-red-300' : 'border-stone-200'
                }`}
              />
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-stone-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
          
          {status === 'error' && (
            <p className="text-red-500 text-sm mt-3">{message}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;