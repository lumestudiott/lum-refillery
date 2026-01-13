import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah M.",
    role: "Busy Mom",
    image: "https://images.unsplash.com/photo-1672075270227-ddf5cb181a79?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=200",
    quote: "Lumë has completely changed how I shop. Knowing I have the basics covered every week takes so much stress off my plate. The quality is incredible."
  },
  {
    name: "David K.",
    role: "Diaspora Gifter",
    image: "https://images.unsplash.com/photo-1658288098101-84f074c292a8?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=200",
    quote: "I send the Household Haul to my parents back home. It's reliable, transparent, and I know they're getting good food, not just cash transfers."
  },
  {
    name: "Elena R.",
    role: "Sustainable Living",
    image: "https://images.unsplash.com/photo-1590905775253-a4f0f3c426ff?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=200",
    quote: "I love that I'm supporting local farmers directly. The produce tastes real, unlike the supermarket stuff. It feels good to be part of this community."
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Loved by the Community</h2>
          <p className="text-lg text-stone-600">
            Don't just take our word for it. Here's what our members are saying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 relative"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-stone-600 mb-8 leading-relaxed italic">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{item.name}</h4>
                  <p className="text-xs text-stone-500 uppercase tracking-wide">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Testimonials;