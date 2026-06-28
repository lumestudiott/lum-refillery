'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';

/* ────────────────────────────────────────────────
   FAQ Data — organised by section
   ──────────────────────────────────────────────── */

interface FAQNote {
  text: string;
  linkText: string;
  linkHref: string;
  suffix: string;
}

interface FAQEntry {
  question: string;
  answer: string | React.ReactNode;
  note?: FAQNote;
}

interface FAQSection {
  title: string;
  items: FAQEntry[];
}

const faqSections: FAQSection[] = [
  {
    title: 'About Lumë',
    items: [
      {
        question: 'Why shop at Lumë Refillery?',
        answer:
          'Lumë Refillery is an innovative grocery ecosystem designed to change how we provision our homes. We curate everyday essentials based on strict standards of quality, nutrition, and environmental stewardship. By partnering with local farmers, large distributors and emerging ethical producers, we are designing a more transparent and less wasteful regional food system.\n\nFrom nutrient-dense staples to home goods and personal care items, our service delivers everything you need in a seamless, circular subscription and light bulk model. And because modern living is noisy, we seek to eliminate that decision fatigue and supply-chain uncertainty.\n\nShopping with Lumë isn\'t just about buying groceries; when you shop with us, you are reclaiming your time, supporting the local agri-food economy, and investing in a structured foundation that is built to nourish you—not just feed you.',
      },
      {
        question:
          'How is it different from a traditional/standard brick and mortar grocery store?',
        answer:
          'A traditional grocery store is designed to provide variety and a physical destination for those moments when you need to get out of the house. We don\'t aim to compete with that experience; we are here to provide stability where it matters most—fueling your body.\n\nLumë is just different. We are a curated system, not a marketplace. Just like you, the creators of Lumë have experienced the decision fatigue that hits when it\'s time to shop: the unpredictable budgets and the draining 2–3 hour grocery runs. Sometimes, we all want someone else to do that heavy lifting for us.\n\nInstead of navigating multiple aisles, procuring transport, or managing the chaos of a public errand, our service gives you the benefit of a precision-based routine that arrives on your schedule. We replace the reactive, time-consuming trip to the store with a proactive, automated restock of high-quality, small-batch goods. We don\'t just sell you food; we steward your inventory, ensuring that the foundations of your daily ritual are always in place without you ever missing a beat.',
      },
    ],
  },
  {
    title: 'Shopping & Pricing',
    items: [
      {
        question: 'Is there a cost to shop?',
        answer:
          'There is no membership fee to access Lumë Refillery. You simply browse, select and purchase light bulk options or your preferred subscription. We believe in a fair exchange and you can cancel your purchase within the allocated time window.',
      },
      {
        question: 'What are the benefits of your light bulk and grocery subscription model?',
        answer:
          'The primary benefit is the restoration of your time and mental clarity. By automating your basic restocks and offering weekly budget friendly light-bulk options, we remove the "decision fatigue" of the weekly grocery run. You gain a predictable, precision-based routine that ensures your essentials are always in your fridge exactly when you need them. It is stability, delivered.\n\nIn other words — we act as stewards of a delivery system that saves you money, hours of time, and energy every month.',
      },
      {
        question: 'Can I shop without a subscription?',
        answer:
          'Absolutely! We offer light bulk retail purchases for those who prefer to shop on their own terms. Whether you choose to order as needed or lock-in a recurring subscription to automate your life, the quality and curation of our goods remain the same.',
      },
      {
        question: 'What if I have allergies?',
        answer: (
          <div className="space-y-4">
            <p>
              <strong className="font-semibold text-lume-accent">Your Safety Matters.</strong>{' '}
              Because we partner closely with a network of independent local small makers, we prioritize absolute transparency regarding all ingredients and{' '}
              <a
                href="/sourcing-standards"
                className="font-medium text-lume-accent underline decoration-lume-accent/40 underline-offset-4 transition-all duration-300 hover:decoration-lume-accent"
              >
                sourcing standards
              </a>
              . If you manage a severe food allergy or sensitivity, please contact us before placing your order. We will gladly provide you with the exact details of the maker&apos;s production environment so you have the transparent data needed to ensure it safely meets your household requirements.
            </p>
            <p className="text-[13px] italic text-text-secondary/70 border-l-2 border-lume-accent/30 pl-4">
              You can only substitute select products. Please review hauls carefully prior to making a commitment. If there is an oversight on the substitution of an item, simply inform us and we will work towards making our hauls more inclusive and accommodating.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: 'Orders & Delivery',
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'You can place your order directly through our website. Simply browse our curated hauls or light bulk packs, add your selections to your cart, input your delivery details and head to checkout. You\'ll have the option to make it a one-time purchase or a recurring subscription.',
      },
      {
        question: 'How long will my order take to arrive?',
        answer:
          'We operate on a "Saturday Restock" schedule. Orders placed and processed by our *indicated cutoff window are delivered to your door on scheduled Saturdays. This timing is intentional as it allows you to start your week with a perfectly stocked home.',
        note: {
          text: 'Please refer to',
          linkText: 'How it Works',
          linkHref: '/#how-it-works',
          suffix: 'for more details on our order and delivery schedule.',
        },
      },
      {
        question: 'When will my one-time order arrive?',
        answer:
          'Because we prioritize fresh, small-batch quality, we do not hold standing inventory. Every order is procured and packed specifically for you. To ensure your items are as fresh as possible, our order window closes every *Tuesday at midnight. Orders placed before this cutoff will be delivered that Saturday; orders placed after Tuesday midnight will be scheduled for delivery on the following Saturday. This ensures your haul is never sitting in a warehouse, but arriving straight from our makers to your door.',
      },
      {
        question: 'Can I cancel my order after it is placed?',
        answer:
          'If you are on a subscription plan, you have a 7-day flexibility window following your automated reminder to modify or cancel your order. Once that window closes and your order has been locked in and moved into the batching phase, we are unable to cancel or refund the order as we have already commissioned the items from our small makers and suppliers.\n\nFor all one-time transactions, you have a 24-hour window to cancel or modify your order, that is, 24 hours from the time you have placed your order. Please ensure you have received an automated notice of cancel.',
      },
      {
        question: 'Do you substitute items automatically?',
        answer:
          'Never without your consent. We value transparency. If an item in your subscription becomes unavailable, we will reach out to you immediately to offer a suitable replacement. We will never swap your items without notifying you first.\n\nAdditionally, unless you choose to update your order, your recurring subscription will remain exactly as you initially configured it. You always have the option to make any modifications to your current order the new standard for all future recurring subscriptions.',
      },
    ],
  },
  {
    title: 'Gifting & Community',
    items: [
      {
        question: 'What is your Birthday Club about?',
        answer:
          'Our Birthday Club is a way to mark your milestones with a system that celebrates you. When you sign up, you gain access to "The Birthday Box", a curated, elevated haul designed to make your special day effortless and memorable. It is our way of ensuring that even on your personal day, your foundations remain solid while you take the time to celebrate.',
      },
      {
        question: 'Can I send a gift to someone?',
        answer: (
          <div className="space-y-4">
            <p>
              Absolutely! Lumë hauls make for a meaningful, high-value gift for
              someone who could use a little more stability in their life. During
              checkout, you can select the{' '}
              <strong className="font-semibold text-lume-accent">
                Gift this Haul
              </strong>{' '}
              option, provide the recipient&apos;s delivery details, and include a{' '}
              <strong className="font-semibold text-lume-accent">
                personalized note
              </strong>
              .
            </p>
            <p>
              We&apos;ll handle the curation and the Saturday delivery, ensuring your
              gift arrives as a complete, ready-to-use foundation for their
              wellness or a perfect birthday gesture.
            </p>
          </div>
        ),
      },
      {
        question: 'Will I receive spam from Lumë?',
        answer:
          'Absolutely not. We believe that a high-value service should respect your time and your inbox. We do not spam. Our communications are strictly limited to the necessary updates regarding your orders and your chosen subscription schedule. You will only receive alerts if you have explicitly opted in to receive them.',
      },
    ],
  },
];

/* ────────────────────────────────────────────────
   Accordion item
   ──────────────────────────────────────────────── */

const FAQItem: React.FC<{
  entry: FAQEntry;
  index: number;
}> = ({ entry, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      className="border-b border-black/[0.06]"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full cursor-pointer items-center justify-between py-6 text-left focus:outline-none"
      >
        <span className="max-w-[88%] text-[clamp(0.95rem,1.4vw,1.05rem)] font-medium tracking-tight text-text-primary/80 transition-colors duration-300 group-hover:text-text-primary">
          {entry.question}
        </span>
        <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-black/[0.08] text-text-primary/30 transition-all duration-300 group-hover:border-lume-accent/40 group-hover:text-lume-accent">
          {isOpen ? (
            <Minus className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="max-w-2xl pb-8 text-[15px] leading-[1.8] text-text-secondary space-y-4">
          {typeof entry.answer === 'string'
            ? entry.answer.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))
            : entry.answer}
          {entry.note && (
            <p className="text-[13px] italic text-text-secondary/70 mt-4 border-l-2 border-lume-accent/30 pl-4">
              {entry.note.text}{' '}
              <a
                href={entry.note.linkHref}
                className="font-semibold text-lume-accent underline decoration-wavy decoration-lume-accent/40 underline-offset-4 hover:decoration-lume-accent/80 transition-all duration-300"
              >
                {entry.note.linkText}
              </a>{' '}
              {entry.note.suffix}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ────────────────────────────────────────────────
   Full FAQ page
   ──────────────────────────────────────────────── */

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="pt-[116px] relative z-10">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b border-black/[0.04]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div
              className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-[0.2] blur-[100px]"
              style={{
                background:
                  'radial-gradient(circle, var(--color-lume-accent) 0%, transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24 text-center">
            <Reveal duration={560}>
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-lume-accent">
                Support
              </span>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4rem)] font-normal leading-[1.05] tracking-tight text-text-primary">
                Frequently Asked Questions
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-[16px] leading-[1.7] text-text-secondary">
                Everything you need to know about shopping with Lumë Refillery. From how
                we source, to how we deliver and celebrate!
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ sections ── */}
        <section className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="space-y-16">
            {faqSections.map((section, sectionIdx) => (
              <Reveal key={section.title} duration={560} delay={sectionIdx * 60}>
                <div>
                  {/* Section heading */}
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-lume-accent">
                      {section.title}
                    </h2>
                    <div className="flex-1 h-px bg-lume-accent/15" />
                  </div>

                  {/* Items */}
                  <div>
                    {section.items.map((entry, itemIdx) => (
                      <FAQItem
                        key={itemIdx}
                        entry={entry}
                        index={itemIdx}
                      />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* ── Still have questions? ── */}
          <Reveal duration={560} delay={100}>
            <div className="mt-20 rounded-[32px] border border-white/60 bg-white/50 backdrop-blur-xl p-12 text-center shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
              <h3 className="font-display text-[clamp(1.4rem,2.5vw,1.8rem)] font-normal tracking-tight text-text-primary">
                Still have a question?
              </h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-text-secondary">
                We&apos;re always happy to help. Reach out and we&apos;ll get back to you
                as soon as possible.
              </p>
              <a
                href="mailto:lumestudiott@gmail.com"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-lume-house px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-white transition-all duration-300 hover:bg-black active:scale-[0.97]"
              >
                Contact Us
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
