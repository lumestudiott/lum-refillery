'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, Check, Plus } from 'lucide-react';
import { ShopProduct } from './ProductCard';
import { useCart } from '@/context/CartContext';
import { stockStatus } from '@/lib/stock';

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

  const stock = stockStatus(product);

  // Primary image + admin-uploaded variations
  const gallery = React.useMemo(() => {
    const imgs: Array<{ url: string; alt?: string }> = [];
    if (product.imageUrl) imgs.push({ url: product.imageUrl, alt: product.name });
    for (const img of product.images ?? []) {
      if (img.url && img.url !== product.imageUrl) imgs.push(img);
    }
    return imgs;
  }, [product]);
  const [activeImage, setActiveImage] = React.useState(0);

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
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
            {/* Image gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[6px] bg-[#F0EFEB]">
                {gallery[activeImage] ? (
                  <Image
                    src={gallery[activeImage].url}
                    alt={gallery[activeImage].alt ?? product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 440px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[12px] text-text-secondary">
                    No image available
                  </div>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md transition-all ${
                        activeImage === i
                          ? 'ring-2 ring-lume-house ring-offset-2 ring-offset-[#FAF9F5]'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.url} alt={img.alt ?? `${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col md:pt-4">
              {product.brand && (
                <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-lume-accent">
                  {product.brand}
                </span>
              )}
              <span className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">
                {product.category}
              </span>
              <h2 className="mb-4 font-display text-[32px] md:text-[38px] leading-tight tracking-tight text-lume-house">
                {product.name}
              </h2>
              <p className="mb-6 text-[13px] font-light leading-relaxed text-text-secondary">
                {product.description || 'A beautiful, sustainably sourced product for your home.'}
              </p>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-lume-house/15 px-3 py-1 text-[10px] font-medium text-lume-house/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
            {stock.low && (
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#B45309]">
                Only {stock.quantity} left
              </p>
            )}
          </div>

          <div className="flex w-full sm:w-auto items-center justify-end">
            {stock.soldOut ? (
              <button
                type="button"
                disabled
                className="flex h-[46px] w-full sm:w-56 items-center justify-center gap-2 border border-lume-house/15 text-[11px] font-medium uppercase tracking-[0.15em] text-lume-house/40 cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : product.purchaseType === 'subscription' ? (
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
