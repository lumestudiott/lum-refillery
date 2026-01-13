import React from 'react';
import BlurText from './ui/BlurText';
import { ArrowRight, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const { isSignedIn } = useUser();

  const handleStartSubscription = () => {
    // Scroll to pricing section
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image - Grocery Store Produce Aisle */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" 
          alt="Fresh produce grocery store aisle" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 text-emerald-400 font-medium mb-6"
          >
            <Leaf className="w-5 h-5" />
            <span className="tracking-wide uppercase text-sm">Thoughtfully Sourced Subscription</span>
          </motion.div>

          <div className="mb-8">
            <BlurText
              text="Just Food,"
              className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight block"
              delay={100}
              animateBy="words"
              direction="top"
            />
            <BlurText
              text="Built For Your Table."
              className="text-5xl md:text-7xl font-serif font-bold text-emerald-400 leading-tight block mt-2"
              delay={300}
              animateBy="words"
              direction="top"
            />
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg md:text-xl text-stone-200 mb-10 leading-relaxed max-w-lg"
          >
           Reliable grocery subscriptions, thoughtfully built for everyday tables.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {isSignedIn ? (
              <button 
                onClick={handleStartSubscription}
                className="bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-emerald-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group shadow-lg shadow-emerald-900/20 cursor-pointer"
              >
                Start Your Subscription
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-emerald-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group shadow-lg shadow-emerald-900/20 cursor-pointer">
                  Start Your Subscription
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignInButton>
            )}
            
            <Link 
              to="/sample-hauls"
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer"
            >
              View Sample Hauls
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
