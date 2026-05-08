'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Users, Leaf, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

export default function OurMissionPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">Lumë <span className="text-emerald-700 font-light">Refillery</span></Link>
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        </div>
      </header>
      <section className="relative py-24 bg-gradient-to-b from-emerald-50 to-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Our Mission</h1>
            <p className="text-xl text-stone-600 leading-relaxed">To make fresh, sustainable groceries accessible to every household in Trinidad &amp; Tobago, while supporting local farmers and reducing food waste.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop" alt="Fresh local produce" className="rounded-2xl shadow-lg" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6">Why We Started</h2>
              <p className="text-stone-600 mb-4">Lumë Refillery was born from a simple observation: too many families struggle to access fresh, quality groceries at fair prices, while local farmers struggle to find consistent markets for their produce.</p>
              <p className="text-stone-600 mb-4">We created a subscription model that solves both problems. By connecting households directly with local suppliers, we cut out middlemen, reduce waste, and ensure everyone gets a fair deal.</p>
              <p className="text-stone-600">Our name &quot;Lumë&quot; means light in Albanian - representing our commitment to bringing transparency and clarity to the food supply chain.</p>
            </motion.div>
          </div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Our Core Values</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">These principles guide every decision we make, from sourcing to delivery.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[{ icon: Heart, title: 'Community First', description: 'We prioritize the wellbeing of our community, ensuring everyone has access to nutritious food.' },
              { icon: Users, title: 'Fair Partnerships', description: 'We pay fair prices to farmers and suppliers, building lasting relationships based on trust.' },
              { icon: Leaf, title: 'Sustainability', description: 'We minimize waste, use eco-friendly packaging, and support regenerative farming practices.' },
              { icon: Target, title: 'Transparency', description: 'We believe you should know where your food comes from and how it reaches your table.' }
            ].map((value, index) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl p-6 border border-stone-200 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><value.icon className="w-6 h-6 text-emerald-600" /></div>
                <h3 className="font-semibold text-stone-900 mb-2">{value.title}</h3>
                <p className="text-sm text-stone-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-emerald-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Join Our Mission</h2>
          <p className="text-emerald-100 mb-8">Every subscription helps build a more sustainable food system for Trinidad &amp; Tobago.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-emerald-900 px-8 py-4 rounded-full font-medium hover:bg-emerald-50 transition-colors">Start Your Subscription</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
