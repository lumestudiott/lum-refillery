'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { MAX_CART_ITEM_QUANTITY, useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotalCents, totalItems } = useCart();
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');

  const handleCheckout = async () => {
    if (items.length === 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            sku: i.sku,
            name: i.name,
            priceCents: i.priceCents,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-[120] flex h-full w-full max-w-md flex-col bg-canvas shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-lume-house/10 px-6 py-5">
              <h2 id="cart-drawer-title" className="font-display text-[24px] font-normal tracking-tight text-lume-house">
                Your Cart {totalItems > 0 && <span className="text-text-secondary text-[16px] ml-1">({totalItems})</span>}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="text-text-secondary transition-colors hover:text-lume-house"
                aria-label="Close cart"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="h-12 w-12 text-text-secondary/40" strokeWidth={1.5} />
                  <p className="mt-4 text-[15px] font-medium text-text-primary">Your cart is empty</p>
                  <p className="mt-1 text-[13px] text-text-secondary">Browse the shop to add chilled items.</p>
                </div>
              ) : (
                <ul className="flex flex-col">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-5 border-b border-lume-house/10 py-6 last:border-0">
                      <div className="relative flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden bg-black/5">
                        <Image 
                          src={item.imageUrl || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=85"} 
                          alt={item.name} 
                          fill 
                          sizes="80px" 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <Link href={`/shop?q=${encodeURIComponent(item.name)}`} onClick={closeCart} className="text-[13px] font-medium leading-snug text-lume-house uppercase tracking-[0.05em] transition-colors hover:text-text-secondary">
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="p-1 text-text-secondary hover:text-lume-house"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <X className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="mt-1 text-[13px] text-text-secondary">
                          TT${(item.priceCents / 100).toFixed(2)} / {item.unit}
                        </p>
                        <div className="mt-auto flex items-end justify-between pt-4">
                          <div className="flex h-8 items-center border border-lume-house/20">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="flex h-full w-8 items-center justify-center text-text-secondary transition-colors hover:bg-lume-house/5 hover:text-lume-house disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary disabled:cursor-not-allowed"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-full w-8 items-center justify-center text-[12px] font-medium text-lume-house" aria-label={`${item.quantity} selected`}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="flex h-full w-8 items-center justify-center text-text-secondary transition-colors hover:bg-lume-house/5 hover:text-lume-house"
                              disabled={item.quantity >= MAX_CART_ITEM_QUANTITY}
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-display text-[16px] text-lume-house">
                            TT${((item.priceCents * item.quantity) / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="border-t border-lume-house/10 px-6 py-8">
                {/* Promo Code Box */}
                <div className="mb-6 flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE"
                    className="flex-1 border border-lume-house/20 bg-transparent px-3 py-2 text-[12px] font-medium tracking-wider outline-none placeholder:text-text-secondary focus:border-lume-house/50"
                  />
                  <button
                    type="button"
                    disabled={!promoCode.trim()}
                    className="border border-lume-house/20 px-4 py-2 text-[12px] font-medium tracking-wider text-lume-house transition-colors hover:bg-lume-house/5 disabled:opacity-50"
                  >
                    APPLY
                  </button>
                </div>

                {error && (
                  <p className="mb-4 bg-red-50 p-3 text-[12px] font-medium text-red-700">
                    {error}
                  </p>
                )}
                <div className="mb-6 flex items-end justify-between">
                  <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-text-secondary">Subtotal</span>
                  <span className="font-display text-[32px] leading-none text-lume-house">
                    TT${(subtotalCents / 100).toFixed(2)}
                  </span>
                </div>
                <p className="mb-8 text-[12px] text-text-secondary">Shipping and taxes calculated at checkout.</p>

                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={loading || items.length === 0}
                    className="flex w-full items-center justify-center bg-lume-house px-6 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[#FAF9F5] transition-colors hover:bg-lume-house/90 active:scale-[0.98] disabled:opacity-50"
                    aria-busy={loading}
                  >
                    {loading ? 'Processing...' : 'Checkout'}
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button type="button" className="flex w-full items-center justify-center bg-lume-house px-6 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[#FAF9F5] transition-colors hover:bg-lume-house/90 active:scale-[0.98]">
                      Sign in to Checkout
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
