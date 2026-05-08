'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "Can I pause or cancel my subscription?",
    answer: "Absolutely. You have full control over your subscription. You can pause for a vacation, skip a week, or cancel anytime directly from your dashboard with no hidden fees."
  },
  {
    question: "What happens if I have dietary restrictions?",
    answer: "Currently, our hauls are pre-curated to ensure the best value and efficiency. However, we are working on introducing customizable options for gluten-free and vegan diets in the near future."
  },
  {
    question: "How does the substitution policy work?",
    answer: "We prioritize delivering exactly what you ordered. If an item is unavailable due to supply chain issues, we substitute with an item of equal or higher value, never lower. We'll notify you if significant changes are made."
  },
  {
    question: "Do you deliver to my area?",
    answer: "We currently serve the greater metro area. Please enter your zip code at checkout to confirm if you are within our delivery zone."
  },
  {
    question: "How is the 'Supported Haul' different?",
    answer: "The Supported Haul is designed to maximize caloric density and utility per dollar, making it an ideal option for gifting to those in need or for budget-conscious households focused on essentials."
  }
];

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b-2 border-refill-ink/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-lg font-black text-refill-ink transition-colors group-hover:text-forest-800">{question}</span>
        <span className="ml-6 flex-shrink-0 text-refill-ink">
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </span>
      </button>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-refill-ink/70 leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section className="bg-cream-50 py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4 font-display text-4xl font-black tracking-normal text-refill-ink md:text-6xl">Frequently Asked Questions</h2>
          <p className="text-lg text-refill-ink/70">
            Everything you need to know about Lumë Refillery.
          </p>
        </div>

        <div className="rounded-lg border-2 border-refill-ink bg-white p-8 shadow-[5px_5px_0_0_#2B2B2B]">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default FAQ;
