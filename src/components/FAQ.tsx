'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "Why shop at Lumë Refillery?",
    answer: "Lumë Refillery is an innovative grocery ecosystem designed to change how we provision our homes. We curate everyday essentials based on strict standards of quality, nutrition, and environmental stewardship. By partnering with local farmers, large distributors and emerging ethical producers, we are designing a more transparent and less wasteful regional food system.\n\nFrom nutrient-dense staples to home goods and personal care items, our service delivers everything you need in a seamless, circular subscription and light bulk model. And because modern living is noisy, we seek to eliminate that decision fatigue and supply-chain uncertainty by delivering a predictable and automated schedule.\n\nShopping with Lumë isn’t just about buying groceries; when you shop with us, you are reclaiming your time, supporting the local agri-food economy, and investing in a structured foundation that is built to nourish and support you—not just feed you."
  },
  {
    question: "Is there a cost to shop?",
    answer: "There is no membership fee to access Lumë Refillery. You simply browse, select and purchase light bulk options or your preferred subscription. We believe in a fair exchange and you can cancel your purchase within the allocated time window."
  },
  {
    question: "Can I shop without a subscription?",
    answer: "Absolutely! We offer light bulk retail purchases for those who prefer to shop on their own terms. Whether you choose to order as needed or lock-in a recurring subscription to automate your life, the quality and curation of our goods remain the same."
  },
  {
    question: "How long will my order take to arrive?",
    answer: "We operate on a \"Saturday Restock\" schedule. Orders placed and processed by our *indicated cutoff window are delivered to your door on scheduled Saturdays. This timing is intentional as it allows you to start your week with a perfectly stocked home.",
    note: { text: "Please refer to", linkText: "How it Works", linkHref: "#how-it-works", suffix: "for more details on our order and delivery schedule." }
  },
  {
    question: "Can I cancel my order after it is placed?",
    answer: "If you are on a subscription plan, you have a 7-day flexibility window following your automated reminder to modify or cancel your order. Once that window closes and your order has been locked in and moved into the batching phase, we are unable to cancel or refund the order as we have already commissioned the items from our small makers and suppliers.\n\nFor all one-time transactions, you have a 24-hour window to cancel or modify your order, that is, 24 hours from the time you have placed your order. Please ensure you have received an automated notice of cancel."
  },
  {
    question: "How do I place an order?",
    answer: "You can place your order directly through our website. Simply browse our curated hauls or light bulk packs, add your selections to your cart, input your delivery details and head to checkout. You’ll have the option to make it a one-time purchase or a recurring subscription."
  },
  {
    question: "Can I send a gift to someone?",
    answer: (
      <div className="space-y-4">
        <p>
          Absolutely! Lumë hauls make for a meaningful, high-value gift for someone who could use a little more stability in their life. During checkout, you can select the <strong className="font-semibold text-lume-accent">Gift this Haul</strong> option, provide the recipient’s delivery details, and include a <strong className="font-semibold text-lume-accent">personalized note</strong>.
        </p>
        <p>
          We’ll handle the curation and the Saturday delivery, ensuring your gift arrives as a complete, ready-to-use foundation for their wellness or a perfect birthday gesture.
        </p>
      </div>
    )
  }
];



interface FAQNote {
  text: string;
  linkText: string;
  linkHref: string;
  suffix: string;
}

const FAQItem: React.FC<{ question: string; answer: string | React.ReactNode; note?: FAQNote; index: number }> = ({ question, answer, note, index }) => {
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
        <div className="max-w-xl pb-8 text-[15px] leading-[1.8] text-text-secondary space-y-4">
          {typeof answer === 'string' ? (
            answer.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))
          ) : (
            answer
          )}
          {note && (
            <p className="text-[13px] italic text-text-secondary/70 mt-4 border-l-2 border-lume-accent/30 pl-4">
              {note.text}{' '}
              <a
                href={note.linkHref}
                className="font-semibold text-lume-accent underline decoration-wavy decoration-lume-accent/40 underline-offset-4 hover:decoration-lume-accent/80 transition-all duration-300"
              >
                {note.linkText}
              </a>
              {' '}{note.suffix}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="w-full relative bg-[#E4DECD] px-6 py-24 lg:px-16 lg:py-32 mt-12 mb-24">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] tracking-tight text-text-primary"
        >
          Frequently Asked
          <br />
          Questions.
        </motion.h2>

        <div className="mt-12 md:mt-16">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} note={(faq as any).note} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
