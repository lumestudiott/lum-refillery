'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, ShoppingCart, Package, Truck, Leaf, Recycle, Heart, Globe } from 'lucide-react';
import Link from 'next/link';

export default function SustainabilityPage() {
  const sustainabilitySteps = [
    { icon: Sprout, title: "Source from Local Farms", description: "We partner with sustainable farms within 100 miles to bring you the freshest seasonal produce.", color: "emerald" },
    { icon: ShoppingCart, title: "Curate Your Haul", description: "Our team carefully selects premium items based on your subscription tier and dietary preferences.", color: "blue" },
    { icon: Package, title: "Pack with Care", description: "Everything is packed in eco-friendly materials to maintain freshness during delivery.", color: "amber" },
    { icon: Truck, title: "Deliver to Your Door", description: "Fresh groceries arrive at your doorstep on your scheduled delivery day, ready to enjoy.", color: "purple" }
  ];
  const commitments = [
    { icon: Leaf, title: "Carbon Footprint Reduction", description: "By sourcing locally and optimizing delivery routes, we minimize transportation emissions and support regional food systems.", color: "green" },
    { icon: Recycle, title: "Sustainable Packaging", description: "All packaging materials are either reusable, recyclable, or compostable. We're committed to zero-waste packaging solutions.", color: "blue" },
    { icon: Heart, title: "Community Support", description: "Every subscription directly supports local farmers and food producers, strengthening our regional food economy.", color: "red" },
    { icon: Globe, title: "Regenerative Agriculture", description: "We prioritize partnerships with farms practicing regenerative agriculture that improves soil health and biodiversity.", color: "emerald" }
  ];
  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = { emerald: "text-emerald-600 bg-emerald-100", blue: "text-blue-600 bg-blue-100", amber: "text-amber-600 bg-amber-100", purple: "text-purple-600 bg-purple-100", green: "text-green-600 bg-green-100", red: "text-red-600 bg-red-100" };
    return colors[color] || "text-stone-600 bg-stone-100";
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">Lumë <span className="text-emerald-700 font-light">Refillery</span></Link>
          <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors">← Back to Home</Link>
        </div>
      </header>
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2070&auto=format&fit=crop" alt="Sustainable farming" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-stone-900/60" /></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Our Sustainability Statement</h1>
            <p className="text-xl text-stone-200 leading-relaxed">At Lumë Refillery, sustainability isn&apos;t just a buzzword—it&apos;s the foundation of everything we do.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">How We Work Sustainably</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">Every step of our process is designed with environmental responsibility and community impact in mind.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-12">
            {sustainabilitySteps.map((step, index) => { const Icon = step.icon; return (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="flex gap-6">
                <div className="flex-shrink-0"><div className={`w-16 h-16 rounded-2xl ${getColorClasses(step.color)} flex items-center justify-center`}><Icon className="w-8 h-8" /></div></div>
                <div><h3 className="text-xl font-semibold text-stone-900 mb-3">{step.title}</h3><p className="text-stone-600 leading-relaxed">{step.description}</p></div>
              </motion.div>
            ); })}
          </div>
        </div>
      </section>
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Our Environmental Commitments</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-12">
            {commitments.map((c, index) => { const Icon = c.icon; return (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl ${getColorClasses(c.color)} flex items-center justify-center flex-shrink-0`}><Icon className="w-8 h-8" /></div>
                  <div><h3 className="text-xl font-semibold text-stone-900 mb-3">{c.title}</h3><p className="text-stone-600 leading-relaxed">{c.description}</p></div>
                </div>
              </motion.div>
            ); })}
          </div>
        </div>
      </section>
      <section className="py-24 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Join Our Sustainable Food Movement</h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">Every subscription supports local farmers, reduces food miles, and helps build a more sustainable food system.</p>
          <Link href="/" className="inline-block bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-50 transition-colors duration-300">Start Your Sustainable Journey</Link>
        </div>
      </section>
    </main>
  );
}
