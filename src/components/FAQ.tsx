'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

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
    answer: "We prioritize delivering exactly what you ordered. If an item is unavailable due to supply chain issues, we substitute with an item of equal or higher value, never lower."
  },
  {
    question: "Do you deliver to my area?",
    answer: "We currently serve the greater metro area. Please enter your zip code at checkout to confirm if you are within our delivery zone."
  },
  {
    question: "How is the Supported Haul different?",
    answer: "The Supported Haul is designed to maximize caloric density and utility per dollar, making it an ideal option for gifting to those in need or for budget-conscious households focused on essentials."
  }
];

const FAQItem: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className="border-b border-black/[0.05]"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full cursor-pointer items-center justify-between py-7 text-left focus:outline-none"
      >
        <span className="max-w-[85%] text-[clamp(0.95rem,1.5vw,1.1rem)] font-medium tracking-tight text-text-primary/80 transition-colors duration-300 group-hover:text-text-primary">
          {question}
        </span>
        <span className="shrink-0 text-text-primary/30 transition-colors duration-300 group-hover:text-lume-accent">
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="max-w-xl pb-8 text-[15px] leading-[1.8] text-text-secondary">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section className="bg-ceramic px-6 py-36 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent"
        >
          FAQ
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] tracking-tight text-text-primary"
        >
          Frequently asked
          <br />
          questions.
        </motion.h2>

        <div className="mt-16">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
