'use client';
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Gift, CheckCircle, ArrowRight, Home, Package } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { SUBSCRIPTION_TIERS } from '@/data/tiers';

function GiftSuccessContent() {
  const searchParams = useSearchParams();
  const giftId = searchParams.get('gift_id');
  const giftSubscription = useQuery(api.giftSubscriptions.getGiftSubscriptionById, giftId ? { id: giftId as Id<"giftSubscriptions"> } : "skip");
  const tierInfo = giftSubscription ? SUBSCRIPTION_TIERS.find(tier => tier.id === giftSubscription.tier) : null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-white rounded-2xl shadow-lg p-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Gift className="w-8 h-8 text-emerald-600" />
            <CheckCircle className="w-5 h-5 text-emerald-600 absolute -top-1 -right-1 bg-white rounded-full" />
          </motion.div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">Gift Sent Successfully!</h1>
          <p className="text-stone-600 mb-8">Your gift subscription has been purchased! The recipient will receive an email with their gift details and delivery information.</p>
          {giftSubscription && tierInfo && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-stone-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-emerald-600" /> Gift Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-stone-600">Package:</span><span className="font-medium text-stone-900">{tierInfo.name}</span></div>
                <div className="flex justify-between"><span className="text-stone-600">Billing:</span><span className="font-medium text-stone-900 capitalize">{giftSubscription.billingCycle === 'yearly' ? 'Yearly' : giftSubscription.billingCycle}</span></div>
                <div className="flex justify-between"><span className="text-stone-600">Recipient:</span><span className="font-medium text-stone-900">{giftSubscription.recipientName}</span></div>
                <div className="flex justify-between"><span className="text-stone-600">Amount:</span><span className="font-medium text-emerald-600">${giftSubscription.amount.toFixed(2)}</span></div>
                {giftSubscription.giftMessage && (
                  <div className="pt-3 border-t border-stone-200"><span className="text-stone-600 text-xs">Your Message:</span><p className="text-stone-900 text-sm mt-1 italic">&quot;{giftSubscription.giftMessage}&quot;</p></div>
                )}
              </div>
            </motion.div>
          )}
          <div className="space-y-3">
            <Link href="/gift" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group">
              <Gift className="w-4 h-4" /> Send Another Gift <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/" className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function GiftSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">Loading...</div>}>
      <GiftSuccessContent />
    </Suspense>
  );
}
