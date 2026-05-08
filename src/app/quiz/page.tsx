'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Users, Home, Utensils, Leaf, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';
import Footer from '@/components/Footer';

interface Question { id: string; question: string; options: { label: string; value: string; icon?: React.ReactNode; }[]; }

const questions: Question[] = [
  { id: 'household', question: 'How many people are in your household?', options: [{ label: '1-2 people', value: 'small', icon: <Users className="w-6 h-6" /> }, { label: '3-4 people', value: 'medium', icon: <Users className="w-6 h-6" /> }, { label: '5+ people', value: 'large', icon: <Users className="w-6 h-6" /> }] },
  { id: 'children', question: 'Do you have children at home?', options: [{ label: 'No children', value: 'none' }, { label: 'Yes, young children (under 12)', value: 'young' }, { label: 'Yes, teenagers', value: 'teens' }, { label: 'Yes, mixed ages', value: 'mixed' }] },
  { id: 'cooking', question: 'How often do you cook at home?', options: [{ label: 'A few times a week', value: 'occasional', icon: <Utensils className="w-6 h-6" /> }, { label: 'Almost every day', value: 'regular', icon: <Utensils className="w-6 h-6" /> }, { label: 'Every meal, every day', value: 'frequent', icon: <Utensils className="w-6 h-6" /> }] },
  { id: 'dietary', question: 'Any dietary preferences or restrictions?', options: [{ label: 'No restrictions', value: 'none' }, { label: 'Vegetarian/Plant-based', value: 'vegetarian' }, { label: 'Health-conscious/Low sugar', value: 'health' }, { label: 'Organic preferred', value: 'organic' }] },
  { id: 'staples', question: 'Which staples do you use most?', options: [{ label: 'Rice & grains', value: 'grains' }, { label: 'Flour & baking supplies', value: 'baking' }, { label: 'Pasta & sauces', value: 'pasta' }, { label: 'A mix of everything', value: 'mixed' }] },
  { id: 'preference', question: 'What matters most to you?', options: [{ label: 'Best value for money', value: 'value', icon: <Home className="w-6 h-6" /> }, { label: 'Quality & variety', value: 'quality', icon: <Leaf className="w-6 h-6" /> }, { label: 'Premium & specialty items', value: 'premium', icon: <Leaf className="w-6 h-6" /> }] },
  { id: 'frequency', question: 'How often would you like deliveries?', options: [{ label: 'Every 2 weeks (fortnightly)', value: 'fortnightly' }, { label: 'Once a month', value: 'monthly' }, { label: "I'm flexible", value: 'flexible' }] },
  { id: 'storage', question: 'How much pantry/storage space do you have?', options: [{ label: 'Limited - small kitchen', value: 'small' }, { label: 'Average - standard pantry', value: 'medium' }, { label: 'Plenty - large pantry or extra storage', value: 'large' }] },
  { id: 'budget', question: "What's your monthly grocery budget?", options: [{ label: 'Under $50/month', value: 'low' }, { label: '$50-$100/month', value: 'medium' }, { label: '$100-$150/month', value: 'high' }, { label: '$150+/month', value: 'premium' }] },
  { id: 'priority', question: "What's your top priority for a grocery subscription?", options: [{ label: 'Saving time on shopping', value: 'time' }, { label: 'Saving money', value: 'money' }, { label: 'Getting quality products', value: 'quality' }, { label: 'Supporting local & sustainable', value: 'sustainable' }] }
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'fortnightly' | 'monthly' | 'yearly'>('monthly');

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (currentStep < questions.length - 1) setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    else setTimeout(() => setShowResult(true), 300);
  };

  const getRecommendation = () => {
    const { household, cooking, dietary, preference, storage, budget, priority } = answers;
    let score = 0;
    if (household === 'small') score += 1; else if (household === 'medium') score += 2; else if (household === 'large') score += 4;
    if (cooking === 'regular') score += 1; else if (cooking === 'frequent') score += 2;
    if (dietary === 'organic') score += 3; else if (dietary === 'health') score += 1;
    if (preference === 'quality') score += 2; else if (preference === 'premium') score += 4;
    if (storage === 'small') score = Math.max(score - 1, 0); else if (storage === 'large') score += 1;
    if (priority === 'money') score = Math.max(score - 1, 0); else if (priority === 'quality') score += 2; else if (priority === 'sustainable') score += 1;
    if (budget === 'low') score = Math.min(score, 2); else if (budget === 'medium') score = Math.min(score, 4); else if (budget === 'high') score = Math.min(score, 6);
    if (score <= 1) return SUBSCRIPTION_TIERS.find(t => t.id === 'supported') || SUBSCRIPTION_TIERS[0];
    if (score <= 3) return SUBSCRIPTION_TIERS.find(t => t.id === 'essential') || SUBSCRIPTION_TIERS[1];
    if (score <= 5) return SUBSCRIPTION_TIERS.find(t => t.id === 'household') || SUBSCRIPTION_TIERS[2];
    if (score <= 7) return SUBSCRIPTION_TIERS.find(t => t.id === 'premium') || SUBSCRIPTION_TIERS[3];
    return SUBSCRIPTION_TIERS.find(t => t.id === 'gourmet') || SUBSCRIPTION_TIERS[4];
  };

  const recommendation = showResult ? getRecommendation() : null;

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">Lumë <span className="text-emerald-700 font-light">Refillery</span></Link>
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-16">
        {!showResult ? (
          <>
            <div className="mb-12">
              <div className="flex justify-between text-sm text-stone-500 mb-2"><span>Question {currentStep + 1} of {questions.length}</span><span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span></div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden"><motion.div className="h-full bg-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} /></div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-8 text-center">{questions[currentStep].question}</h1>
                <div className="space-y-4">
                  {questions[currentStep].options.map((option) => (
                    <button key={option.value} onClick={() => handleAnswer(questions[currentStep].id, option.value)}
                      className={`w-full p-6 rounded-2xl border-2 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50 ${answers[questions[currentStep].id] === option.value ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-white'}`}>
                      <div className="flex items-center gap-4">
                        {option.icon && <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">{option.icon}</div>}
                        <span className="text-lg font-medium text-stone-900">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            {currentStep > 0 && <button onClick={() => setCurrentStep(prev => prev - 1)} className="mt-8 text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Previous question</button>}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-emerald-600" /></div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">We recommend the {recommendation?.name}!</h1>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">{recommendation?.description}</p>
            <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-8">
              <div className="mb-6">
                <div className="inline-flex bg-stone-100 p-1.5 rounded-2xl shadow-inner">
                  {(['fortnightly', 'monthly', 'yearly'] as const).map(c => (
                    <button key={c} onClick={() => setSelectedBillingCycle(c)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative ${selectedBillingCycle === c ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                      {c === 'yearly' && <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">Save</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">${recommendation?.price[selectedBillingCycle].toFixed(2)}</div>
              <div className="text-stone-500 mb-6">per {selectedBillingCycle === 'yearly' ? 'year' : selectedBillingCycle === 'fortnightly' ? 'fortnight' : 'month'}</div>
              <ul className="text-left space-y-3 mb-6">
                {recommendation?.items.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-stone-600"><Check className="w-5 h-5 text-emerald-500" /><span>{item.quantity} {item.unit} {item.name}</span></li>
                ))}
                {(recommendation?.items.length || 0) > 5 && <li className="text-stone-400 ml-8">+ {(recommendation?.items.length || 0) - 5} more items</li>}
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" onClick={() => { setTimeout(() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-medium transition-colors">
                Subscribe Now <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => { setShowResult(false); setCurrentStep(0); setAnswers({}); setSelectedBillingCycle('monthly'); }}
                className="inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-900 px-8 py-4 rounded-full font-medium transition-colors">Retake Quiz</button>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </main>
  );
}
