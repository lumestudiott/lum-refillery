'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, Leaf, Package, Heart, Recycle } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

export default function ImpactReportPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">Lumë <span className="text-emerald-700 font-light">Refillery</span></Link>
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        </div>
      </header>
      <section className="relative py-24 bg-gradient-to-b from-emerald-900 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-emerald-300 text-sm font-medium uppercase tracking-wider">2024 Report</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mt-4 mb-6">Impact Report</h1>
            <p className="text-xl text-emerald-100 leading-relaxed">Measuring our progress toward a more sustainable and equitable food system in Trinidad &amp; Tobago.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Key Metrics</h2><p className="text-stone-600">Our impact by the numbers</p></div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {[{ icon: Users, value: '500+', label: 'Active Subscribers' }, { icon: Package, value: '12,000+', label: 'Hauls Delivered' }, { icon: Heart, value: '150+', label: 'Supported Hauls Given' }, { icon: Leaf, value: '2.5 tons', label: 'Food Waste Prevented' }, { icon: Recycle, value: '85%', label: 'Packaging Recycled' }, { icon: TrendingUp, value: '$50K+', label: 'Paid to Local Farmers' }].map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-6 text-center border border-stone-200">
                <m.icon className="w-8 h-8 text-emerald-600 mx-auto mb-3" /><div className="text-2xl font-bold text-stone-900 mb-1">{m.value}</div><div className="text-xs text-stone-500">{m.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-8 border border-stone-200">
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Community Impact</h3>
              <div className="space-y-6">
                {[{ l: 'Families Fed Monthly', v: '500+', w: '75%', c: 'bg-emerald-500' }, { l: 'Supported Hauls Distributed', v: '150+', w: '45%', c: 'bg-amber-500' }, { l: 'Customer Satisfaction', v: '98%', w: '98%', c: 'bg-blue-500' }].map(d => (
                  <div key={d.l}><div className="flex justify-between mb-2"><span className="text-stone-600">{d.l}</span><span className="font-semibold text-stone-900">{d.v}</span></div><div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className={`h-full ${d.c} rounded-full`} style={{ width: d.w }}></div></div></div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-8 border border-stone-200">
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Environmental Impact</h3>
              <div className="space-y-6">
                {[{ l: 'Carbon Footprint Reduction', v: '30%', w: '30%', c: 'bg-emerald-500' }, { l: 'Plastic-Free Packaging', v: '65%', w: '65%', c: 'bg-teal-500' }, { l: 'Local Sourcing Rate', v: '80%', w: '80%', c: 'bg-lime-500' }].map(d => (
                  <div key={d.l}><div className="flex justify-between mb-2"><span className="text-stone-600">{d.l}</span><span className="font-semibold text-stone-900">{d.v}</span></div><div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className={`h-full ${d.c} rounded-full`} style={{ width: d.w }}></div></div></div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">2025 Goals</h2></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[{ target: '1,000', label: 'Active Subscribers', current: '500+' }, { target: '100%', label: 'Plastic-Free Packaging', current: '65%' }, { target: '500', label: 'Supported Hauls/Year', current: '150+' }, { target: '90%', label: 'Local Sourcing', current: '80%' }].map((g, i) => (
              <motion.div key={g.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 text-center border border-stone-200">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{g.target}</div><div className="text-stone-900 font-medium mb-2">{g.label}</div><div className="text-sm text-stone-500">Currently: {g.current}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
