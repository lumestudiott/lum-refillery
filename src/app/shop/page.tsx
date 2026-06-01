'use client';

import React, { useState, useMemo } from 'react';
import { usePaginatedQuery } from 'convex/react';
import { Search, ShoppingBasket, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard, { ShopProduct } from '@/components/shop/ProductCard';
import ProductQuickViewModal from '@/components/shop/ProductQuickViewModal';
import CartDrawer from '@/components/shop/CartDrawer';
import { useCart } from '@/context/CartContext';
import { api } from '../../../convex/_generated/api';

const CATEGORIES = [
  { 
    id: 'all', 
    label: 'All',
    subcategories: ['Featured Curations', 'New Arrivals', 'Best Sellers']
  },
  {
    id: 'hauls',
    label: 'Hauls',
    subcategories: []
  },
  {
    id: 'new-seasonal',
    label: 'New & Seasonal',
    subcategories: ['New', 'Best Sellers', 'Picnic', 'AAPI Heritage Month', 'Spring Favorites']
  },
  { 
    id: 'produce', 
    label: 'Produce',
    subcategories: ['Produce Boxes', 'New & Peak Season', 'Fruits', 'Vegetables', 'Leafy Greens', 'Herbs & Aromatics', 'Flowers & Decoratives', 'Frozen']
  },
  { 
    id: 'protein', 
    label: 'Meat & Seafood',
    subcategories: ['Featured Meat & Seafood', 'Poultry', 'Beef', 'Pork', 'Lamb & Game Meat', 'Seafood', 'Bacon & Sausage', 'Charcuterie & Deli', 'Plant-Based Proteins']
  },
  { 
    id: 'dairy', 
    label: 'Dairy & Eggs',
    subcategories: ['Featured Dairy & Eggs', 'Milk & Cream', 'Eggs & Butter', 'Yogurt & Cultured Dairy', 'Cheese', 'Desserts', 'Plant-Based']
  },
  {
    id: 'bakery',
    label: 'Bakery',
    subcategories: ['Featured Bakery', 'Breads & Loaves', 'Bagels & Rolls', 'Pastries & Sweets', 'Tortillas & Wraps']
  },
  { 
    id: 'meals', 
    label: 'Easy Meals',
    subcategories: ['Featured Easy Meals', 'Entrées & Breakfast', 'Salads, Sides & Starters', 'Soups & Broths', 'Kits & Recipe Bundles']
  },
  { 
    id: 'beverage', 
    label: 'Drinks',
    subcategories: ['Featured Drinks', 'Water & Seltzer', 'Juice', 'Kombucha', 'Functional Sodas', 'Coffee', 'Tea', 'Cocoa & Hot Chocolate', 'Non-Alcoholic']
  },
  {
    id: 'pantry',
    label: 'Pantry',
    subcategories: ['Featured Pantry Items', 'Condiments & Sauces', 'Oils & Vinegar', 'Pasta & Noodles', 'Grains & Beans', 'Spreads & Nut Butters', 'Snacks', 'Sweets & Chocolate', 'Pickled & Preserved', 'Breakfast & Cereals', 'Cooking & Baking', 'Tinned Fish', 'Broths & Tomatoes']
  },
  {
    id: 'savings',
    label: 'Savings',
    subcategories: ['On Sale', 'Everyday Savings', 'Boxes and Bundles']
  }
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Featured');
  const [quickViewProduct, setQuickViewProduct] = useState<ShopProduct | null>(null);
  const { totalItems, openCart } = useCart();

  const { results: products, status, loadMore } = usePaginatedQuery(
    api.products.listActive,
    { category: activeCategory === 'all' ? undefined : activeCategory },
    { initialNumItems: 12 }
  );

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-lume-house selection:bg-lume-house selection:text-canvas">
      <Header />

      <main className="pt-[116px]">
        {/* Luxury Top Navigation Bar */}
        <div className="border-b border-lume-house/10 bg-[#FAF9F5] sticky top-[116px] z-30 backdrop-blur-xl bg-opacity-90">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 lg:px-16">
            <div className="scrollbar-hide flex items-center gap-8 overflow-x-auto lg:overflow-visible">
              {CATEGORIES.map((c) => (
                <div 
                  key={c.id} 
                  className="relative group py-6"
                  onMouseEnter={() => setHoveredCategory(c.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <button
                    onClick={() => setActiveCategory(c.id)}
                    className={`relative shrink-0 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-500 py-1 ${
                      activeCategory === c.id
                        ? 'text-lume-house'
                        : 'text-text-secondary hover:text-lume-house'
                    }`}
                  >
                    {c.label}
                    <span 
                      className={`absolute -bottom-2 left-0 right-0 h-[1.5px] bg-lume-house transition-transform duration-500 origin-left ${
                        activeCategory === c.id || hoveredCategory === c.id ? 'scale-x-100' : 'scale-x-0'
                      }`} 
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {hoveredCategory === c.id && c.subcategories.length > 0 && (
                    <div className="absolute top-[100%] left-0 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] rounded-b-xl border border-lume-house/5 py-6 px-8 flex flex-col gap-4">
                        {c.subcategories.map((sub) => (
                          <button 
                            key={sub}
                            onClick={() => setActiveCategory(c.id)}
                            className="text-left text-[14px] font-medium text-lume-house/80 hover:text-lume-house transition-colors"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden items-center gap-8 sm:flex pl-10 border-l border-lume-house/10 py-6">
              <button className="text-text-secondary hover:text-lume-house transition-colors">
                <Search className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={openCart}
                className="relative text-text-secondary hover:text-lume-house transition-colors group"
                aria-label="Open cart"
              >
                <ShoppingBasket className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -right-2.5 -top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-lume-house text-[9px] font-bold text-[#FAF9F5] shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-8 py-16 lg:px-16 lg:py-24">
          <div className="flex flex-col gap-16 lg:flex-row">
            
            {/* Minimalist Left Sidebar */}
            <aside className="w-full shrink-0 lg:w-48 lg:pt-2">
              <div className="mb-12">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary mb-6">
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Collections'}
                </h2>
                <div className="flex flex-col space-y-4 text-[13px] font-light text-lume-house/70">
                  <button className="text-left font-medium text-lume-house transition-colors">
                    {activeCategory === 'all' 
                      ? 'Shop All' 
                      : `All ${CATEGORIES.find((c) => c.id === activeCategory)?.label}`}
                  </button>
                  {CATEGORIES.find((c) => c.id === activeCategory)?.subcategories.map((sub) => (
                    <button key={sub} className="text-left hover:text-lume-house transition-colors">
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-lume-house/10 pt-8">
                <button className="flex w-full items-center justify-between text-[11px] font-medium uppercase tracking-[0.15em] text-lume-house group">
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Refine
                  </div>
                  <ChevronDown className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-y-0.5" strokeWidth={1.5} />
                </button>
              </div>
            </aside>

            {/* Main Editorial Grid Area */}
            <div className="flex-1">
              <div className="mb-12 flex flex-col gap-6 border-b border-lume-house/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary mb-4">
                    The Shop
                  </span>
                  <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] font-normal leading-none tracking-tight text-lume-house">
                    {CATEGORIES.find((c) => c.id === activeCategory)?.label || 'All Curations'}
                  </h1>
                </div>
                
                <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  <span>Sort By:</span>
                  <div className="relative">
                    <button 
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="flex items-center gap-2 bg-transparent text-lume-house font-bold tracking-wide outline-none cursor-pointer border-b border-lume-house/20 pb-1 hover:border-lume-house transition-colors"
                    >
                      {sortBy}
                      <svg className={`h-3 w-3 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Custom Premium Dropdown Menu */}
                    {isSortOpen && (
                      <div className="absolute top-[100%] mt-2 left-0 w-[180px] bg-white border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-1.5 rounded-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                        {['Featured', 'Price: Low to High', 'Price: High to Low'].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setIsSortOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-[13px] font-medium tracking-normal normal-case flex items-center gap-2.5 transition-all text-black/70 hover:bg-[#F7F7F7] hover:text-black rounded-xl"
                          >
                            <span className="w-3.5 flex justify-center shrink-0">
                              {sortBy === option && (
                                <svg className="h-3.5 w-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            <span>{option}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              {products.length === 0 && status === "LoadingFirstPage" ? (
                <div className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] animate-pulse bg-[#E8E6E1] rounded-[4px]" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <ShoppingBasket className="h-10 w-10 text-text-secondary/30 mb-6" strokeWidth={1} />
                  <p className="text-[14px] font-medium tracking-[0.15em] uppercase text-lume-house">No curations found</p>
                  <p className="mt-3 text-[13px] font-light text-text-secondary max-w-md">
                    We currently do not have items matching your selection. Please explore our other collections.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-14 xl:gap-y-20">
                    {filtered.map((product) => (
                      <ProductCard 
                        key={product._id} 
                        product={product as ShopProduct} 
                        onQuickView={() => setQuickViewProduct(product as ShopProduct)}
                      />
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {status === "CanLoadMore" && (
                    <div className="mt-20 flex justify-center">
                      <button
                        onClick={() => loadMore(12)}
                        className="rounded-full border border-lume-house/20 px-8 py-3 text-[12px] font-medium tracking-[0.15em] uppercase text-lume-house transition-colors hover:bg-lume-house hover:text-white"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                  {status === "LoadingMore" && (
                    <div className="mt-20 flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-lume-house border-t-transparent" />
                    </div>
                  )}
                </>
              )}
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      {quickViewProduct && (
        <ProductQuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </div>
  );
}
