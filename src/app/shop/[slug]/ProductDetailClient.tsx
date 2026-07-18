'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Plus, ArrowLeft, Leaf, Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { stockStatus, type StockFields } from '@/lib/stock';
import { Doc } from '../../../../convex/_generated/dataModel';

type Variant = Doc<"productVariants">;

type ProductDetailClientProps = {
  product: Doc<"products">;
  variants?: Variant[];
};

type GalleryImage = { url: string; alt?: string };

const SUBSCRIPTION_SCHEDULES = ['Every 7 days', 'Every 14 days', 'Every 30 days'];

export default function ProductDetailClient({ product, variants = [] }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<'one-time' | 'subscription'>('one-time');
  const [schedule, setSchedule] = useState(SUBSCRIPTION_SCHEDULES[0]);

  const brand = product.brand;
  const extraImages: GalleryImage[] = product.images ?? [];

  const galleryImages: GalleryImage[] = useMemo(() => {
    const imgs: GalleryImage[] = [];
    if (product.imageUrl) {
      imgs.push({ url: product.imageUrl, alt: product.name });
    }
    for (const img of extraImages) {
      if (img.url && img.url !== product.imageUrl) {
        imgs.push(img);
      }
    }
    return imgs;
  }, [product.imageUrl, product.name, extraImages]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = galleryImages[activeImageIndex] ?? null;

  const hasVariants = (product.options?.length ?? 0) > 0 && variants.length > 0;
  const options = product.options ?? [];

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (!hasVariants) return {};
    const initial: Record<string, string> = {};
    for (const opt of options) {
      if (opt.values.length > 0) initial[opt.name] = opt.values[0];
    }
    return initial;
  });

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find((v) =>
      options.every((opt) => v.optionValues[opt.name] === selectedOptions[opt.name])
    ) ?? null;
  }, [hasVariants, variants, options, selectedOptions]);

  const displayPrice = selectedVariant?.priceCents ?? product.basePriceCents;
  const stockSource: StockFields = selectedVariant
    ? { trackInventory: selectedVariant.trackInventory, stockQuantity: selectedVariant.stockQuantity, lowStockThreshold: selectedVariant.lowStockThreshold }
    : product;
  const stock = stockStatus(stockSource);
  const unavailable = !product.active || stock.soldOut || (hasVariants && !selectedVariant);

  const variantLabel = hasVariants
    ? options.map((o) => selectedOptions[o.name]).join(' / ')
    : undefined;

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      variantId: selectedVariant?._id,
      variantLabel,
      sku: selectedVariant?.sku ?? product.sku,
      name: product.name,
      priceCents: displayPrice,
      imageUrl: product.imageUrl,
      unit: product.unit,
      purchaseMode,
      frequency: purchaseMode === 'subscription' ? schedule : undefined,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-lume-house selection:bg-lume-house selection:text-canvas">
      <Header />

      <main className="pt-[116px] pb-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-16 pt-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-text-secondary hover:text-lume-house transition-colors mb-10">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Image Gallery Column */}
            <div className="space-y-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[8px] bg-[#F0EFEB]">
                {activeImage ? (
                  <Image
                    src={activeImage.url}
                    alt={activeImage.alt ?? product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-secondary">
                    No image available
                  </div>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md transition-all ${
                        activeImageIndex === i
                          ? 'ring-2 ring-lume-house ring-offset-2 ring-offset-[#FAF9F5]'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? `${product.name} ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Column */}
            <div className="flex flex-col pt-4">
              {brand && (
                <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-lume-accent">
                  {brand}
                </span>
              )}
              <span className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">
                {product.category}
              </span>
              <h1 className="mb-4 font-display text-4xl md:text-5xl lg:text-[56px] leading-tight tracking-tight text-lume-house">
                {product.name}
              </h1>
              <p className="text-[14px] font-light leading-relaxed text-text-secondary mb-6">
                {product.description || 'A beautiful, sustainably sourced product for your home.'}
              </p>

              {/* Tag pills */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-lume-house/15 px-3 py-1 text-[11px] font-medium text-lume-house/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-10 pb-10 border-b border-lume-house/10">
                <p className="text-[20px] font-medium text-lume-house mb-6">
                  {hasVariants && !selectedVariant ? 'From ' : ''}TT${(displayPrice / 100).toFixed(2)} <span className="text-[14px] text-text-secondary font-light">/ {product.unit}</span>
                </p>

                {/* Variant option selectors */}
                {hasVariants && options.map((opt) => (
                  <div key={opt.name} className="mb-5">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-text-secondary">
                      {opt.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const isSelected = selectedOptions[opt.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.name]: val }))}
                            className={`border px-4 py-2.5 text-[12px] font-medium transition-all ${
                              isSelected
                                ? 'border-lume-house bg-lume-house text-white'
                                : 'border-lume-house/20 text-lume-house hover:border-lume-house/50'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {stock.low && (
                  <p className="-mt-1 mb-6 text-[11px] font-medium uppercase tracking-[0.15em] text-[#B45309]">
                    Only {stock.quantity} left in stock
                  </p>
                )}

                {/* Purchase mode: One-time vs Subscribe */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {([
                    { mode: 'one-time' as const, label: 'One-time' },
                    { mode: 'subscription' as const, label: 'Subscribe' },
                  ]).map(({ mode, label }) => {
                    const selected = purchaseMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPurchaseMode(mode)}
                        aria-pressed={selected}
                        className={`border py-3.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-all ${
                          selected
                            ? 'border-lume-house bg-lume-house text-white'
                            : 'border-lume-house/20 text-lume-house hover:border-lume-house/50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Subscription schedule layer */}
                {purchaseMode === 'subscription' && (
                  <div className="mb-5">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-text-secondary">
                      Delivery schedule
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUBSCRIPTION_SCHEDULES.map((s) => {
                        const selected = schedule === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSchedule(s)}
                            aria-pressed={selected}
                            className={`border px-4 py-2.5 text-[12px] font-medium transition-all ${
                              selected
                                ? 'border-lume-house bg-lume-house text-white'
                                : 'border-lume-house/20 text-lume-house hover:border-lume-house/50'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={unavailable}
                  className={`flex w-full items-center justify-center gap-2 border py-4 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-500 ${
                    unavailable
                      ? 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed'
                      : added
                        ? 'bg-lume-house text-white border-lume-house'
                        : 'bg-lume-house text-white border-lume-house hover:bg-transparent hover:text-lume-house'
                  }`}
                >
                  {unavailable ? 'Out of Stock' : added ? (
                    <><Check className="h-4 w-4" /> Added</>
                  ) : (
                    <><Plus className="h-4 w-4" /> Add to Cart</>
                  )}
                </button>
              </div>

              {/* Accordions */}
              <div className="flex flex-col border-b border-lume-house/10">
                <details className="group border-t border-lume-house/10 py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between text-[13px] font-medium uppercase tracking-[0.15em] text-lume-house outline-none">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-4 w-4 text-text-secondary" />
                      Sourcing & Attributes
                    </div>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-4 text-[14px] font-light leading-relaxed text-text-secondary pb-2">
                    <p className="mb-2"><strong>Origin:</strong> {product.sourcingOrigin || 'Locally sourced'}</p>
                    {product.sourcingPartner && <p className="mb-4"><strong>Partner:</strong> {product.sourcingPartner}</p>}

                    {product.attributes && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {Object.entries(product.attributes).map(([key, value]) => {
                          if (!value) return null;
                          const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                          return (
                            <span key={key} className="border border-lume-house/15 px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-lume-house/70">
                              {formattedKey}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </details>

                <details className="group border-t border-lume-house/10 py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between text-[13px] font-medium uppercase tracking-[0.15em] text-lume-house outline-none">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-text-secondary" />
                      Delivery & Packaging
                    </div>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-4 text-[14px] font-light leading-relaxed text-text-secondary pb-2">
                    Delivered in returnable, reusable glass jars or compostable packaging to minimize waste. Return empty containers with your next delivery.
                  </div>
                </details>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
