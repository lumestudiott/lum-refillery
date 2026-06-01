'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85';

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

  return (
    <article className="group relative flex flex-col bg-transparent">
      {/* Editorial Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F0EFEB] rounded-[4px]">
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView?.();
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-y-0 group-hover:opacity-100 backdrop-blur-md bg-white/80 text-lume-house px-6 py-2.5 text-[11px] font-medium tracking-[0.2em] uppercase rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.1)] hover:bg-white"
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
            ${(product.basePriceCents / 100).toFixed(2)}
          </span>
        </div>
        
        {/* Main Title - Serif Editorial */}
        <h3 className="font-display text-[22px] leading-snug tracking-tight text-lume-house transition-colors group-hover:text-black">
          {product.name}
        </h3>
        
        {/* Description */}
        <span className="mt-1.5 text-[13px] text-text-secondary max-w-[85%] leading-relaxed font-light">
          {product.description || 'Curated seasonal selection for your everyday rituals.'}
        </span>

        {/* Minimalist Add Button */}
        <button
          onClick={handleAdd}
          className={`mt-6 flex items-center justify-center gap-2 border border-lume-house/20 py-3 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-500 ${
            added
              ? 'bg-lume-house text-white border-lume-house'
              : 'bg-transparent text-lume-house hover:bg-lume-house hover:text-white'
          }`}
        >
          {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {added ? 'Added' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
