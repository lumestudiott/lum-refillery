import React, { useState } from 'react';
import { SUBSCRIPTION_TIERS } from '../data/tiers';
import TierCard from './TierCard';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const TiersDisplay: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'fortnightly' | 'monthly' | 'yearly'>('monthly');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-stone-600 mb-8">
            Choose the plan that fits your needs. No hidden fees, pause or cancel anytime.
          </p>
          
          <div className="inline-flex bg-stone-100 p-1.5 rounded-2xl shadow-inner">
            <button
              onClick={() => setBillingCycle('fortnightly')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                billingCycle === 'fortnightly'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Fortnightly
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                billingCycle === 'yearly'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Yearly
              <motion.span 
                className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.span
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                </motion.span>
                Save
              </motion.span>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SUBSCRIPTION_TIERS.map((tier, index) => (
          <TierCard key={tier.id} tier={tier} billingCycle={billingCycle} index={index} />
        ))}
      </div>
    </section>
  );
};

export default TiersDisplay;
