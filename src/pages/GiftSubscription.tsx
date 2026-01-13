import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Gift, Heart, User, Mail, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUBSCRIPTION_TIERS } from '../data/tiers';

const GiftSubscription: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'fortnightly'>('monthly');
  const [formData, setFormData] = useState({
    // Gift giver info
    giverName: '',
    giverEmail: '',
    
    // Recipient info
    recipientName: '',
    recipientEmail: '',
    recipientAddress: '',
    recipientCity: '',
    recipientState: '',
    recipientZip: '',
    
    // Gift details
    giftMessage: '',
    deliveryDate: '',
    duration: '3' // months
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTier) {
      alert('Please select a subscription tier');
      return;
    }

    const selectedTierData = SUBSCRIPTION_TIERS.find(tier => tier.id === selectedTier);
    if (!selectedTierData) return;

    const price = billingCycle === 'monthly' ? selectedTierData.price.monthly : selectedTierData.price.fortnightly;
    const totalPrice = price * parseInt(formData.duration);

    const checkoutData = {
      amount: totalPrice,
      currency: 'USD',
      description: `Gift: ${selectedTierData.name} - ${formData.duration} months`,
      billing_cycle: billingCycle,
      tier_id: selectedTier,
      tier_name: selectedTierData.name,
      duration: formData.duration,
      gift_data: {
        giver: {
          name: formData.giverName,
          email: formData.giverEmail
        },
        recipient: {
          name: formData.recipientName,
          email: formData.recipientEmail,
          address: {
            street: formData.recipientAddress,
            city: formData.recipientCity,
            state: formData.recipientState,
            zip: formData.recipientZip
          }
        },
        message: formData.giftMessage,
        delivery_date: formData.deliveryDate
      },
      // Use environment variables
      merchant_id: import.meta.env.VITE_WIIPAY_MERCHANT_ID,
      return_url: `${import.meta.env.VITE_APP_URL || window.location.origin}/gift-success`,
      cancel_url: `${import.meta.env.VITE_APP_URL || window.location.origin}/gift`,
      webhook_url: `${import.meta.env.VITE_APP_URL || window.location.origin}/api/webhook/wiipay-gift`
    };

    // WiiPay checkout redirect
    const wiipayCheckoutUrl = import.meta.env.VITE_WIIPAY_CHECKOUT_URL || 'https://checkout.wiipay.com/v1/checkout';
    
    // Create form and submit to WiiPay
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = wiipayCheckoutUrl;
    
    // Add form fields
    Object.entries(checkoutData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = typeof value === 'object' ? JSON.stringify(value) : value.toString();
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const selectedTierData = SUBSCRIPTION_TIERS.find(tier => tier.id === selectedTier);
  const totalPrice = selectedTierData ? 
    (billingCycle === 'monthly' ? selectedTierData.price.monthly : selectedTierData.price.fortnightly) * parseInt(formData.duration) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <div className="font-serif text-2xl font-bold text-stone-900">
              Lumë <span className="text-emerald-600">Refillery</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Simple Hero */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative"
            >
              <Gift className="w-8 h-8 text-emerald-600" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute -top-1 -right-1"
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              </motion.div>
            </motion.div>
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">
            Gift a Subscription
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Share fresh, sustainable groceries with someone special
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Package Selection */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8">Choose Package</h2>
            
            {/* Billing Toggle */}
            <div className="mb-8">
              <div className="inline-flex bg-stone-100 p-1 rounded-lg">
                <button
                  onClick={() => setBillingCycle('fortnightly')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'fortnightly'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600'
                  }`}
                >
                  Fortnightly
                </button>
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Simple Package List */}
            <div className="space-y-4">
              {SUBSCRIPTION_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTier === tier.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedTier === tier.id
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-stone-300'
                        }`}>
                          {selectedTier === tier.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <h3 className="font-serif font-semibold text-stone-900">{tier.name}</h3>
                      </div>
                      <p className="text-sm text-stone-600 mt-2 ml-8">{tier.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-stone-900">
                        ${(billingCycle === 'monthly' ? tier.price.monthly : tier.price.fortnightly).toFixed(2)}
                      </div>
                      <div className="text-sm text-stone-500">per {billingCycle}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Gift Form */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8">Gift Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Your Info */}
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Your Information</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="giverName"
                    placeholder="Your name"
                    value={formData.giverName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                  <input
                    type="email"
                    name="giverEmail"
                    placeholder="Your email"
                    value={formData.giverEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Recipient Info */}
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Recipient Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="recipientName"
                      placeholder="Recipient's name"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                    <input
                      type="email"
                      name="recipientEmail"
                      placeholder="Recipient's email"
                      value={formData.recipientEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="recipientAddress"
                    placeholder="Delivery address"
                    value={formData.recipientAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="recipientCity"
                      placeholder="City"
                      value={formData.recipientCity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                    <input
                      type="text"
                      name="recipientState"
                      placeholder="State"
                      value={formData.recipientState}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                    <input
                      type="text"
                      name="recipientZip"
                      placeholder="ZIP"
                      value={formData.recipientZip}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Gift Options */}
              <div>
                <h3 className="font-semibold text-stone-900 mb-4">Gift Options</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Duration</label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">First Delivery</label>
                      <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Personal Message</label>
                    <textarea
                      name="giftMessage"
                      placeholder="Write a personal message..."
                      value={formData.giftMessage}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              {selectedTierData && (
                <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                  <h3 className="font-semibold text-stone-900 mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span className="font-medium">{selectedTierData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{formData.duration} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing:</span>
                      <span className="font-medium">{billingCycle}</span>
                    </div>
                    <div className="border-t border-stone-300 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedTier}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  selectedTier
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                {selectedTier ? 'Complete Gift Purchase' : 'Please Select a Package'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftSubscription;