'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Users,
  Utensils,
  Home as HomeIcon,
  Leaf,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Question {
  id: string;
  question: string;
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'household',
    question: 'How many people are in your household?',
    options: [
      { label: '1-2 people', value: 'small', icon: Users },
      { label: '3-4 people', value: 'medium', icon: Users },
      { label: '5+ people', value: 'large', icon: Users },
    ],
  },
  {
    id: 'children',
    question: 'Do you have children at home?',
    options: [
      { label: 'No children', value: 'none' },
      { label: 'Yes, young children (under 12)', value: 'young' },
      { label: 'Yes, teenagers', value: 'teens' },
      { label: 'Yes, mixed ages', value: 'mixed' },
    ],
  },
  {
    id: 'cooking',
    question: 'How often do you cook at home?',
    options: [
      { label: 'A few times a week', value: 'occasional', icon: Utensils },
      { label: 'Almost every day', value: 'regular', icon: Utensils },
      { label: 'Every meal, every day', value: 'frequent', icon: Utensils },
    ],
  },
  {
    id: 'dietary',
    question: 'Any dietary preferences or restrictions?',
    options: [
      { label: 'No restrictions', value: 'none' },
      { label: 'Vegetarian / plant-based', value: 'vegetarian' },
      { label: 'Health-conscious / low sugar', value: 'health' },
      { label: 'Organic preferred', value: 'organic' },
    ],
  },
  {
    id: 'staples',
    question: 'Which staples do you use most?',
    options: [
      { label: 'Rice & grains', value: 'grains' },
      { label: 'Flour & baking supplies', value: 'baking' },
      { label: 'Pasta & sauces', value: 'pasta' },
      { label: 'A mix of everything', value: 'mixed' },
    ],
  },
  {
    id: 'preference',
    question: 'What matters most to you?',
    options: [
      { label: 'Best value for money', value: 'value', icon: HomeIcon },
      { label: 'Quality & variety', value: 'quality', icon: Leaf },
      { label: 'Premium & specialty items', value: 'premium', icon: Sparkles },
    ],
  },
  {
    id: 'frequency',
    question: 'How often would you like deliveries?',
    options: [
      { label: 'Every 2 weeks', value: 'fortnightly' },
      { label: 'Once a month', value: 'monthly' },
      { label: "I'm flexible", value: 'flexible' },
    ],
  },
  {
    id: 'storage',
    question: 'How much pantry space do you have?',
    options: [
      { label: 'Limited — small kitchen', value: 'small' },
      { label: 'Average — standard pantry', value: 'medium' },
      { label: 'Plenty — large pantry or extra storage', value: 'large' },
    ],
  },
  {
    id: 'budget',
    question: "What's your monthly grocery budget?",
    options: [
      { label: 'Under $50/month', value: 'low' },
      { label: '$50–$100/month', value: 'medium' },
      { label: '$100–$150/month', value: 'high' },
      { label: '$150+/month', value: 'premium' },
    ],
  },
  {
    id: 'priority',
    question: "What's your top priority for a grocery subscription?",
    options: [
      { label: 'Saving time on shopping', value: 'time' },
      { label: 'Saving money', value: 'money' },
      { label: 'Getting quality products', value: 'quality' },
      { label: 'Supporting local & sustainable', value: 'sustainable' },
    ],
  },
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'fortnightly' | 'monthly' | 'yearly'>('monthly');

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep((s) => s + 1), 280);
    } else {
      setTimeout(() => setShowResult(true), 280);
    }
  };

  const getRecommendation = () => {
    const { household, cooking, dietary, preference, storage, budget, priority } = answers;
    let score = 0;
    if (household === 'small') score += 1;
    else if (household === 'medium') score += 2;
    else if (household === 'large') score += 4;
    if (cooking === 'regular') score += 1;
    else if (cooking === 'frequent') score += 2;
    if (dietary === 'organic') score += 3;
    else if (dietary === 'health') score += 1;
    if (preference === 'quality') score += 2;
    else if (preference === 'premium') score += 4;
    if (storage === 'small') score = Math.max(score - 1, 0);
    else if (storage === 'large') score += 1;
    if (priority === 'money') score = Math.max(score - 1, 0);
    else if (priority === 'quality') score += 2;
    else if (priority === 'sustainable') score += 1;
    if (budget === 'low') score = Math.min(score, 2);
    else if (budget === 'medium') score = Math.min(score, 4);
    else if (budget === 'high') score = Math.min(score, 6);
    if (score <= 1) return SUBSCRIPTION_TIERS.find((t) => t.id === 'supported') || SUBSCRIPTION_TIERS[0];
    if (score <= 3) return SUBSCRIPTION_TIERS.find((t) => t.id === 'essential') || SUBSCRIPTION_TIERS[1];
    if (score <= 5) return SUBSCRIPTION_TIERS.find((t) => t.id === 'household') || SUBSCRIPTION_TIERS[2];
    if (score <= 7) return SUBSCRIPTION_TIERS.find((t) => t.id === 'premium') || SUBSCRIPTION_TIERS[3];
    return SUBSCRIPTION_TIERS.find((t) => t.id === 'gourmet') || SUBSCRIPTION_TIERS[4];
  };

  const recommendation = showResult ? getRecommendation() : null;
  const progress = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);
  const q = QUESTIONS[currentStep];

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />

      <main className="pt-[72px]">
        <div className="mx-auto max-w-2xl px-6 py-12 lg:py-16">
          {!showResult ? (
            <>
              {/* Progress */}
              <div className="mb-12">
                <div className="mb-2 flex justify-between text-[12px] font-medium uppercase tracking-[0.08em] text-text-secondary">
                  <span>
                    Question {currentStep + 1} of {QUESTIONS.length}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-lume-accent"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <h1 className="text-center font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-normal leading-[1.2] tracking-snug text-text-primary">
                    {q.question}
                  </h1>

                  <div className="mt-10 space-y-3">
                    {q.options.map((option) => {
                      const Icon = option.icon;
                      const selected = answers[q.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleAnswer(q.id, option.value)}
                          className={`group flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                            selected
                              ? 'border-lume-accent bg-lume-accent/[0.06] shadow-card'
                              : 'border-black/[0.08] bg-white hover:border-lume-accent/40 hover:shadow-card'
                          }`}
                        >
                          {Icon && (
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                selected
                                  ? 'bg-lume-accent text-white'
                                  : 'bg-lume-accent/10 text-lume-accent'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                          )}
                          <span className="flex-1 text-[15px] font-medium text-text-primary">
                            {option.label}
                          </span>
                          <ArrowRight
                            className={`h-4 w-4 shrink-0 transition-all ${
                              selected
                                ? 'text-lume-accent'
                                : 'text-text-secondary/40 group-hover:translate-x-0.5 group-hover:text-text-secondary'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="mt-10 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.06em] text-text-secondary transition-colors hover:text-text-primary"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous question
                </button>
              )}
            </>
          ) : (
            // ── Result ──
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.56, ease: [0.22, 0.61, 0.36, 1] }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 18 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lume-accent/10"
              >
                <Check className="h-8 w-8 text-lume-accent" strokeWidth={2.25} />
              </motion.div>

              <span className="mt-6 inline-block text-[13px] font-semibold uppercase tracking-[0.15em] text-lume-accent">
                Your match
              </span>
              <h1 className="mt-3 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-normal leading-[1.15] tracking-snug text-text-primary">
                The {recommendation?.name}
              </h1>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-[1.7] text-text-secondary">
                {recommendation?.description}
              </p>

              {/* Pricing card */}
              <div className="mt-10 rounded-3xl bg-white p-8 shadow-card">
                {/* Billing toggle */}
                <div className="inline-flex rounded-pill bg-canvas p-1.5">
                  {(['fortnightly', 'monthly', 'yearly'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setBillingCycle(c)}
                      className={`relative rounded-pill px-5 py-2 text-[13px] font-semibold tracking-tight transition-all ${
                        billingCycle === c
                          ? 'bg-lume-accent text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {c[0].toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex items-baseline justify-center gap-2">
                  <span className="font-display text-[clamp(2.4rem,5vw,3.6rem)] font-normal leading-none tracking-tight text-text-primary">
                    ${recommendation?.price[billingCycle].toFixed(2)}
                  </span>
                  <span className="text-[14px] text-text-secondary">
                    /{' '}
                    {billingCycle === 'yearly'
                      ? 'year'
                      : billingCycle === 'fortnightly'
                        ? 'fortnight'
                        : 'month'}
                  </span>
                </div>

                <ul className="mt-8 space-y-3 text-left">
                  {recommendation?.items.slice(0, 5).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 text-[14px] text-text-secondary"
                    >
                      <Check className="h-4 w-4 shrink-0 text-lume-accent" strokeWidth={2.25} />
                      <span>
                        <span className="font-semibold text-text-primary">
                          {item.quantity} {item.unit}
                        </span>{' '}
                        {item.name}
                      </span>
                    </li>
                  ))}
                  {(recommendation?.items.length || 0) > 5 && (
                    <li className="ml-7 text-[13px] text-text-secondary/70">
                      + {(recommendation?.items.length || 0) - 5} more items
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="btn-pill group inline-flex items-center justify-center gap-2 bg-lume-house px-7 py-3.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black active:scale-[0.97]"
                >
                  Subscribe now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button
                  onClick={() => {
                    setShowResult(false);
                    setCurrentStep(0);
                    setAnswers({});
                    setBillingCycle('monthly');
                  }}
                  className="btn-pill inline-flex items-center justify-center gap-2 border border-black/[0.08] bg-white px-7 py-3.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-text-primary transition-all hover:bg-black/[0.04] active:scale-[0.97]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake quiz
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
