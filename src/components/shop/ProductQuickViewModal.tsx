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
    const displayName = product.name.replace(/\[/g, '').replace(/\]/g, '');
    const displayUnit = product.unit.toLowerCase().includes('bdl') ? 'Bundle' : product.unit;

    addItem({
      productId: product._id,
      sku: product.sku,
      name: displayName,
      priceCents: product.basePriceCents,
      imageUrl: product.imageUrl,
      unit: displayUnit,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  const stock = stockStatus(product);

  const displayName = product.name.replace(/\[/g, '').replace(/\]/g, '');
  const displayUnit = product.unit.toLowerCase().includes('bdl') ? 'Bundle' : product.unit;

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md transition-opacity duration-500 sm:p-6 lg:p-12"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative flex w-full max-w-[1000px] max-h-[90vh] flex-col overflow-hidden rounded-[4px] bg-[#FAF9F5] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-[0.98] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-text-secondary transition-all hover:bg-black/10 hover:text-black"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-12 pb-16 lg:px-16 scrollbar-hide">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            {/* Image gallery */}
            <div className="space-y-6">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-transparent">
                {gallery[activeImage] ? (
                  <Image
                    src={gallery[activeImage].url}
                    alt={gallery[activeImage].alt ?? product.name}
                    fill
                    className="object-contain mix-blend-multiply"
                    sizes="(max-width: 768px) 100vw, 500px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[12px] text-text-secondary">
                    No image available
                  </div>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="flex justify-center gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-[2px] transition-all duration-300 ${
                        activeImage === i
                          ? 'ring-1 ring-lume-house ring-offset-2 ring-offset-[#FAF9F5]'
                          : 'opacity-40 hover:opacity-80'
                      }`}
                    >
                      <Image src={img.url} alt={img.alt ?? `${product.name} ${i + 1}`} fill className="object-cover mix-blend-multiply" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center md:py-8">
              <div className="mb-8">
                {product.brand && (
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-lume-accent">
                    {product.brand}
                  </h4>
                )}
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  {product.category}
                </h3>
                <h2 className="font-display text-[40px] md:text-[48px] leading-[1.1] tracking-tight text-lume-house">
                  {displayName}
                </h2>
              </div>
              
              <div className="mb-10 text-[14px] font-light leading-relaxed text-text-secondary">
                {product.description ? (
                  <p className="whitespace-pre-wrap">{product.description}</p>
                ) : (
                  <p>A beautiful, sustainably sourced product for your home.</p>
                )}
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Sticky Footer */}
        <div className="flex shrink-0 flex-col sm:flex-row items-center justify-between border-t border-black/5 bg-[#FAF9F5]/90 backdrop-blur-2xl px-8 py-6 lg:px-16">
          <div className="mb-6 sm:mb-0 text-center sm:text-left flex flex-col items-center sm:items-start w-full sm:w-auto">
            <div className="flex items-end gap-3 mb-1">
              <span className="font-display text-[28px] text-lume-house leading-none">
                TT${(product.basePriceCents / 100).toFixed(2)}
              </span>
              <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-text-secondary mb-1">
                / {displayUnit}
              </span>
            </div>
            <p className="text-[12px] text-text-secondary">
              {product.purchaseType === 'subscription' ? 'Subscribe to save more.' : 'One-time purchase.'}
            </p>
            {stock.low && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#D9381E]">
                Only {stock.quantity} left
              </p>
            )}
          </div>

          <div className="flex w-full sm:w-auto items-center justify-end">
            {stock.soldOut ? (
              <button
                type="button"
                disabled
                className="flex h-[48px] w-full sm:w-64 items-center justify-center gap-2 border border-black/10 bg-transparent text-[11px] font-bold uppercase tracking-[0.15em] text-black/30 cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : product.purchaseType === 'subscription' ? (
              <QuickViewSubscriptionSelector product={product} />
            ) : (
              <button
                type="button"
                onClick={handleSubscribe}
                className={`flex h-[48px] w-full sm:w-64 items-center justify-center gap-2 border text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-500 ${
                  added
                    ? 'border-lume-house bg-lume-house text-[#FAF9F5]'
                    : 'border-lume-house bg-lume-house text-[#FAF9F5] hover:bg-lume-house/90 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {added ? 'Added to Cart' : 'Add to Cart'}
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
    const displayName = product.name.replace(/\[/g, '').replace(/\]/g, '');
    const displayUnit = product.unit.toLowerCase().includes('bdl') ? 'Bundle' : product.unit;

    addItem({
      productId: product._id,
      sku: product.sku,
      name: displayName,
      priceCents: product.basePriceCents,
      imageUrl: product.imageUrl,
      unit: displayUnit,
      purchaseMode: 'subscription',
      frequency: `Every ${INTERVAL_LABELS[selected] ?? selected}`,
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
