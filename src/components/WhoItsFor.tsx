import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Globe } from 'lucide-react';

const audiences = [
  {
    icon: Users,
    title: "Busy Families",
    description: "Save time on grocery runs. Get the staples you use every week delivered automatically, so you never run out of rice or flour again.",
    image: "https://images.unsplash.com/photo-1578496780896-7081cc23c111?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=800"
  },
  {
    icon: Globe,
    title: "Diaspora Gifting",
    description: "Support loved ones back home. Our reliable delivery network ensures your care package reaches your family safely and consistently.",
    image: "https://images.unsplash.com/photo-1576089073624-b5751a8f4de9?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=800"
  },
  {
    icon: Briefcase,
    title: "Professionals",
    description: "Streamline your pantry. Focus on your work and life, knowing your kitchen essentials are handled with quality and care.",
    image: "https://images.unsplash.com/photo-1681936488318-d7607d5472cd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=800"
  }
];

const WhoItsFor: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Who It's For</h2>
          <p className="text-lg text-stone-600">
            Designed to fit seamlessly into your life, wherever you are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-md">
                <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/10 transition-colors z-10" />
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl z-20">
                  <item.icon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
              <p className="text-stone-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default WhoItsFor;