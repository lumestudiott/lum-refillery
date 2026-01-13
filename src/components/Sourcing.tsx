import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Sun, Droplets } from 'lucide-react';

const Sourcing: React.FC = () => {
  return (
    <section className="py-24 bg-emerald-900 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 text-emerald-300 font-medium mb-4">
              <Sprout className="w-5 h-5" />
              <span className="uppercase tracking-wider text-sm">Our Standard</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              Rooted in Quality, <br /> Grown with Respect.
            </h2>
            <p className="text-lg text-emerald-100 mb-8 leading-relaxed">
              We don't just buy food; we build relationships. Every item in your haul comes from farmers and producers we know by name. We prioritize regenerative practices, fair wages, and seasonal harvesting.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Sun className="w-6 h-6 text-emerald-400 mt-1" />
                <div>
                  <h4 className="font-bold text-white text-lg">Seasonal First</h4>
                  <p className="text-emerald-200 text-sm">We pack what's fresh and in season, ensuring maximum flavor and nutrition.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Droplets className="w-6 h-6 text-emerald-400 mt-1" />
                <div>
                  <h4 className="font-bold text-white text-lg">Sustainable Practices</h4>
                  <p className="text-emerald-200 text-sm">Partnering with farms that care for the soil and water systems.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1670012015063-14a6f2102a50?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=600" 
                alt="Farmer holding lettuce" 
                className="rounded-2xl object-cover h-64 w-full transform translate-y-8"
              />
              <img 
                src="https://images.unsplash.com/photo-1734457558950-c1989c5b615b?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=600" 
                alt="Fresh fruit pile" 
                className="rounded-2xl object-cover h-64 w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Sourcing;