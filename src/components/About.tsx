import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Leaf } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section className="py-24 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1678274324663-afc2c68eeeec?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1080" 
                alt="Community farmers market" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-xl shadow-xl max-w-xs hidden md:block">
              <p className="font-serif text-xl italic text-stone-800">
                "Food is the language of care, and we speak it fluently."
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-emerald-600 font-medium mb-4">
              <Leaf className="w-5 h-5" />
              <span className="uppercase tracking-wider text-sm">Our Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
              Connecting Communities Through Food
            </h2>
            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
              Lumë Refillery was born from a simple idea: everyone deserves access to high-quality, culturally relevant food staples without the stress of fluctuating prices or supply chain uncertainty.
            </p>
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              We partner directly with sustainable farms and ethical suppliers to bring you essential groceries at fair, transparent prices. Whether you're feeding your own family or supporting loved ones from afar, we're here to make sure the pantry is always full.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Community First</h4>
                  <p className="text-sm text-stone-600">Built for families, by families. We understand the importance of shared meals.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Care & Quality</h4>
                  <p className="text-sm text-stone-600">Every item is hand-picked and packed with the same care you'd give your own shopping.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
