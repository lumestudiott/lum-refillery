'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, Check, Plus } from 'lucide-react';
import { ShopProduct } from './ProductCard';
import { useCart } from '@/context/CartContext';

// Beautiful mock data
const MOCK_CONTENTS = [
  {
    farm: 'East Coast Grown',
    name: 'East Coast Yellow Peaches',
    quantity: '2 pieces',
    tags: [],
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80',
  },
  {
    farm: 'Sun Sprout Farm',
    name: 'Organic Green Garlic',
    quantity: '1 bunch',
    tags: ['Certified Organic', 'Local'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
  },
  {
    farm: 'Sun Sprout Farm',
    name: 'Organic Broccoli Raab',
    quantity: '1 bunch',
    tags: ['Certified Organic', 'Local'],
    image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=400&q=80',
  },
  {
    farm: 'Sheppard Farms',
    name: 'Asparagus',
    quantity: '1 bunch',
    tags: ['Local'],
    image: 'https://images.unsplash.com/photo-1515471209610-dae1c92d8777?auto=format&fit=crop&w=400&q=80',
  },
  {
    farm: 'Kennett Square Specialties',
    name: 'Cremini Mushrooms',
    quantity: '8 oz',
    tags: ['Local'],
    image: 'https://images.unsplash.com/photo-1511910849309-0dffb8785146?auto=format&fit=crop&w=400&q=80',
  },
  {
    farm: 'Eagle Road Farm',
    name: 'Organically Grown Red Radishes',
    quantity: '1 bunch',
    tags: ['Organically Grown', 'Local'],
    image: 'https://images.unsplash.com/photo-1595856422204-7a98b71d4d38?auto=format&fit=crop&w=400&q=80',
  },
];

interface ProductQuickViewModalProps {
  product: ShopProduct;
  onClose: () => void;
}

export default function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  const { addItem } = useCart();
  const [added, setAdded] = React.useState(false);
  const [deliveryFrequency, setDeliveryFrequency] = React.useState('One-time Purchase');

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubscribe = () => {
    addItem({
      productId: product._id,
      sku: product.sku,
      name: product.name,
      priceCents: product.basePriceCents,
      imageUrl: product.imageUrl,
      unit: product.unit,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  // Calculate upcoming week for realism
  const nextWeekStart = new Date();
  nextWeekStart.setDate(nextWeekStart.getDate() + (7 - nextWeekStart.getDay()) % 7); // Next Sunday
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
  
  const formatDate = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}.${d.getFullYear().toString().slice(-2)}`;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-lume-house/30 p-4 backdrop-blur-md transition-opacity duration-500 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative flex w-full max-w-[960px] max-h-[90vh] flex-col overflow-hidden rounded-[8px] bg-[#FAF9F5] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-[0.98] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-lume-house/20 text-lume-house transition-all hover:bg-lume-house hover:text-white"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pt-12 pb-10 lg:px-12 scrollbar-hide">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary mb-4">
              Curation Contents · {formatDate(nextWeekStart)} - {formatDate(nextWeekEnd)}
            </span>
            <h2 className="mb-4 font-display text-[32px] md:text-[40px] leading-tight tracking-tight text-lume-house">
              {product.name}
            </h2>
            <div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-lume-house/60 border-b border-lume-house/20 pb-1">
              Curations can be fully modified after securing
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
            {MOCK_CONTENTS.map((item, i) => (
              <div key={i} className="flex gap-5 group items-center">
                {/* Item Image - Fallback to standard img tag to bypass Next.js unconfigured domains */}
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[4px] bg-[#F0EFEB]">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  />
                </div>
                
                {/* Item Details */}
                <div className="flex flex-col py-1">
                  <span className="mb-1 text-[9px] font-medium tracking-[0.2em] uppercase text-text-secondary">{item.farm}</span>
                  <span className="mb-1.5 font-display text-[18px] leading-tight text-lume-house">{item.name}</span>
                  <span className="text-[12px] font-light text-text-secondary mb-2">{item.quantity}</span>
                  
                  {/* Minimalist Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map(tag => (
                        <span key={tag} className="border border-lume-house/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-lume-house/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimalist Sticky Footer */}
        <div className="flex shrink-0 flex-col sm:flex-row items-center justify-between border-t border-lume-house/10 bg-[#FAF9F5]/95 backdrop-blur-xl px-10 py-8 lg:px-16">
          <div className="mb-8 sm:mb-0 text-center sm:text-left flex flex-col items-center sm:items-start w-full sm:w-auto">
            <p className="text-[12px] font-light text-lume-house/70 mb-1">
              {product.purchaseType === 'subscription' ? 'Customize or skip weekly.' : 'One-time purchase.'}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-lume-house">
              TT${(product.basePriceCents / 100).toFixed(2)} / {product.unit}
            </p>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-end">
            {product.purchaseType === 'subscription' ? (
              <QuickViewSubscriptionSelector product={product} />
            ) : (
              <button
                type="button"
                onClick={handleSubscribe}
                className={`flex h-[46px] w-full sm:w-56 items-center justify-center gap-2 border text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-500 ${
                  added
                    ? 'bg-lume-house text-white border-lume-house'
                    : 'bg-lume-house text-white border-lume-house hover:bg-transparent hover:text-lume-house'
                }`}
              >
                {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {added ? 'Added' : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const INTERVAL_LABELS: Record<string, string> = {
  '1mo': '1 Mo',
  '3mo': '3 Mo',
  '6mo': '6 Mo',
  '12mo': '12 Mo',
};

function QuickViewSubscriptionSelector({ product }: { product: ShopProduct }) {
  const { addItem } = useCart();
  const intervals = product.subscriptionIntervals ?? ['1mo', '3mo', '6mo'];
  const [selected, setSelected] = React.useState(intervals[0]);
  const [subscribed, setSubscribed] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSubscribe = () => {
    addItem({
      productId: product._id,
      sku: product.sku,
      name: `${product.name} (${INTERVAL_LABELS[selected] ?? selected})`,
      priceCents: product.basePriceCents,
      imageUrl: product.imageUrl,
      unit: product.unit,
    });
    setSubscribed(true);
    setOpen(false);
    setTimeout(() => setSubscribed(false), 2200);
  };

  return (
    <div ref={wrapperRef} className="relative flex h-[46px] w-full sm:w-[280px]">
      <button
        type="button"
        onClick={handleSubscribe}
        className={`flex flex-1 items-center justify-center gap-2 border border-r-0 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-500 ${
          subscribed
            ? 'bg-lume-house text-white border-lume-house'
            : 'bg-lume-house text-white border-lume-house hover:bg-transparent hover:text-lume-house'
        }`}
      >
        {subscribed ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {subscribed ? 'Subscribed' : `Subscribe · ${INTERVAL_LABELS[selected] ?? selected}`}
      </button>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-12 items-center justify-center border transition-all duration-300 ${
          open
            ? 'bg-lume-house text-white border-lume-house'
            : subscribed
              ? 'bg-lume-house text-white border-lume-house'
              : 'border-lume-house bg-lume-house text-white/50 hover:bg-transparent hover:text-lume-house'
        }`}
      >
        <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 z-30 mb-2 flex flex-col overflow-hidden border border-lume-house/15 bg-canvas shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          {intervals.map((interval) => (
            <button
              key={interval}
              type="button"
              onClick={() => {
                setSelected(interval);
                setOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${
                selected === interval
                  ? 'bg-lume-house/8 text-lume-house'
                  : 'text-lume-house/60 hover:bg-lume-house/5 hover:text-lume-house'
              }`}
            >
              {INTERVAL_LABELS[interval] ?? interval}
              {selected === interval && <Check className="h-3 w-3 text-lume-house" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
