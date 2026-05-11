'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { calculateYearlySavings } from '@/utils/pricing';
import Header from '@/components/Header';

export default function GiftSubscriptionPage() {
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'fortnightly' | 'yearly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createGiftSubscription = useMutation(api.giftSubscriptions.createGiftSubscription);

  const [formData, setFormData] = useState({
    giverName: '',
    giverEmail: '',
    recipientName: '',
    recipientEmail: '',
    recipientAddress: '',
    recipientCity: '',
    recipientState: '',
    recipientZip: '',
    giftMessage: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) { alert('Please select a subscription tier'); return; }
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const selectedTierData = SUBSCRIPTION_TIERS.find(tier => tier.id === selectedTier);
      if (!selectedTierData) throw new Error('Selected tier not found');

      const price = billingCycle === 'monthly' ? selectedTierData.price.monthly :
                    billingCycle === 'fortnightly' ? selectedTierData.price.fortnightly :
                    selectedTierData.price.yearly;

      // 1. Create the gift subscription record in Convex (pending status)
      const giftSubscriptionId = await createGiftSubscription({
        giverName: formData.giverName,
        giverEmail: formData.giverEmail,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        recipientAddress: formData.recipientAddress,
        recipientCity: formData.recipientCity,
        recipientState: formData.recipientState,
        recipientZip: formData.recipientZip,
        tier: selectedTier,
        billingCycle: billingCycle,
        giftMessage: formData.giftMessage || undefined,
        amount: price,
      });

      // 2. Create a Stripe Checkout Session via server-side API
      const response = await fetch('/api/checkout/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: selectedTier,
          billingCycle,
          giftSubscriptionId: giftSubscriptionId,
          giverName: formData.giverName,
          giverEmail: formData.giverEmail,
          recipientName: formData.recipientName,
          recipientEmail: formData.recipientEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');

      // 3. Redirect to Stripe hosted checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating gift subscription:', error);
      alert('There was an error processing your gift subscription. Please try again.');
      setIsSubmitting(false);
    }
  };

  const selectedTierData = SUBSCRIPTION_TIERS.find(tier => tier.id === selectedTier);
  const totalPrice = selectedTierData ?
    (billingCycle === 'monthly' ? selectedTierData.price.monthly :
     billingCycle === 'fortnightly' ? selectedTierData.price.fortnightly :
     selectedTierData.price.yearly) : 0;

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Header />

      <div className="pt-[72px]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="relative">
                <Gift className="w-8 h-8 text-lume-accent" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="absolute -top-1 -right-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </motion.div>
              </motion.div>
            </div>
            <h1 className="text-4xl font-display font-normal text-text-primary mb-4">Gift a Subscription</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">Share fresh, sustainable groceries with someone special</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-display font-normal text-text-primary mb-8">Choose Package</h2>
            <div className="mb-8">
              <div className="inline-flex bg-canvas p-1.5 rounded-pill shadow-card">
                {(['fortnightly', 'monthly', 'yearly'] as const).map(cycle => (
                  <button key={cycle} onClick={() => setBillingCycle(cycle)}
                    className={`px-5 py-2.5 rounded-pill text-[13px] font-semibold tracking-tight transition-all cursor-pointer relative ${billingCycle === cycle ? 'bg-lume-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                    {cycle === 'yearly' && (
                      <motion.span className="absolute -top-3 -right-3 bg-lume-accent text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
                        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                        <Sparkles className="w-3 h-3" /> Save
                      </motion.span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {SUBSCRIPTION_TIERS.map((tier) => (
                <div key={tier.id} onClick={() => setSelectedTier(tier.id)}
                  className={`p-6 border-2 rounded-card cursor-pointer transition-all ${selectedTier === tier.id ? 'border-lume-accent bg-lume-accent/5' : 'border-black/[0.06] hover:border-black/15'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTier === tier.id ? 'border-lume-accent bg-lume-accent' : 'border-black/20'}`}>
                          {selectedTier === tier.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <h3 className="font-display font-normal text-text-primary text-[17px]">{tier.name}</h3>
                      </div>
                      <p className="text-[13px] text-text-secondary mt-2 ml-8">{tier.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold tracking-tight text-text-primary">${tier.price[billingCycle].toFixed(2)}</div>
                      <div className="text-[12px] text-text-secondary">per {billingCycle === 'yearly' ? 'year' : billingCycle}</div>
                      {billingCycle === 'yearly' && <div className="text-[12px] text-lume-accent font-medium mt-1">Save ${calculateYearlySavings(tier)}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display font-normal text-text-primary mb-8">Gift Details</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="font-semibold text-text-primary mb-4 text-[14px]">Your Information</h3>
                <div className="space-y-4">
                  <input type="text" name="giverName" placeholder="Your name" value={formData.giverName} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-black/[0.1] rounded-card bg-white text-text-primary focus:ring-2 focus:ring-lume-accent/40 focus:border-lume-accent transition-all" required />
                  <input type="email" name="giverEmail" placeholder="Your email" value={formData.giverEmail} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-black/[0.1] rounded-card bg-white text-text-primary focus:ring-2 focus:ring-lume-accent/40 focus:border-lume-accent transition-all" required />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-4 text-[14px]">Recipient Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="recipientName" placeholder="Recipient's name" value={formData.recipientName} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-black/[0.1] rounded-card bg-white text-text-primary focus:ring-2 focus:ring-lume-accent/40 focus:border-lume-accent transition-all" required />
                    <input type="email" name="recipientEmail" placeholder="Recipient's email" value={formData.recipientEmail} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-black/[0.1] rounded-card bg-white text-text-primary focus:ring-2 focus:ring-lume-accent/40 focus:border-lume-accent transition-all" required />
                  </div>
                  <input type="text" name="recipientAddress" placeholder="Delivery address" value={formData.recipientAddress} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-black/[0.1] rounded-card bg-white text-text-primary focus:ring-2 focus:ring-lume-accent/40 focus:border-lume-accent transition-all" required />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" name="recipientCity" placeholder="City" value={formData.recipientCity} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-black/[0.1] rounded-card bg-white text-text-primary focus:ring-2 focus:ring-lume-accent/40 focus:border-lume-accent transition-all" required />
                    <input type="text" name="recipientState" placeholder="State" value={formData.recipientState} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-black/[0.1] rounded-card bg-white text-text-primary focus:ring-2 focus:ring-lume-accent/40 focus:border-lume-accent transition-all" required />
                    <input type="text" name="recipientZip" placeholder="ZIP" value={formData.recipientZip} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-black/[0.1] rounded-card bg-white text-text-primary focus:ring-2 focus:ring-lume-accent/40 focus:border-lume-accent transition-all" required />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-4 text-[14px]">Personal Message</h3>
                <textarea name="giftMessage" placeholder="Write a personal message..." value={formData.giftMessage} onChange={handleInputChange}
                  rows={4} className="w-full px-4 py-3 border border-black/[0.1] rounded-card bg-white text-text-primary focus:ring-2 focus:ring-lume-accent/40 focus:border-lume-accent resize-none transition-all" />
              </div>
              {selectedTierData && (
                <div className="bg-canvas p-6 rounded-card border border-black/[0.06]">
                  <h3 className="font-semibold text-text-primary mb-4 text-[14px]">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-text-secondary">Package:</span><span className="font-medium text-text-primary">{selectedTierData.name}</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Billing:</span><span className="font-medium text-text-primary capitalize">{billingCycle === 'yearly' ? 'Yearly' : billingCycle}</span></div>
                    <div className="border-t border-black/[0.06] pt-2 mt-2">
                      <div className="flex justify-between text-lg font-semibold"><span>Total:</span><span>${totalPrice.toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>
              )}
              <button type="submit" disabled={!selectedTier || isSubmitting}
                className={`btn-pill w-full py-4 px-6 font-semibold text-lg transition-all ${selectedTier && !isSubmitting ? 'bg-lume-accent hover:bg-lume-green text-white cursor-pointer' : 'bg-black/10 text-text-secondary cursor-not-allowed'}`}>
                {isSubmitting ? 'Processing...' : selectedTier ? 'Complete Gift Purchase' : 'Please Select a Package'}
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
