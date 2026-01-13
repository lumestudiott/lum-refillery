import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Truck, Shield, Clock, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { SUBSCRIPTION_TIERS } from '../data/tiers';
import { useUser, SignInButton } from '@clerk/clerk-react';
import Footer from '../components/Footer';

const SampleHauls: React.FC = () => {
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const { isSignedIn, user } = useUser();

  const filteredTiers = SUBSCRIPTION_TIERS.filter(tier => {
    if (priceRange === 'all') return true;
    if (priceRange === 'under50') return tier.price.monthly < 50;
    if (priceRange === '50-100') return tier.price.monthly >= 50 && tier.price.monthly <= 100;
    if (priceRange === 'over100') return tier.price.monthly > 100;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price.monthly - b.price.monthly;
    if (sortBy === 'price-high') return b.price.monthly - a.price.monthly;
    return 0;
  });

  const handleWiiPayCheckout = (tier: typeof SUBSCRIPTION_TIERS[0]) => {
    const price = tier.price.monthly;
    const checkoutData = {
      amount: price,
      currency: 'USD',
      description: `${tier.name} - monthly subscription`,
      billing_cycle: 'monthly',
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

    const wiipayCheckoutUrl = import.meta.env.VITE_WIIPAY_CHECKOUT_URL || 'https://checkout.wiipay.com/v1/checkout';
    
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

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Header - Same as other pages */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">
            Lumë <span className="text-emerald-700 font-light">Refillery</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Link to="/" className="hover:text-stone-900">Home</Link>
          <span>/</span>
          <span className="text-stone-900">Sample Hauls</span>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&auto=format&fit=crop"
            alt="Fresh groceries"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="px-8 md:px-12">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                Shop Our Hauls
              </h1>
              <p className="text-white/80 max-w-md">
                Curated grocery subscriptions for every household. Fresh, sustainable, delivered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, text: 'Free Delivery', sub: 'On all subscriptions' },
            { icon: Shield, text: 'Quality Guaranteed', sub: '100% satisfaction' },
            { icon: Clock, text: 'Flexible Schedule', sub: 'Pause anytime' },
            { icon: Star, text: '4.9 Rating', sub: '2,000+ reviews' },
          ].map((badge, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-stone-200 flex items-center gap-3">
              <badge.icon className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="font-medium text-stone-900 text-sm">{badge.text}</div>
                <div className="text-xs text-stone-500">{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters & Sort */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
          <div className="text-stone-600">
            <span className="font-medium text-stone-900">{filteredTiers.length}</span> products
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="appearance-none bg-white border border-stone-200 rounded-lg px-4 py-2 pr-10 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Prices</option>
                <option value="under50">Under $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="over100">Over $100</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-stone-200 rounded-lg px-4 py-2 pr-10 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <Link to={`/sample-hauls/${tier.id}`} className="block relative">
                <div className="aspect-square bg-gradient-to-br from-emerald-50 to-stone-100 relative overflow-hidden">
                  <img 
                    src={getProductImage(tier.id)}
                    alt={tier.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {tier.id === 'household' && (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Best Seller
                    </div>
                  )}
                  {tier.id === 'supported' && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Community Choice
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-stone-500 ml-1">(128)</span>
                </div>

                <Link to={`/sample-hauls/${tier.id}`}>
                  <h3 className="font-serif font-semibold text-lg text-stone-900 mb-1 hover:text-emerald-600 transition-colors">
                    {tier.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-stone-500 mb-3 line-clamp-2">
                  {tier.description}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                    {tier.items.length} items
                  </span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                    Monthly
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-stone-900">${tier.price.monthly.toFixed(0)}</span>
                    <span className="text-stone-500 text-sm">/mo</span>
                  </div>
                  
                  {isSignedIn ? (
                    <button
                      onClick={() => handleWiiPayCheckout(tier)}
                      className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                    >
                      Subscribe
                    </button>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                        Subscribe
                      </button>
                    </SignInButton>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Not sure which haul is right for you?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            Take our quick quiz to find the perfect subscription for your household size and preferences.
          </p>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 bg-white text-emerald-900 px-8 py-4 rounded-full font-medium hover:bg-emerald-50 transition-colors"
          >
            Take the Quiz
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

// Helper function to get product images
const getProductImage = (tierId: string): string => {
  const images: Record<string, string> = {
    'supported': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&auto=format&fit=crop',
    'essential': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop',
    'household': 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop',
    'premium': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop',
    'gourmet': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&auto=format&fit=crop',
    'bulk': 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=600&auto=format&fit=crop',
  };
  return images[tierId] || images['essential'];
};

export default SampleHauls;