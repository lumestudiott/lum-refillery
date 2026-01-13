import React from 'react';
import { Check, AlertCircle, Package } from 'lucide-react';
import { SubscriptionTier } from '../types/subscription';
import { motion } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';

interface TierCardProps {
  tier: SubscriptionTier;
  billingCycle: 'fortnightly' | 'monthly' | 'yearly';
  index?: number;
}

const TierCard: React.FC<TierCardProps> = ({ tier, billingCycle, index = 0 }) => {
  const price = tier.price[billingCycle];
  const { isSignedIn, user } = useUser();
  
  // Different button text for each tier
  const getButtonText = (tierId: string) => {
    switch (tierId) {
      case 'supported':
        return 'Get Support';
      case 'essential':
        return 'Start Essential';
      case 'household':
        return 'Choose Family';
      case 'premium':
        return 'Go Premium';
      case 'gourmet':
        return 'Taste Gourmet';
      case 'bulk':
        return 'Order Bulk';
      default:
        return 'Subscribe Now';
    }
  };

  // Handle WiiPay checkout
  const handleWiiPayCheckout = () => {
    const checkoutData = {
      amount: price,
      currency: 'USD',
      description: `${tier.name} - ${billingCycle} subscription`,
      billing_cycle: billingCycle,
      tier_id: tier.id,
      tier_name: tier.name,
      customer_email: user?.emailAddresses[0]?.emailAddress || '',
      customer_name: user?.fullName || '',
      items: tier.items,
      merchant_id: import.meta.env.VITE_WIIPAY_MERCHANT_ID,
      return_url: `${import.meta.env.VITE_APP_URL || window.location.origin}/success`,
      cancel_url: `${import.meta.env.VITE_APP_URL || window.location.origin}/cancel`,
      webhook_url: `${import.meta.env.VITE_APP_URL || window.location.origin}/api/webhook/wiipay`
    };

    // WiiPay checkout redirect
    const wiipayCheckoutUrl = import.meta.env.VITE_WIIPAY_CHECKOUT_URL || 'https://checkout.wiipay.com/v1/checkout';
    
    // Create form and submit to WiiPay
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = wiipayCheckoutUrl;
    
    Object.entries(checkoutData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = typeof value === 'object' ? JSON.stringify(value) : value?.toString() || '';
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const buttonClasses = "w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full transition-all hover:shadow-xl hover:-translate-y-1 duration-300 group"
    >
      <div className="p-6 border-b border-stone-100 bg-white group-hover:bg-stone-50/50 transition-colors">
        <h3 className="text-xl font-serif font-medium text-stone-900 mb-2">{tier.name}</h3>
        <p className="text-stone-500 text-sm mb-4 min-h-[40px]">{tier.description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-stone-900">${price.toFixed(2)}</span>
          <span className="text-stone-500 text-sm">/ {billingCycle === 'yearly' ? 'year' : billingCycle}</span>
        </div>
      </div>
      
      <div className="p-4 flex-grow bg-stone-50/30 flex flex-col">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-stone-900">
          <Package className="w-4 h-4 text-emerald-600" />
          <span>What's inside:</span>
        </div>
        <ul className="space-y-2 mb-4 flex-grow">
          {tier.items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 text-sm text-stone-600">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>
                <span className="font-medium text-stone-900">{item.quantity} {item.unit}</span> {item.name}
              </span>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto">
          <div className="flex items-start gap-2 text-xs text-stone-500 bg-white p-3 rounded-lg border border-stone-100 mb-3">
            <AlertCircle className="w-3 h-3 mt-0.5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-medium text-stone-700 block mb-1">Substitution Policy:</span>
              {tier.substitutionPolicy.rule}
            </div>
          </div>
          
          {isSignedIn ? (
            <button
              onClick={handleWiiPayCheckout}
              className={buttonClasses}
            >
              <div className="relative flex items-center justify-center gap-2">
                <span>{getButtonText(tier.id)}</span>
                <span>→</span>
              </div>
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className={buttonClasses}>
                <div className="relative flex items-center justify-center gap-2">
                  <span>{getButtonText(tier.id)}</span>
                  <span>→</span>
                </div>
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TierCard;
