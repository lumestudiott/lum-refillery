'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export interface ShopProduct {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  basePriceCents: number;
  imageUrl?: string;
  sourcingOrigin?: string;
  // "one-time" (default) | "subscription"
  purchaseType?: string;
  // e.g. ["1mo", "3mo", "6mo"]
  subscriptionIntervals?: string[];
  tags?: string[];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85';

const INTERVAL_LABELS: Record<string, string> = {
  '1mo': '1 Mo',
  '3mo': '3 Mo',
  '6mo': '6 Mo',
  '12mo': '12 Mo',
};

export default function ProductCard({ 
  product,
  onQuickView
}: { 
  product: ShopProduct;
  onQuickView?: () => void;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product._id,
      sku: product.sku,
      name: product.name,
      priceCents: product.basePriceCents,
      imageUrl: product.imageUrl,
      unit: product.unit,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isSubscription = product.purchaseType === 'subscription';

  return (
    <article className="group relative flex flex-col bg-transparent">
      {/* Editorial Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F0EFEB] rounded-[4px]">
        
        {/* Badges / Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {product.tags.map((tag) => {
              const isSale = tag.toLowerCase() === 'sale';
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center justify-center px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-sm backdrop-blur-md rounded-sm ${
                    isSale ? 'bg-[#D9381E]' : 'bg-lume-house/90'
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        <Image
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
        />
        
        {/* Glassmorphic Quick View Overlay (appears on hover) */}
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView?.();
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 rounded-full bg-white/85 px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-lume-house opacity-0 shadow-[0_4px_24px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-white focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-lume-house/30 group-hover:translate-y-0 group-hover:opacity-100"
          aria-label={`Quick view ${product.name}`}
        >
          Quick View
        </button>
      </div>

      <div className="flex flex-col pt-5 pb-2">
        {/* Subtle Brand & Unit Label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium tracking-[0.15em] text-text-secondary uppercase">
            Lumë · {product.unit}
          </span>
          {/* Subtle Price on right */}
          <span className="text-[12px] font-medium tracking-wider text-lume-house">
            TT${(product.basePriceCents / 100).toFixed(2)}
          </span>
        </div>
        
        {/* Main Title - Serif Editorial */}
        <Link href={`/shop/${product.sku}`}>
          <h3 className="font-display text-[22px] leading-snug tracking-tight text-lume-house transition-colors group-hover:text-black hover:underline cursor-pointer">
            {product.name}
          </h3>
        </Link>
        
        {/* Description */}
        <span className="mt-1.5 text-[13px] text-text-secondary max-w-[85%] leading-relaxed font-light">
          {product.description || 'Curated seasonal selection for your everyday rituals.'}
        </span>

        {/* Add to Cart / Subscribe */}
        {isSubscription ? (
          <SubscriptionSelector product={product} />
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            aria-live="polite"
            aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
            className={`mt-6 flex h-[42px] items-center justify-center gap-2 border border-lume-house/20 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-500 ${
              added
                ? 'bg-lume-house text-white border-lume-house'
                : 'bg-transparent text-lume-house hover:bg-lume-house hover:text-white'
            }`}
          >
            {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {added ? 'Added' : 'Add to Cart'}
          </button>
        )}
      </div>
    </article>
  );
}

/* ── Subscription button with inline duration picker ───────────── */
function SubscriptionSelector({ product }: { product: ShopProduct }) {
  const { addItem } = useCart();
  const intervals = product.subscriptionIntervals ?? ['1mo', '3mo', '6mo'];
  const [selected, setSelected] = useState(intervals[0]);
  const [subscribed, setSubscribed] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Close popover on outside click
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
    <div ref={wrapperRef} className="relative mt-6">
      {/* Main button row */}
      <div className="flex h-[42px]">
        {/* Subscribe action */}
        <button
          type="button"
          onClick={handleSubscribe}
          aria-live="polite"
          className={`flex flex-1 items-center justify-center gap-2 border border-r-0 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-500 ${
            subscribed
              ? 'bg-lume-house text-white border-lume-house'
              : 'border-lume-house/20 bg-transparent text-lume-house hover:bg-lume-house hover:text-white'
          }`}
        >
          {subscribed ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {subscribed ? 'Subscribed' : `Subscribe · ${INTERVAL_LABELS[selected] ?? selected}`}
        </button>

        {/* Duration toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Change subscription duration"
          className={`flex w-10 items-center justify-center border transition-all duration-300 ${
            open
              ? 'bg-lume-house text-white border-lume-house'
              : subscribed
                ? 'bg-lume-house text-white border-lume-house'
                : 'border-lume-house/20 text-lume-house/50 hover:border-lume-house/40 hover:text-lume-house'
          }`}
        >
          <svg className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Duration popover */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 flex flex-col overflow-hidden border border-lume-house/15 bg-canvas shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          {intervals.map((interval) => (
            <button
              key={interval}
              type="button"
              onClick={() => {
                setSelected(interval);
                setOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${
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

