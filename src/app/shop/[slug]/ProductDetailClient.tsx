'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Plus, ArrowLeft, Info, Leaf, Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { Doc } from '../../../../convex/_generated/dataModel';

type ProductDetailClientProps = {
  product: Doc<"products">;
};

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [deliveryFrequency, setDeliveryFrequency] = useState('One-time Purchase');

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
            <div className="space-y-6">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[8px] bg-[#F0EFEB]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
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
            </div>

            {/* Details Column */}
            <div className="flex flex-col pt-4">
              <span className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">
                {product.category}
              </span>
              <h1 className="mb-4 font-display text-4xl md:text-5xl lg:text-[56px] leading-tight tracking-tight text-lume-house">
                {product.name}
              </h1>
              <p className="text-[14px] font-light leading-relaxed text-text-secondary mb-8">
                {product.description || 'A beautiful, sustainably sourced product for your home.'}
              </p>

              <div className="mb-10 pb-10 border-b border-lume-house/10">
                <p className="text-[20px] font-medium text-lume-house mb-6">
                  ${(product.basePriceCents / 100).toFixed(2)} <span className="text-[14px] text-text-secondary font-light">/ {product.unit}</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <select 
                      value={deliveryFrequency}
                      onChange={(e) => setDeliveryFrequency(e.target.value)}
                      className="w-full appearance-none rounded-none border border-lume-house/20 bg-transparent px-4 py-4 text-[11px] font-medium uppercase tracking-[0.15em] text-lume-house outline-none focus:border-lume-house cursor-pointer"
                    >
                      <option>One-time Purchase</option>
                      <option>Weekly Delivery</option>
                      <option>Bi-weekly</option>
                      <option>Monthly</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lume-house/50">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <button
                    onClick={handleSubscribe}
                    disabled={!product.active}
                    className={`flex flex-1 items-center justify-center gap-2 border py-4 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-500 ${
                      !product.active 
                        ? 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed'
                        : added
                          ? 'bg-lume-house text-white border-lume-house'
                          : 'bg-lume-house text-white border-lume-house hover:bg-transparent hover:text-lume-house'
                    }`}
                  >
                    {!product.active ? 'Out of Stock' : added ? (
                      <><Check className="h-4 w-4" /> Added</>
                    ) : (
                      <><Plus className="h-4 w-4" /> {deliveryFrequency === 'One-time Purchase' ? 'Add to Cart' : 'Subscribe'}</>
                    )}
                  </button>
                </div>
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
