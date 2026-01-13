import React from 'react';
import { Link } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SUBSCRIPTION_TIERS } from '../data/tiers';
import { motion } from 'framer-motion';
import { 
  Package, Calendar, CreditCard, Settings, 
  Pause, Play, X, Check, Clock,
  Truck, AlertCircle, LogOut, Mail, User
} from 'lucide-react';
import Footer from './Footer';

const UserDashboard: React.FC = () => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const userData = useQuery(api.users.getUserByClerkId, 
    user ? { clerkId: user.id } : "skip"
  );
  const subscriptions = useQuery(api.subscriptions.getMySubscriptions);
  
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
                      activeSubscription.frequency === 'monthly' ? 30 : 365;
    
    let nextDelivery = new Date(startDate);
    while (nextDelivery < now) {
      nextDelivery.setDate(nextDelivery.getDate() + frequency);
    }
    return nextDelivery;
  };

  const nextDelivery = getNextDeliveryDate();

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">
            Lumë <span className="text-emerald-700 font-light">Refillery</span>
          </Link>
          <Link to="/" className="text-stone-600 hover:text-stone-900 transition-colors text-sm">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
            Welcome back, {user.firstName || 'there'}!
          </h1>
          <p className="text-stone-600">Manage your subscription and account settings</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Subscription Card */}
            {activeSubscription && tierInfo ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
              >
                <div className="p-6 border-b border-stone-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-semibold text-stone-900">Your Subscription</h2>
                      </div>
                      <p className="text-stone-600">{tierInfo.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeSubscription.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700'
                        : activeSubscription.status === 'paused'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {activeSubscription.status.charAt(0).toUpperCase() + activeSubscription.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid sm:grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-stone-500 mb-1">Plan</div>
                      <div className="font-semibold text-stone-900">{tierInfo.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-500 mb-1">Billing</div>
                      <div className="font-semibold text-stone-900 capitalize">{activeSubscription.frequency}</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-500 mb-1">Price</div>
                      <div className="font-semibold text-stone-900">
                        ${(Number(tierInfo.price[activeSubscription.frequency as keyof typeof tierInfo.price]) || tierInfo.price.monthly).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Next Delivery */}
                  {activeSubscription.status === 'active' && nextDelivery && (
                    <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Truck className="w-8 h-8 text-emerald-600" />
                        <div>
                          <div className="text-sm text-emerald-700">Next Delivery</div>
                          <div className="font-semibold text-emerald-900">
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

                  {activeSubscription.status === 'paused' && (
                    <div className="bg-amber-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-amber-600" />
                        <div>
                          <div className="font-semibold text-amber-900">Subscription Paused</div>
                          <div className="text-sm text-amber-700">Resume anytime to continue deliveries</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* What's Included */}
                  <div className="mb-6">
                    <h3 className="font-medium text-stone-900 mb-3">What's in your haul:</h3>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {tierInfo.items.slice(0, 6).map((item) => (
                        <li key={item.id} className="flex items-center gap-2 text-sm text-stone-600">
                          <Check className="w-4 h-4 text-emerald-500" />
                          {item.quantity} {item.unit} {item.name}
                        </li>
                      ))}
                      {tierInfo.items.length > 6 && (
                        <li className="text-sm text-stone-400">
                          + {tierInfo.items.length - 6} more items
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {activeSubscription.status === 'active' ? (
                      <button
                        onClick={() => pauseSubscription({ subscriptionId: activeSubscription._id })}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        Pause Subscription
                      </button>
                    ) : activeSubscription.status === 'paused' ? (
                      <button
                        onClick={() => resumeSubscription({ subscriptionId: activeSubscription._id })}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Resume Subscription
                      </button>
                    ) : null}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel your subscription?')) {
                          cancelSubscription({ subscriptionId: activeSubscription._id });
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
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
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 p-8 text-center"
              >
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-stone-900 mb-2">No Active Subscription</h2>
                <p className="text-stone-600 mb-6">Start your grocery subscription today and get fresh staples delivered to your door.</p>
                <Link
                  to="/sample-hauls"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Browse Plans
                </Link>
              </motion.div>
            )}

            {/* Order History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-stone-200 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-stone-900">Order History</h2>
              </div>
              
              {subscriptions && subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((sub) => {
                    const tier = SUBSCRIPTION_TIERS.find(t => t.id === sub.tier);
                    return (
                      <div key={sub._id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                          <div className="font-medium text-stone-900">{tier?.name || sub.tier}</div>
                          <div className="text-sm text-stone-500">
                            Started {new Date(sub.startDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          sub.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                          'bg-stone-100 text-stone-600'
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
                <Link to="/sample-hauls" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 hover:text-stone-900">
                  <Package className="w-5 h-5" />
                  Browse Plans
                </Link>
                <Link to="/quiz" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 hover:text-stone-900">
                  <Calendar className="w-5 h-5" />
                  Take the Quiz
                </Link>
                <Link to="/gift" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 hover:text-stone-900">
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