'use client';

import React, { useMemo, useState, useTransition, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Search, ShoppingBasket, SlidersHorizontal, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard, { ShopProduct } from '@/components/shop/ProductCard';
import { useCart } from '@/context/CartContext';
import {
  SHOP_CATEGORIES,
  SHOP_SORT_OPTIONS,
  ShopCategoryId,
  ShopSortId,
  normalizeCategory,
  normalizeSort,
} from './shopConfig';

const CartDrawer = dynamic(() => import('@/components/shop/CartDrawer'), { ssr: false });
const ProductQuickViewModal = dynamic(
  () => import('@/components/shop/ProductQuickViewModal'),
  { ssr: false }
);

type ShopPageClientProps = {
  initialProducts: ShopProduct[];
  initialCategory: ShopCategoryId;
  initialQuery: string;
  initialSort: ShopSortId;
};

const PAGE_SIZE = 12;

function sortProducts(products: ShopProduct[], sort: ShopSortId) {
  const rows = [...products];
  switch (sort) {
    case 'price-asc':
      return rows.sort((a, b) => a.basePriceCents - b.basePriceCents);
    case 'price-desc':
      return rows.sort((a, b) => b.basePriceCents - a.basePriceCents);
    case 'name-asc':
      return rows.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return rows;
  }
}

export default function ShopPageClient({
  initialProducts,
  initialCategory,
  initialQuery,
  initialSort,
}: ShopPageClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { totalItems, openCart } = useCart();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState(initialSort);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [dropdownLeft, setDropdownLeft] = useState<number>(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterCategory = (id: string, event?: React.MouseEvent) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredCategory(id);
    
    if (event) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const container = (event.currentTarget as HTMLElement).closest('nav')?.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        setDropdownLeft(rect.left - containerRect.left);
      } else {
        setDropdownLeft(rect.left);
      }
    }
  };

  const handleMouseLeaveCategory = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopProduct | null>(null);

  const currentCategory = SHOP_CATEGORIES.find((category) => category.id === activeCategory) ?? SHOP_CATEGORIES[0];
  const currentSort = SHOP_SORT_OPTIONS.find((option) => option.id === sortBy) ?? SHOP_SORT_OPTIONS[0];

  const updateUrl = (next: {
    category?: ShopCategoryId;
    query?: string;
    sort?: ShopSortId;
  }) => {
    const category = normalizeCategory(next.category ?? activeCategory);
    const query = next.query ?? searchQuery;
    const sort = normalizeSort(next.sort ?? sortBy);
    const params = new URLSearchParams();

    if (category !== 'all') params.set('category', category);
    if (query.trim()) params.set('q', query.trim());
    if (sort !== 'featured') params.set('sort', sort);

    startTransition(() => {
      router.replace(`/shop${params.size ? `?${params.toString()}` : ''}`, {
        scroll: false,
      });
    });
  };

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSearchUrl = useCallback((query: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      updateUrl({ query });
    }, 400);
  }, [activeCategory, sortBy]);

  const selectCategory = (category: ShopCategoryId) => {
    setActiveCategory(category);
    setCurrentPage(1);
    setIsFilterOpen(false);
    updateUrl({ category });
  };

  const selectSort = (sort: ShopSortId) => {
    setSortBy(sort);
    setCurrentPage(1);
    setIsSortOpen(false);
    updateUrl({ sort });
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? initialProducts.filter((product) => {
          const haystack = [
            product.name,
            product.description,
            product.category,
            product.sourcingOrigin,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(query);
        })
      : initialProducts;

    return sortProducts(filtered, sortBy);
  }, [initialProducts, searchQuery, sortBy]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const visibleProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-canvas text-lume-house selection:bg-lume-house selection:text-canvas">
      <Header />

      <main className="pt-[100px]">
        <div 
          className="sticky top-[100px] z-30 border-b border-lume-house/10 bg-canvas/95 backdrop-blur-xl"
        >
          <div className="relative mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-16">
            <div className="relative hidden min-w-0 flex-1 lg:block">
              <nav aria-label="Shop categories" className="flex items-center gap-6 overflow-x-auto xl:gap-8 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {SHOP_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className="relative shrink-0 py-4 xl:py-6"
                    onMouseEnter={(e) => handleMouseEnterCategory(category.id, e)}
                    onMouseLeave={handleMouseLeaveCategory}
                  >
                    <button
                      type="button"
                      onClick={() => selectCategory(category.id)}
                      aria-current={activeCategory === category.id ? 'page' : undefined}
                      className={`relative whitespace-nowrap shrink-0 py-1 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-300 ${
                        activeCategory === category.id
                          ? 'text-lume-house'
                          : 'text-text-secondary hover:text-lume-house'
                      }`}
                    >
                      {category.label}
                      {category.subcategories.length > 0 && (
                        <ChevronDown className={`ml-1 inline-block h-3 w-3 transition-transform duration-200 ${hoveredCategory === category.id ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                      )}
                      <span
                        className={`absolute -bottom-2 left-0 right-0 h-[1.5px] origin-left bg-lume-house transition-transform duration-300 ${
                          activeCategory === category.id || hoveredCategory === category.id ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </nav>

              {/* Dropdown Menu */}
              {hoveredCategory && SHOP_CATEGORIES.find(c => c.id === hoveredCategory)?.subcategories.length! > 0 && (
                <div 
                  className="absolute top-full z-50 w-[240px] animate-in fade-in slide-in-from-top-2 duration-200 hidden lg:block"
                  style={{ left: `${dropdownLeft}px` }}
                  onMouseEnter={() => handleMouseEnterCategory(hoveredCategory)}
                  onMouseLeave={handleMouseLeaveCategory}
                >
                  <div className="inline-flex w-full flex-col gap-1 rounded-b-xl border border-t-0 border-lume-house/10 bg-canvas p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]">
                    {SHOP_CATEGORIES.find(c => c.id === hoveredCategory)?.subcategories.map((sub) => (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => {
                          selectCategory(hoveredCategory as ShopCategoryId);
                          setHoveredCategory(null);
                        }}
                        className="rounded-lg px-4 py-2.5 text-left text-[14px] font-medium text-lume-house/80 transition-all hover:bg-lume-house/5 hover:text-lume-house"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 py-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-lume-house lg:hidden"
              aria-haspopup="dialog"
              aria-expanded={isFilterOpen}
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
              Refine
            </button>

            <div className="flex items-center gap-5 border-l border-lume-house/10 py-5 pl-5 sm:gap-8 sm:py-6 sm:pl-10">
              <label className="relative hidden sm:block">
                <span className="sr-only">Search products</span>
                <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={1.5} />
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    const next = event.target.value;
                    setSearchQuery(next);
                    setCurrentPage(1);
                    debouncedSearchUrl(next);
                  }}
                  placeholder="Search"
                  className="w-36 bg-transparent py-1 pl-6 text-[13px] text-lume-house outline-none placeholder:text-text-secondary focus:w-48 focus:border-b focus:border-lume-house/30"
                />
              </label>
              <button
                type="button"
                onClick={openCart}
                className="group relative text-text-secondary transition-colors hover:text-lume-house"
                aria-label={`Open cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
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

        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-16 lg:py-20">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            <section className="min-w-0 flex-1" aria-labelledby="shop-heading">
              <div className="mb-8 flex flex-col gap-6 border-b border-lume-house/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="mb-4 block text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">
                    The Shop
                  </span>
                  <h1 id="shop-heading" className="font-display text-4xl font-normal leading-none tracking-tight text-lume-house md:text-5xl lg:text-[64px]">
                    {currentCategory.label}
                  </h1>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <label className="relative block sm:hidden">
                    <span className="sr-only">Search products</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={1.5} />
                    <input
                      value={searchQuery}
                      onChange={(event) => {
                        const next = event.target.value;
                        setSearchQuery(next);
                        setCurrentPage(1);
                        debouncedSearchUrl(next);
                      }}
                      placeholder="Search products"
                      className="h-11 w-full border border-lume-house/10 bg-white px-10 text-[14px] outline-none focus:border-lume-house/40"
                    />
                  </label>

                  <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    <span>{filteredProducts.length} items</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSortOpen((open) => !open)}
                        className="flex items-center gap-2 border-b border-lume-house/20 bg-transparent pb-1 font-bold tracking-wide text-lume-house outline-none transition-colors hover:border-lume-house focus-visible:ring-2 focus-visible:ring-lume-house/30"
                        aria-haspopup="listbox"
                        aria-expanded={isSortOpen}
                      >
                        {currentSort.label}
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isSortOpen && (
                        <div
                          role="listbox"
                          aria-label="Sort products"
                          className="absolute right-0 top-full z-50 mt-3 flex w-[260px] flex-col gap-1 rounded-xl border border-lume-house/10 bg-canvas p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-150"
                        >
                          {SHOP_SORT_OPTIONS.map((option) => (
                            <button
                              type="button"
                              role="option"
                              aria-selected={sortBy === option.id}
                              key={option.id}
                              onClick={() => selectSort(option.id)}
                              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all hover:bg-lume-house/5 hover:text-lume-house ${
                                sortBy === option.id ? 'text-lume-house' : 'text-lume-house/70'
                              }`}
                            >
                              <span className="flex w-4 shrink-0 justify-center">
                                {sortBy === option.id && <Check className="h-4 w-4 text-lume-house" strokeWidth={2} />}
                              </span>
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {visibleProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <ShoppingBasket className="mb-6 h-10 w-10 text-text-secondary/30" strokeWidth={1} />
                  <p className="text-[14px] font-medium uppercase tracking-[0.15em] text-lume-house">
                    No curations found
                  </p>
                  <p className="mt-3 max-w-md text-[13px] font-light leading-relaxed text-text-secondary">
                    Try another category or clear your search to keep browsing.
                  </p>
                  {(searchQuery || activeCategory !== 'all' || sortBy !== 'featured') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSortBy('featured');
                        selectCategory('all');
                      }}
                      className="mt-6 border border-lume-house/20 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-lume-house transition-colors hover:bg-lume-house hover:text-white"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-14 xl:gap-y-20">
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onQuickView={() => setQuickViewProduct(product)}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-16 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage(p => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 1}
                        className="flex h-10 items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-lume-house disabled:opacity-30 disabled:hover:text-text-secondary"
                      >
                        Prev
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            type="button"
                            key={page}
                            onClick={() => {
                              setCurrentPage(page);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] transition-colors ${
                              currentPage === page
                                ? 'bg-lume-house text-canvas'
                                : 'text-lume-house hover:bg-lume-house/10'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage(p => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages}
                        className="flex h-10 items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-lume-house disabled:opacity-30 disabled:hover:text-text-secondary"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Shop filters">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setIsFilterOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto bg-canvas p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-lume-house">Refine</h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="p-2 text-text-secondary hover:text-lume-house"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CategorySidebar activeCategory={activeCategory} onSelectCategory={selectCategory} />
          </div>
        </div>
      )}

      <Footer />
      <CartDrawer />
      {quickViewProduct && (
        <ProductQuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}

function CategorySidebar({
  activeCategory,
  onSelectCategory,
}: {
  activeCategory: ShopCategoryId;
  onSelectCategory: (category: ShopCategoryId) => void;
}) {
  const currentCategory = SHOP_CATEGORIES.find((category) => category.id === activeCategory) ?? SHOP_CATEGORIES[0];

  return (
    <div>
      <div className="mb-10">
        <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary">
          {currentCategory.label}
        </h2>
        <div className="flex flex-col space-y-3 text-[13px] font-light text-lume-house/70">
          {SHOP_CATEGORIES.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`text-left transition-colors hover:text-lume-house ${
                activeCategory === category.id ? 'font-medium text-lume-house' : ''
              }`}
              aria-current={activeCategory === category.id ? 'page' : undefined}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {currentCategory.subcategories.length > 0 && (
        <div className="border-t border-lume-house/10 pt-8">
          <h3 className="mb-5 text-[11px] font-medium uppercase tracking-[0.15em] text-lume-house">
            Collections
          </h3>
          <div className="flex flex-col space-y-3 text-[13px] font-light text-lume-house/70">
            {currentCategory.subcategories.map((sub) => (
              <button
                type="button"
                key={sub}
                onClick={() => onSelectCategory(currentCategory.id)}
                className="text-left transition-colors hover:text-lume-house"
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
