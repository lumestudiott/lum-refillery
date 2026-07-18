'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { Check, Plus, ChevronRight, Leaf, Package, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { stockStatus, type StockFields } from '@/lib/stock';
import { api } from '../../../../convex/_generated/api';
import { Doc } from '../../../../convex/_generated/dataModel';

type Variant = Doc<"productVariants">;

type ProductDetailClientProps = {
  product: Doc<"products">;
  variants?: Variant[];
};

type GalleryImage = { url: string; alt?: string };

const SUBSCRIPTION_SCHEDULES = [
  { days: 7, label: 'Every Saturday' },
  { days: 14, label: 'Every 2nd Saturday' },
  { days: 30, label: 'Every 4th Saturday' },
];

const QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function ProductDetailClient({ product, variants = [] }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [schedule, setSchedule] = useState(SUBSCRIPTION_SCHEDULES[0].label);

  // Resolve breadcrumb labels from the live category tree
  const shopCats = useQuery(api.shopCategories.listActive, {});
  const breadcrumb = useMemo(() => {
    const parent = shopCats?.find((c) => c.slug === product.shopCategorySlug);
    const sub = parent?.subcategories.find(
      (s: { slug: string }) => s.slug === product.shopSubcategorySlug
    );
    return { parent, sub };
  }, [shopCats, product.shopCategorySlug, product.shopSubcategorySlug]);

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

  // PDP info tabs (Producer / Storage Tips / Ingredients) - only sections
  // with admin-entered content appear.
  const infoSections = useMemo(() => {
    const sections: { id: string; label: string }[] = [];
    const prod = product.producer;
    if (prod && (prod.name || prod.text || prod.imageUrl)) {
      sections.push({ id: 'producer', label: 'Producer' });
    }
    const store = product.storageTips;
    if (store && (store.text || store.imageUrl)) {
      sections.push({ id: 'storage', label: 'Storage Tips' });
    }
    const ingr = product.ingredients;
    if (ingr && (ingr.text || ingr.imageUrl)) {
      sections.push({ id: 'ingredients', label: 'Ingredients & Nutrition' });
    }
    return sections;
  }, [product.producer, product.storageTips, product.ingredients]);
  const [activeInfoTab, setActiveInfoTab] = useState<string | null>(null);
  const currentInfoTab = activeInfoTab ?? infoSections[0]?.id ?? null;

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

  const baseItem = () => ({
    productId: product._id,
    variantId: selectedVariant?._id,
    variantLabel,
    sku: selectedVariant?.sku ?? product.sku,
    name: product.name,
    priceCents: displayPrice,
    imageUrl: product.imageUrl,
    unit: product.unit,
  });

  const handleAdd = () => {
    addItem({ ...baseItem(), purchaseMode: 'one-time' as const });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleConfirmSubscription = () => {
    addItem(
      { ...baseItem(), purchaseMode: 'subscription' as const, frequency: schedule },
      quantity
    );
    setSubscribeOpen(false);
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 2000);
  };

  const pillBase =
    'inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-300';

  return (
    <div className="min-h-screen bg-canvas text-lume-house selection:bg-lume-house selection:text-canvas">
      <Header />

      <main className="pt-[116px] pb-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 pt-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-[12px] font-medium text-text-secondary">
            <Link href="/shop" className="transition-colors hover:text-lume-house">
              Shop
            </Link>
            {breadcrumb.parent && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-lume-house/30" />
                <Link
                  href={`/shop?category=${breadcrumb.parent.slug}`}
                  className="transition-colors hover:text-lume-house"
                >
                  {breadcrumb.parent.label}
                </Link>
              </>
            )}
            {breadcrumb.parent && breadcrumb.sub && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-lume-house/30" />
                <Link
                  href={`/shop?category=${breadcrumb.parent.slug}&sub=${breadcrumb.sub.slug}`}
                  className="text-lume-house transition-colors"
                >
                  {breadcrumb.sub.label}
                </Link>
              </>
            )}
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-20">
            {/* Image Gallery Column */}
            <div>
              <div className="group relative aspect-square w-full overflow-hidden rounded-[8px] bg-white/60 cursor-zoom-in">
                {activeImage ? (
                  <Image
                    src={activeImage.url}
                    alt={activeImage.alt ?? product.name}
                    fill
                    className="object-contain p-10 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 560px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-secondary">
                    No image available
                  </div>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-white/60 transition-all duration-300 border ${
                        activeImageIndex === i
                          ? 'opacity-100 border-lume-house/30'
                          : 'opacity-60 hover:opacity-100 border-transparent'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? `${product.name} ${i + 1}`}
                        fill
                        className="object-contain p-1.5 mix-blend-multiply"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Column */}
            <div className="flex flex-col pt-2">
              <h1 className="mb-1 font-display text-4xl md:text-5xl leading-tight tracking-tight text-lume-house">
                {product.name}
              </h1>
              {brand && (
                <p className="mb-5 font-display text-[22px] md:text-[26px] leading-snug text-lume-house/40">
                  {brand}
                </p>
              )}

              <p className="mb-1 text-[22px] font-semibold text-lume-house">
                {hasVariants && !selectedVariant ? 'From ' : ''}TT${(displayPrice / 100).toFixed(2)}
              </p>
              <p className="mb-7 text-[12px] font-semibold uppercase tracking-[0.08em] text-lume-house/70">
                {product.unit}
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
                <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.15em] text-[#B45309]">
                  Only {stock.quantity} left in stock
                </p>
              )}

              {unavailable ? (
                <div>
                  <span className={`${pillBase} cursor-not-allowed bg-gray-200 text-gray-500`}>
                    Out of Stock
                  </span>
                </div>
              ) : subscribeOpen ? (
                /* Subscription panel (Farm-to-People style) */
                <div className="max-w-sm">
                  <label className="mb-1.5 block text-[12px] font-semibold text-lume-house">
                    Quantity
                  </label>
                  <div className="relative mb-4">
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full appearance-none border border-lume-house/25 bg-transparent px-4 py-3 text-[14px] text-lume-house outline-none focus:border-lume-house cursor-pointer rounded-[4px]"
                    >
                      {QUANTITIES.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                    <ChevronDownIcon />
                  </div>

                  <label className="mb-1.5 block text-[12px] font-semibold text-lume-house">
                    Frequency
                  </label>
                  <div className="relative mb-6">
                    <select
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      className="w-full appearance-none border border-lume-house/25 bg-transparent px-4 py-3 text-[14px] text-lume-house outline-none focus:border-lume-house cursor-pointer rounded-[4px]"
                    >
                      {SUBSCRIPTION_SCHEDULES.map((s) => (
                        <option key={s.days} value={s.label}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDownIcon />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSubscribeOpen(false)}
                      className={`${pillBase} flex-1 border border-lume-house text-lume-house hover:bg-lume-house/5`}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSubscription}
                      className={`${pillBase} flex-1 bg-lume-house text-white border border-lume-house hover:bg-transparent hover:text-lume-house`}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                /* Default: Subscribe + Add pills */
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSubscribeOpen(true)}
                    className={`${pillBase} border border-lume-house text-lume-house hover:bg-lume-house/5 ${
                      subscribed ? 'bg-lume-house text-white' : ''
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className={`${pillBase} border border-lume-house bg-lume-house text-white hover:bg-transparent hover:text-lume-house`}
                  >
                    {added ? (
                      <><Check className="h-3.5 w-3.5" /> Added</>
                    ) : (
                      <><Plus className="h-3.5 w-3.5" /> Add</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description + tags (full width, Farm-to-People style) */}
          <div className="mt-14 max-w-4xl">
            <p className="text-[15px] font-light leading-relaxed text-text-secondary">
              {product.description || 'A beautiful, sustainably sourced product for your home.'}
            </p>

            {product.tags && product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-lume-house/20 px-4 py-1.5 text-[12px] font-medium text-lume-house/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Info tabs: Producer / Storage Tips / Ingredients & Nutrition */}
          {infoSections.length > 0 && (
            <div className="mt-16">
              <div className="flex gap-8 border-b border-lume-house/10">
                {infoSections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveInfoTab(s.id)}
                    className={`relative pb-3 text-[13px] font-medium transition-colors ${
                      currentInfoTab === s.id
                        ? 'text-lume-house'
                        : 'text-text-secondary hover:text-lume-house'
                    }`}
                  >
                    {s.label}
                    {currentInfoTab === s.id && (
                      <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-lume-house" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-lume-house/10 bg-white/50 p-7 md:p-9">
                {currentInfoTab === 'producer' && product.producer && (
                  <div className="flex flex-col gap-7 md:flex-row">
                    {product.producer.imageUrl && (
                      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl md:h-40 md:w-56">
                        <Image
                          src={product.producer.imageUrl}
                          alt={product.producer.name ?? 'Producer'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 224px"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      {product.producer.name && (
                        <h3 className="font-display text-[24px] leading-tight tracking-tight text-lume-house">
                          {product.producer.name}
                        </h3>
                      )}
                      {product.producer.location && (
                        <p className="mt-0.5 text-[12px] font-medium uppercase tracking-[0.1em] text-lume-accent">
                          {product.producer.location}
                        </p>
                      )}
                      {product.producer.text && (
                        <p className="mt-4 whitespace-pre-wrap text-[14px] font-light leading-relaxed text-text-secondary">
                          {product.producer.text}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {currentInfoTab === 'storage' && product.storageTips && (
                  <div className="flex flex-col gap-7 md:flex-row">
                    {product.storageTips.imageUrl && (
                      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl md:h-40 md:w-56">
                        <Image
                          src={product.storageTips.imageUrl}
                          alt="Storage"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 224px"
                        />
                      </div>
                    )}
                    {product.storageTips.text && (
                      <p className="whitespace-pre-wrap text-[14px] font-light leading-relaxed text-text-secondary">
                        {product.storageTips.text}
                      </p>
                    )}
                  </div>
                )}

                {currentInfoTab === 'ingredients' && product.ingredients && (
                  <div className="flex flex-col gap-7 md:flex-row">
                    {product.ingredients.imageUrl && (
                      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl md:h-40 md:w-56">
                        <Image
                          src={product.ingredients.imageUrl}
                          alt="Ingredients & nutrition"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 224px"
                        />
                      </div>
                    )}
                    {product.ingredients.text && (
                      <p className="whitespace-pre-wrap text-[14px] font-light leading-relaxed text-text-secondary">
                        {product.ingredients.text}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accordions */}
          <div className="mt-12 max-w-4xl flex flex-col border-b border-lume-house/10">
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
      </main>

      <Footer />
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lume-house/50">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
