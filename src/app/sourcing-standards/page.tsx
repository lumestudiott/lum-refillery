'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Shield, Truck, Users, Leaf, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

export default function SourcingStandardsPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">Lumë <span className="text-emerald-700 font-light">Refillery</span></Link>
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        </div>
      </header>
      <section className="relative py-24 bg-gradient-to-b from-amber-50 to-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Sourcing Standards</h1>
            <p className="text-xl text-stone-600 leading-relaxed">We hold ourselves to the highest standards when selecting suppliers and products. Here&apos;s how we ensure quality from farm to table.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[{ icon: Shield, title: 'Quality Assurance', points: ['All products inspected upon receipt', 'Temperature-controlled storage', 'Regular supplier audits', 'Batch tracking for traceability'] },
              { icon: Users, title: 'Supplier Requirements', points: ['Fair labor practices certification', 'Food safety compliance', 'Transparent pricing agreements', 'Commitment to sustainability'] },
              { icon: Leaf, title: 'Environmental Standards', points: ['Minimal packaging requirements', 'Local sourcing prioritized', 'Organic options where available', 'Zero single-use plastics goal'] }
            ].map((standard, index) => (
              <motion.div key={standard.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl p-8 border border-stone-200">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6"><standard.icon className="w-6 h-6 text-emerald-600" /></div>
                <h3 className="text-xl font-semibold text-stone-900 mb-4">{standard.title}</h3>
                <ul className="space-y-3">{standard.points.map(p => <li key={p} className="flex items-start gap-3 text-stone-600"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span>{p}</span></li>)}</ul>
              </motion.div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-stone-200">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8 text-center">Our Sourcing Process</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[{ step: '01', title: 'Identify', desc: 'We research and identify potential suppliers who align with our values.' },
                { step: '02', title: 'Evaluate', desc: 'Suppliers undergo rigorous evaluation for quality, ethics, and sustainability.' },
                { step: '03', title: 'Partner', desc: 'We establish fair, long-term partnerships with approved suppliers.' },
                { step: '04', title: 'Monitor', desc: 'Ongoing quality checks and regular audits ensure standards are maintained.' }
              ].map((item, index) => (
                <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-3">{item.step}</div>
                  <h3 className="font-semibold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-stone-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Supporting Local</h2></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[{ icon: Truck, stat: '80%', label: 'Locally Sourced Products' }, { icon: Users, stat: '25+', label: 'Local Partner Farms' }, { icon: Award, stat: '100%', label: 'Fair Trade Commitment' }].map((item, index) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl p-8 text-center border border-stone-200">
                <item.icon className="w-8 h-8 text-emerald-600 mx-auto mb-4" /><div className="text-4xl font-bold text-stone-900 mb-2">{item.stat}</div><div className="text-stone-600">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
