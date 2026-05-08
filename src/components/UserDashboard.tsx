'use client';

import React from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SUBSCRIPTION_TIERS } from '../data/tiers';
import { motion } from 'framer-motion';
import { 
  Package, Calendar, CreditCard, Settings, 
  Pause, Play, X, Check, Clock,
  Truck, AlertCircle, LogOut, Mail, User, Gift
} from 'lucide-react';
import Footer from './Footer';

const UserDashboard: React.FC = () => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const subscriptions = useQuery(api.subscriptions.getMySubscriptions);
  const sentGifts = useQuery(
    api.giftSubscriptions.getGiftSubscriptionsByGiver,
    user ? { giverEmail: user.emailAddresses[0]?.emailAddress || '' } : "skip"
  );
  const receivedGifts = useQuery(
    api.giftSubscriptions.getGiftSubscriptionsByRecipient,
    user ? { recipientEmail: user.emailAddresses[0]?.emailAddress || '' } : "skip"
  );
  
  const pauseSubscription = useMutation(api.subscriptions.pauseSubscription);
  const resumeSubscription = useMutation(api.subscriptions.resumeSubscription);
  const cancelSubscription = useMutation(api.subscriptions.cancelSubscription);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const activeSubscription = subscriptions?.find(s => s.status === 'active' || s.status === 'paused');
  const tierInfo = activeSubscription 
    ? SUBSCRIPTION_TIERS.find(t => t.id === activeSubscription.tier)
    : null;

  const getNextDeliveryDate = () => {
    if (!activeSubscription) return null;
    const startDate = new Date(activeSubscription.startDate);
    const now = new Date();
    const frequency = activeSubscription.frequency === 'fortnightly' ? 14 : 
                      activeSubscription.frequency === 'monthly' ? 30 : 
                      activeSubscription.frequency === 'yearly' ? 365 : 30;
    
    let nextDelivery = new Date(startDate);
    while (nextDelivery < now) {
      if (activeSubscription.frequency === 'yearly') {
        nextDelivery.setFullYear(nextDelivery.getFullYear() + 1);
      } else {
        nextDelivery.setDate(nextDelivery.getDate() + frequency);
      }
    }
    return nextDelivery;
  };

  const nextDelivery = getNextDeliveryDate();

  return (
    <main className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-3xl font-bold tracking-tight text-stone-900">
            Lumë <span className="text-ocean-600 font-light">Refillery</span>
          </Link>
          <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-display font-bold text-stone-900 mb-4 tracking-tightest">
            Welcome back, {user.firstName || 'there'}!
          </h1>
          <p className="text-lg text-stone-600 font-medium">Manage your subscription and keep circular living easy.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Subscription Card */}
            {activeSubscription && tierInfo ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border-2 border-stone-900 shadow-quirky-float p-1"
              >
                <div className="p-6 border-b-2 border-stone-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-6 h-6 text-accent-orange" />
                        <h2 className="text-2xl font-display font-bold text-stone-900">Your Subscription</h2>
                      </div>
                      <p className="text-stone-600 font-medium">{tierInfo.name}</p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-accent-orange text-white">
                      {activeSubscription.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Next Delivery / Status */}
                  {activeSubscription.status === 'active' && nextDelivery && (
                    <div className="bg-sage-400/20 rounded-xl p-6 mb-8 border border-sage-500">
                      <div className="flex items-center gap-4">
                        <Truck className="w-10 h-10 text-ocean-700" />
                        <div>
                          <div className="text-sm font-bold text-ocean-700 uppercase tracking-widest">Next Delivery</div>
                          <div className="text-xl font-display font-bold text-stone-900">
                            {nextDelivery.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4">
                    {activeSubscription.status === 'active' ? (
                      <button
                        onClick={() => pauseSubscription({ subscriptionId: activeSubscription._id })}
                        className="flex items-center gap-2 px-6 py-3 bg-accent-orange text-white rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-quirky-float"
                      >
                        <Pause className="w-5 h-5" />
                        Pause Subscription
                      </button>
                    ) : null}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel?')) {
                          cancelSubscription({ subscriptionId: activeSubscription._id });
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-900 border-2 border-stone-900 rounded-lg font-bold hover:bg-stone-200 transition-all"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* No Subscription */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border-2 border-stone-900 p-12 text-center shadow-quirky-float"
              >
                <Package className="w-16 h-16 text-accent-orange mx-auto mb-6" />
                <h2 className="text-3xl font-display font-bold text-stone-900 mb-4">No Active Subscription</h2>
                <Link
                  href="/sample-hauls"
                  className="inline-flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-quirky-float"
                >
                  Browse Plans
                </Link>
              </motion.div>
            )}
...

            {/* Order History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-cream-200 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-ocean-600" />
                <h2 className="text-xl font-semibold text-stone-900">Order History</h2>
              </div>
              
              {subscriptions && subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((sub) => {
                    const tier = SUBSCRIPTION_TIERS.find(t => t.id === sub.tier);
                    return (
                      <div key={sub._id} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                        <div>
                          <div className="font-medium text-stone-900">{tier?.name || sub.tier}</div>
                          <div className="text-sm text-stone-500">
                            Started {new Date(sub.startDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sub.status === 'active' ? 'bg-sage-400/20 text-ocean-700' :
                          sub.status === 'paused' ? 'bg-accent-yellow/20 text-stone-900' :
                          'bg-cream-200 text-stone-600'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-stone-500 text-center py-8">No orders yet</p>
              )}
            </motion.div>

            {/* Gift Subscriptions */}
            {(sentGifts && sentGifts.length > 0) || (receivedGifts && receivedGifts.length > 0) ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-stone-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-stone-900">Gift Subscriptions</h2>
                </div>
                
                {/* Sent Gifts */}
                {sentGifts && sentGifts.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-stone-900 mb-3">Gifts You've Sent</h3>
                    <div className="space-y-3">
                      {sentGifts.map((gift) => {
                        const tier = SUBSCRIPTION_TIERS.find(t => t.id === gift.tier);
                        return (
                          <div key={gift._id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                            <div>
                              <div className="font-medium text-stone-900">
                                {tier?.name || gift.tier} for {gift.recipientName}
                              </div>
                              <div className="text-sm text-stone-500">
                                {new Date(gift.createdAt).toLocaleDateString()} • ${gift.amount.toFixed(2)}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              gift.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                              gift.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {gift.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Received Gifts */}
                {receivedGifts && receivedGifts.length > 0 && (
                  <div>
                    <h3 className="font-medium text-stone-900 mb-3">Gifts You've Received</h3>
                    <div className="space-y-3">
                      {receivedGifts.map((gift) => {
                        const tier = SUBSCRIPTION_TIERS.find(t => t.id === gift.tier);
                        return (
                          <div key={gift._id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                            <div>
                              <div className="font-medium text-stone-900">
                                {tier?.name || gift.tier} from {gift.giverName}
                              </div>
                              <div className="text-sm text-stone-500">
                                {new Date(gift.createdAt).toLocaleDateString()}
                                {gift.giftMessage && (
                                  <span className="block italic mt-1">"{gift.giftMessage}"</span>
                                )}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              gift.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                              gift.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {gift.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-stone-200 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-stone-900">Account</h2>
              </div>
              
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-100">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-stone-900">{user.fullName || 'User'}</div>
                  <div className="text-sm text-stone-500">{user.emailAddresses[0]?.emailAddress}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => openUserProfile()}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 hover:text-stone-900 text-left"
                >
                  <Mail className="w-5 h-5" />
                  Edit Profile
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-stone-600 hover:text-red-600 text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-stone-200 p-6"
            >
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link href="/sample-hauls" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 hover:text-stone-900">
                  <Package className="w-5 h-5" />
                  Browse Plans
                </Link>
                <Link href="/quiz" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 hover:text-stone-900">
                  <Calendar className="w-5 h-5" />
                  Take the Quiz
                </Link>
                <Link href="/gift" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 hover:text-stone-900">
                  <CreditCard className="w-5 h-5" />
                  Gift a Subscription
                </Link>
              </div>
            </motion.div>

            {/* Need Help */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-emerald-50 rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-stone-900 mb-2">Need Help?</h2>
              <p className="text-stone-600 text-sm mb-4">
                Have questions about your subscription or delivery?
              </p>
              <a 
                href="mailto:lumestudiott@gmail.com"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                Contact Support →
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default UserDashboard;