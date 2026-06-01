'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotalCents, totalItems } = useCart();
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
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
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-canvas shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
              <h2 className="font-display text-[20px] font-medium tracking-tight">
                Your Cart {totalItems > 0 && <span className="text-text-secondary">({totalItems})</span>}
              </h2>
              <button
                onClick={closeCart}
                className="rounded-full p-2 text-text-secondary hover:bg-black/[0.04] hover:text-text-primary"
              >
                <X className="h-5 w-5" />
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
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-canvas">
                        {item.imageUrl && (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="text-[14px] font-semibold leading-tight text-text-primary">{item.name}</h3>
                        <p className="mt-0.5 text-[12px] text-text-secondary">
                          ${(item.priceCents / 100).toFixed(2)} / {item.unit}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-black/[0.08]">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1.5 text-text-secondary hover:text-text-primary"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-[20px] text-center text-[13px] font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1.5 text-text-secondary hover:text-text-primary"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-[12px] font-medium text-text-secondary hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="border-t border-black/[0.06] bg-white px-6 py-5">
                {error && (
                  <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
                    {error}
                  </p>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[14px] font-medium text-text-secondary">Subtotal</span>
                  <span className="text-[20px] font-semibold tracking-tight text-text-primary">
                    ${(subtotalCents / 100).toFixed(2)}
                  </span>
                </div>
                <p className="mb-4 text-[12px] text-text-secondary">Shipping and taxes calculated at checkout.</p>

                {isSignedIn ? (
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="btn-pill flex w-full items-center justify-center gap-2 bg-lume-house px-6 py-3.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black active:scale-[0.97] disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Checkout'}
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="btn-pill flex w-full items-center justify-center gap-2 bg-lume-house px-6 py-3.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black active:scale-[0.97]">
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
