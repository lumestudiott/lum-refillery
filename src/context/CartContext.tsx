'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  priceCents: number;
  imageUrl?: string;
  unit: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'lume-shop-cart-v1';
export const MAX_CART_ITEM_QUANTITY = 20;
export const MAX_CART_UNIQUE_ITEMS = 50;
export const MAX_CART_TOTAL_QUANTITY = 200;

function clampQuantity(qty: number) {
  if (!Number.isFinite(qty)) return 1;
  return Math.min(Math.max(Math.trunc(qty), 1), MAX_CART_ITEM_QUANTITY);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      const nextQty = clampQuantity(qty);
      
      let nextItems;
      if (existing) {
        nextItems = prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: clampQuantity(i.quantity + nextQty) }
            : i
        );
      } else {
        if (prev.length >= MAX_CART_UNIQUE_ITEMS) {
          alert(`You can only have up to ${MAX_CART_UNIQUE_ITEMS} unique items in your cart.`);
          return prev;
        }
        nextItems = [...prev, { ...item, quantity: nextQty }];
      }

      const totalQty = nextItems.reduce((s, i) => s + i.quantity, 0);
      if (totalQty > MAX_CART_TOTAL_QUANTITY) {
        alert(`You can only have up to ${MAX_CART_TOTAL_QUANTITY} total items in your cart.`);
        return prev;
      }

      return nextItems;
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId);
      
      const nextItems = prev.map((i) =>
        i.productId === productId ? { ...i, quantity: clampQuantity(qty) } : i
      );
      
      const totalQty = nextItems.reduce((s, i) => s + i.quantity, 0);
      if (totalQty > MAX_CART_TOTAL_QUANTITY) {
        alert(`You can only have up to ${MAX_CART_TOTAL_QUANTITY} total items in your cart.`);
        return prev;
      }
      return nextItems;
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotalCents = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        totalItems,
        subtotalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
