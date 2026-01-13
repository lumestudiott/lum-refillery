import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Leaf, Package, Heart, Recycle } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const ImpactReport: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">
            Lumë <span className="text-emerald-700 font-light">Refillery</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-b from-emerald-900 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-emerald-300 text-sm font-medium uppercase tracking-wider">2024 Report</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mt-4 mb-6">Impact Report</h1>
            <p className="text-xl text-emerald-100 leading-relaxed">
              Measuring our progress toward a more sustainable and equitable food system in Trinidad & Tobago.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Key Metrics</h2>
            <p className="text-stone-600">Our impact by the numbers</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {[
              { icon: Users, value: '500+', label: 'Active Subscribers' },
              { icon: Package, value: '12,000+', label: 'Hauls Delivered' },
              { icon: Heart, value: '150+', label: 'Supported Hauls Given' },
              { icon: Leaf, value: '2.5 tons', label: 'Food Waste Prevented' },
              { icon: Recycle, value: '85%', label: 'Packaging Recycled' },
              { icon: TrendingUp, value: '$50K+', label: 'Paid to Local Farmers' }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 text-center border border-stone-200"
              >
                <metric.icon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-stone-900 mb-1">{metric.value}</div>
                <div className="text-xs text-stone-500">{metric.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Impact Areas */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Community Impact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-stone-200"
            >
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Community Impact</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-stone-600">Families Fed Monthly</span>
                    <span className="font-semibold text-stone-900">500+</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-stone-600">Supported Hauls Distributed</span>
                    <span className="font-semibold text-stone-900">150+</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-stone-600">Customer Satisfaction</span>
                    <span className="font-semibold text-stone-900">98%</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Environmental Impact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-stone-200"
            >
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Environmental Impact</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-stone-600">Carbon Footprint Reduction</span>
                    <span className="font-semibold text-stone-900">30%</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-stone-600">Plastic-Free Packaging</span>
                    <span className="font-semibold text-stone-900">65%</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-stone-600">Local Sourcing Rate</span>
                    <span className="font-semibold text-stone-900">80%</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-lime-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">2025 Goals</h2>
            <p className="text-stone-600">What we're working toward</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { target: '1,000', label: 'Active Subscribers', current: '500+' },
              { target: '100%', label: 'Plastic-Free Packaging', current: '65%' },
              { target: '500', label: 'Supported Hauls/Year', current: '150+' },
              { target: '90%', label: 'Local Sourcing', current: '80%' }
            ].map((goal, index) => (
              <motion.div
                key={goal.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center border border-stone-200"
              >
                <div className="text-3xl font-bold text-emerald-600 mb-1">{goal.target}</div>
                <div className="text-stone-900 font-medium mb-2">{goal.label}</div>
                <div className="text-sm text-stone-500">Currently: {goal.current}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ImpactReport;