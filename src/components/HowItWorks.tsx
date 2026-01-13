import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, ShoppingCart, Package, Truck, Users, Palette, Calendar, Play } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const stepIcons = [Sprout, ShoppingCart, Package, Truck, Users, Palette, Calendar, Play];
  const stepColors = ["emerald", "blue", "amber", "purple", "blue", "purple", "emerald", "amber"];

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: { icon: "text-emerald-600" },
      blue: { icon: "text-blue-600" },
      amber: { icon: "text-amber-600" },
      purple: { icon: "text-purple-600" }
    };
    return colors[color as keyof typeof colors];
  };

  const howItWorksSteps = [
    {
      title: "Choose Your Subscription",
      description: "Select a grocery subscription tier based on your household size and needs. Each tier is designed to cover balanced food groups and predictable calorie value — without requiring personal disclosures or proof of need. This is food planning, made simpler."
    },
    {
      title: "Subscribe With Confidence",
      description: "During the pre-subscription phase, you're reserving a place in our first delivery cycles. This allows Lumë to build responsibly, source accurately, and avoid overpromising. You'll always know: What tier you're on, What it includes, When deliveries are expected to begin."
    },
    {
      title: "Curated, Balanced Hauls",
      description: "Each Lumë haul is curated around: Grains & staples, Proteins (included in every haul), Cooking fats, Vegetables & pantry essentials. Items may vary, but the structure stays consistent. Substitutions preserve nutritional value — not just price."
    },
    {
      title: "Predictable Timing",
      description: "Subscriptions run on a fortnightly or monthly cadence. No last-minute price shocks. No scrambling to replan meals every week. Food you can plan around."
    },
    {
      title: "Flexible by Design",
      description: "Life changes — your subscription can too. Pause, adjust, or cancel based on your circumstances, according to your tier's policy. Lumë is built to support stability, not pressure."
    },
    {
      title: "Pre-Subscription Note",
      description: "Lumë | Refillery is currently in its pre-subscription phase. No deliveries occur during this stage. If operational thresholds are not met, pre-subscriptions will be refunded in full. Transparency is part of the service."
    },
    {
      title: "Quality Assurance",
      description: "Every item in your haul meets our quality standards. We work directly with suppliers to ensure freshness and maintain consistent nutritional value across all subscription tiers."
    },
    {
      title: "Community Focus",
      description: "By subscribing, you're supporting local food systems and sustainable practices. Your subscription helps build a more resilient food network in your community."
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">How It Works</h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Everything on your table, we handle every step with <a href="/sustainability" className="text-emerald-600 hover:text-emerald-700 transition-colors">care and sustainability</a> in mind
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-12">
          {howItWorksSteps.map((step, index) => {
            const Icon = stepIcons[index];
            const colorClasses = getColorClasses(stepColors[index]);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ y: [0, -2, 0], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                    className="w-12 h-12 flex items-center justify-center"
                  >
                    <Icon className={`w-8 h-8 ${colorClasses.icon}`} />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-3">{step.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;