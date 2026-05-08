'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Briefcase, Heart, Users, Leaf, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

const openPositions = [
  { title: 'Delivery Driver', type: 'Part-time', location: 'Port of Spain', description: 'Join our delivery team and help bring fresh groceries to families across Trinidad.' },
  { title: 'Warehouse Associate', type: 'Full-time', location: 'Port of Spain', description: 'Help us pack and prepare hauls with care and attention to quality.' },
  { title: 'Customer Success Representative', type: 'Full-time', location: 'Remote', description: 'Be the friendly voice that helps our subscribers get the most from their hauls.' }
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">Lumë <span className="text-emerald-700 font-light">Refillery</span></Link>
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        </div>
      </header>
      <section className="relative py-24 bg-gradient-to-b from-stone-900 to-stone-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Join Our Team</h1>
            <p className="text-xl text-stone-300 leading-relaxed">Help us build a more sustainable food system for Trinidad &amp; Tobago. We&apos;re looking for passionate people who care about community and quality.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Why Work With Us</h2></div>
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {[{ icon: Heart, title: 'Meaningful Work', description: 'Every day, you help families access nutritious food and support local farmers.' }, { icon: Users, title: 'Great Team', description: 'Work alongside passionate people who care about making a difference.' }, { icon: Leaf, title: 'Sustainability Focus', description: 'Be part of building a more sustainable food system for future generations.' }, { icon: Briefcase, title: 'Growth Opportunities', description: 'As we grow, so do opportunities for advancement and skill development.' }].map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><b.icon className="w-7 h-7 text-emerald-600" /></div>
                <h3 className="font-semibold text-stone-900 mb-2">{b.title}</h3><p className="text-sm text-stone-600">{b.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mb-16">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8 text-center">Open Positions</h2>
            <div className="space-y-4">
              {openPositions.map((pos, i) => (
                <motion.div key={pos.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><h3 className="text-lg font-semibold text-stone-900 mb-2">{pos.title}</h3><p className="text-stone-600 text-sm mb-3">{pos.description}</p>
                      <div className="flex flex-wrap gap-3"><span className="inline-flex items-center gap-1 text-xs text-stone-500"><Clock className="w-3 h-3" />{pos.type}</span><span className="inline-flex items-center gap-1 text-xs text-stone-500"><MapPin className="w-3 h-3" />{pos.location}</span></div>
                    </div>
                    <a href={`mailto:lumestudiott@gmail.com?subject=Application: ${pos.title}`} className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors whitespace-nowrap">Apply Now</a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-emerald-50 rounded-2xl p-8 md:p-12 text-center border border-emerald-100">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">Don&apos;t See Your Role?</h3>
            <p className="text-stone-600 mb-6 max-w-2xl mx-auto">We&apos;re always looking for talented people who share our passion for sustainable food systems. Send us your resume and tell us how you&apos;d like to contribute.</p>
            <a href="mailto:lumestudiott@gmail.com?subject=General Application - Lumë Refillery" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-medium transition-colors"><Mail className="w-5 h-5" /> Send Your Resume</a>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
