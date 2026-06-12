'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Search, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const indexEntries = [
  { name: 'Sunny Side Honey', category: 'Honey', location: 'Catskills, NY', description: 'Third-generation apiary maintaining over 200 hives across native wildflower fields.', page: 1 },
  { name: 'Midnight Roasters', category: 'Coffee', location: 'Brooklyn, NY', description: 'Small-batch single origin roasters using a vintage 1950s Probat.', page: 2 },
  { name: 'Golden Grove Preserves', category: 'Preserves', location: 'Hudson Valley, NY', description: 'Small-batch jams and chutneys from heirloom fruit.', page: 3 },
  { name: 'Stonemill Bakehouse', category: 'Baked Goods', location: 'Asheville, NC', description: 'Sourdough and heritage grain loaves baked fresh daily.', page: 3 },
  { name: 'Verde Ferments', category: 'Ferments', location: 'Portland, OR', description: 'Live-culture kimchi and krauts from organic produce.', page: 3 },
  { name: 'Copper Kettle Syrups', category: 'Syrups', location: 'Vermont', description: 'Pure maple and infused syrups tapped by hand each spring.', page: 3 },
];

export default function SmallMakersFlipbookPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalPages = 4; // 0=Cover, 1=Honey, 2=Coffee, 3=Index, 4=Back

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const nextPage = () => {
    if (currentPage < totalPages && !isSearchOpen) setCurrentPage(c => c + 1);
  };
  const prevPage = () => {
    if (currentPage > 0 && !isSearchOpen) setCurrentPage(c => c - 1);
  };

  const isOpen = currentPage > 0;

  const filteredEntries = indexEntries.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-text-primary flex flex-col">
      <Header />
      <main className="flex-1 w-full flex flex-col items-center justify-center relative" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <style>{`
          .book-viewport {
            perspective: 3000px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            position: relative;
          }
          .book-pages {
            position: relative;
            transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .book-pages.closed { transform: translateX(0); }
          .book-pages.open { transform: translateX(50%); }

          .flip-sheet {
            transform-style: preserve-3d;
            transform-origin: left center;
            transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: absolute;
            inset: 0;
          }
          .flip-sheet.turned { transform: rotateY(-180deg); }
          .sheet-face {
            position: absolute;
            inset: 0;
            backface-visibility: hidden;
            overflow: hidden;
          }
          .sheet-back { transform: rotateY(180deg); }

          .sheet-front::after {
            content: '';
            position: absolute;
            top: 0; bottom: 0; left: 0;
            width: 25px;
            background: linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 100%);
            z-index: 40;
            pointer-events: none;
          }
          .sheet-back::after {
            content: '';
            position: absolute;
            top: 0; bottom: 0; right: 0;
            width: 25px;
            background: linear-gradient(to left, rgba(0,0,0,0.1) 0%, transparent 100%);
            z-index: 40;
            pointer-events: none;
          }

          .text-outline {
            -webkit-text-stroke: 2px currentColor;
            color: transparent;
          }
          .drop-cap::first-letter {
            float: left;
            font-size: 3.2rem;
            line-height: 0.8;
            padding-right: 0.5rem;
            padding-top: 0.1rem;
            font-family: var(--font-display);
            font-weight: bold;
            color: var(--color-lume-accent, #6B7F3B);
          }

          @media (max-width: 768px) {
            .book-pages.open { transform: translateX(0); }
          }
        `}</style>

        {/* BOTTOM CONTROL BAR */}
        <div className="absolute bottom-8 w-full px-8 lg:px-12 flex justify-between items-center pointer-events-none z-40">
          {/* Left: Search Button */}
          <div className="w-1/3 flex justify-start pointer-events-auto">
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen && currentPage === 0) setCurrentPage(1); 
              }} 
              className={`flex items-center gap-3 transition-colors ${isSearchOpen ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] hidden sm:block">
                Search Directory
              </span>
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Pagination */}
          <div className="flex-1 flex flex-col items-center gap-3 pointer-events-auto">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">
              {currentPage === 0 ? 'Cover' : currentPage === totalPages ? 'Back' : `Spread ${currentPage}`}
            </p>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentPage ? 'w-4 h-1 bg-text-primary' : 'w-1 h-1 bg-text-primary/20 hover:bg-text-primary/40'
                  }`}
                  aria-label={`Go to page ${i}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Empty for flex balance */}
          <div className="w-1/3"></div>
        </div>

        {/* ── SEARCH OVERLAY (Minimal Light Mode styling matching the site) ── */}
        <div 
          className={`absolute inset-0 bg-canvas z-[100] transition-opacity duration-300 flex flex-col p-8 lg:p-12 ${
            isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button onClick={() => setIsSearchOpen(false)} className="absolute top-8 right-8 text-text-secondary hover:text-text-primary transition-colors z-20">
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-[800px] w-full mx-auto h-full flex flex-col pt-12 lg:pt-20">
            {/* Header & Input */}
            <div className="mb-16 text-center">
               <h2 className="font-display text-[48px] lg:text-[64px] text-text-primary leading-none tracking-tight mb-8">Directory Search</h2>
               <div className="relative w-full max-w-[500px] mx-auto">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-text-primary/30" />
                  <input 
                    type="text" 
                    placeholder="Search by maker, category, or region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-black/10 pl-8 pr-4 py-3 text-[15px] lg:text-[16px] text-text-primary placeholder:text-text-primary/30 focus:outline-none focus:border-text-primary/30 transition-colors"
                  />
               </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 pb-20">
                  {filteredEntries.map((entry, idx) => (
                     <div 
                       key={idx} 
                       onClick={() => { setCurrentPage(entry.page); setIsSearchOpen(false); setSearchQuery(''); }}
                       className="group cursor-pointer flex flex-col"
                     >
                        <div className="flex justify-between items-baseline mb-3">
                          <h3 className="font-display text-[24px] lg:text-[28px] text-text-primary">{entry.name}</h3>
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-secondary">Page {entry.page}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-primary bg-black/5 px-2 py-1 rounded-sm">{entry.category}</span>
                          <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary">{entry.location}</span>
                        </div>
                        <p className="text-[13px] leading-[1.6] text-text-secondary">{entry.description}</p>
                     </div>
                  ))}
                  {filteredEntries.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-text-secondary">
                      <p className="text-[16px]">No makers found matching "{searchQuery}"</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* ── THE BOOK VIEWPORT ── */}
        <div className="book-viewport pt-12 pb-24 px-4 lg:px-12 relative z-10">
          {/* ── THE BOOK ITSELF ── */}
          <div
            className={`book-pages ${isOpen ? 'open' : 'closed'}`}
            style={{
              width: 'min(94vw, 580px)',
              height: 'min(82vh, 840px)',
              boxShadow: '0 40px 100px -25px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.03)',
            }}
          >

            {/* ── BASE: Back Cover ── */}
            <div className="absolute inset-0 bg-[#1A1A1A] flex flex-col items-center justify-center text-center p-10 lg:p-16 cursor-pointer" onClick={prevPage}>
              <div className="absolute inset-0 opacity-[0.07]">
                <img src="/magazine/cover.png" alt="" className="w-full h-full object-cover grayscale" />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 mb-8 font-medium">End of Issue 01</p>
                <h3 className="font-display text-[44px] lg:text-[72px] leading-[0.9] text-white uppercase tracking-tight mb-6">
                  Support<br/>The <span className="italic" style={{ color: 'var(--color-lume-accent, #6B7F3B)' }}>Makers</span>
                </h3>
                <div className="w-12 h-[1px] bg-white/15 mb-8" />
                <p className="text-[14px] leading-[1.6] text-white/50 mb-10 max-w-[280px]">
                  Every product tells a story of craftsmanship and dedication. Shop small-batch goods made with intention.
                </p>
                <Link href="/shop" className="group inline-flex items-center gap-3 border border-white/20 hover:border-white px-8 py-4 transition-all hover:bg-white hover:text-[#1A1A1A]">
                  <span className="text-[12px] uppercase tracking-[0.2em] font-medium text-white group-hover:text-[#1A1A1A]">Shop The Collection</span>
                  <ArrowRight className="h-4 w-4 text-white group-hover:text-[#1A1A1A] transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
            </div>

            {/* ── SHEET 4: Index Right → Fin ── */}
            <div className={`flip-sheet z-[5] ${currentPage > 3 ? 'turned' : ''}`}>
              <div className="sheet-face sheet-front bg-canvas cursor-pointer" onClick={() => currentPage === 3 && nextPage()}>
                <div className="w-full h-full p-8 lg:p-12 flex flex-col">
                  <div className="w-full h-full border border-black/5 p-6 lg:p-8 flex flex-col">
                    <h3 className="font-display text-[24px] uppercase tracking-tight mb-8">Directory <span className="text-lume-accent italic">Cont.</span></h3>
                    
                    <div className="flex-1 flex flex-col gap-6">
                      {indexEntries.slice(3).map((entry, i) => (
                        <div key={i} className="flex gap-4 items-baseline border-b border-black/5 pb-4">
                          <span className="font-display text-[18px] text-lume-accent">0{i+4}</span>
                          <div className="flex-1">
                            <h4 className="font-display text-[20px] uppercase">{entry.name}</h4>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary mt-1">{entry.category} · {entry.location}</p>
                          </div>
                          <span className="text-[12px] font-medium">Pg {entry.page}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-8 border-t border-black/10 text-center">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-text-primary/40">Next Issue Dropping Fall 2026</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sheet-face sheet-back bg-[#1A1A1A] cursor-pointer flex items-center justify-center" onClick={() => currentPage === 4 && prevPage()}>
                <span className="font-display text-[120px] lg:text-[160px] text-white/[0.03] text-outline uppercase">Fin</span>
              </div>
            </div>

            {/* ── SHEET 3: Coffee Right → Index Left ── */}
            <div className={`flip-sheet z-10 ${currentPage > 2 ? 'turned' : ''}`}>
              <div className="sheet-face sheet-front bg-canvas cursor-pointer" onClick={() => currentPage === 2 && nextPage()}>
                <div className="w-full h-full flex flex-col">
                  <div className="relative h-[55%] w-full overflow-hidden">
                    <img src="/magazine/coffee-product.png" alt="Coffee tasting" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 lg:bottom-8 left-8 lg:left-10 right-8 z-10">
                      <h3 className="font-display text-[36px] lg:text-[52px] leading-[0.9] text-white uppercase tracking-tight">The<br/>Process</h3>
                    </div>
                    <div className="absolute top-4 right-6 z-10">
                      <span className="font-display text-[72px] lg:text-[100px] leading-none text-white/10 text-outline">02</span>
                    </div>
                  </div>
                  <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-lume-accent font-medium mb-4">Single Origin · Small Batch</p>
                    <p className="text-[13px] lg:text-[15px] leading-[1.8] text-text-secondary drop-cap">
                      Every batch is roasted to order in their refurbished 1950s Probat roaster. They source directly from single-origin farms across Ethiopia and Colombia, coaxing out the natural sweetness in every bean without over-roasting.
                    </p>
                  </div>
                </div>
              </div>
              <div className="sheet-face sheet-back bg-white cursor-pointer" onClick={() => currentPage === 3 && prevPage()}>
                <div className="w-full h-full p-8 lg:p-12 flex flex-col">
                  <div className="mb-10 text-center">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-lume-accent font-bold mb-4">Vol. 01</p>
                    <h2 className="font-display text-[56px] leading-none uppercase tracking-tighter">Index</h2>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-6">
                    {indexEntries.slice(0, 3).map((entry, i) => (
                      <div key={i} className="flex gap-4 items-baseline border-b border-black/5 pb-4">
                        <span className="font-display text-[18px] text-lume-accent">0{i+1}</span>
                        <div className="flex-1">
                          <h4 className="font-display text-[20px] uppercase">{entry.name}</h4>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary mt-1">{entry.category} · {entry.location}</p>
                        </div>
                        <span className="text-[12px] font-medium">Pg {entry.page}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── SHEET 2: Honey Right → Coffee Left ── */}
            <div className={`flip-sheet z-20 ${currentPage > 1 ? 'turned' : ''}`}>
              <div className="sheet-face sheet-front bg-white cursor-pointer" onClick={() => currentPage === 1 && nextPage()}>
                <div className="w-full h-full flex flex-col p-6 lg:p-10">
                  <div className="mb-4 lg:mb-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-lume-accent font-medium mb-2">Artisan Feature</p>
                    <h3 className="font-display text-[38px] lg:text-[56px] leading-[0.9] text-text-primary uppercase tracking-tight">Sunny Side<br/>Honey</h3>
                  </div>
                  <div className="flex gap-3 mb-4 lg:mb-8 h-[160px] lg:h-[260px]">
                    <div className="w-[60%] h-full relative overflow-hidden group">
                      <img src="/magazine/honey-product.png" alt="Honey jars" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="w-[40%] h-full flex flex-col gap-3">
                      <div className="h-1/2 w-full bg-[#E7AD47] flex items-center justify-center">
                        <span className="text-white text-[11px] lg:text-[12px] font-medium uppercase tracking-[0.2em] text-center">100%<br/>Raw</span>
                      </div>
                      <div className="h-1/2 w-full relative overflow-hidden">
                        <img src="/magazine/honey-farm.png" alt="Apiary" className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-end">
                    <p className="text-[12px] lg:text-[14px] leading-[1.8] text-text-secondary lg:columns-2 gap-6 drop-cap">
                      A third-generation apiary maintaining over 200 hives across native wildflower fields. Their commitment to ethical beekeeping ensures healthy colonies and incredibly complex, floral honey profiles that change with the seasons. We partner directly with the founders to bring their harvest to your pantry.
                    </p>
                  </div>
                </div>
              </div>
              <div className="sheet-face sheet-back bg-[#1A1A1A] cursor-pointer overflow-hidden" onClick={() => currentPage === 2 && prevPage()}>
                <div className="w-full h-full relative">
                  <img src="/magazine/coffee-portrait.png" alt="Coffee roaster" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/20 to-[#1A1A1A]/50" />
                  <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-12 z-10">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-lume-accent font-medium mb-4">Supplier Profile</p>
                      <h2 className="font-display text-[48px] lg:text-[72px] text-white leading-[0.85] uppercase tracking-tight">
                        Midnight<br/>Roasters
                      </h2>
                    </div>
                    <div className="bg-white/[0.07] backdrop-blur-md border border-white/10 p-5 lg:p-6 max-w-[260px]">
                      <p className="text-white/90 text-[13px] lg:text-[15px] leading-[1.5] italic font-display">
                        "We coax out the natural sweetness in every bean without over-roasting."
                      </p>
                      <p className="text-white/40 text-[9px] uppercase tracking-widest mt-3 font-medium">— Marcus Chen, Founder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SHEET 1: Cover → Honey Left ── */}
            <div className={`flip-sheet z-30 ${currentPage > 0 ? 'turned' : ''}`}>
              <div className="sheet-face sheet-front bg-canvas cursor-pointer overflow-hidden" onClick={() => currentPage === 0 && nextPage()}>
                <div className="w-full h-full relative">
                  <div className="absolute inset-4 lg:inset-6 z-10 overflow-hidden">
                    <img src="/magazine/cover.png" alt="Small Makers" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-4 lg:h-6 bg-canvas z-20 flex items-center justify-between px-4 lg:px-6">
                    <span className="text-[8px] lg:text-[9px] font-medium uppercase tracking-[0.3em] text-text-primary/40">Lumë Refillery</span>
                    <span className="text-[8px] lg:text-[9px] font-medium uppercase tracking-[0.3em] text-text-primary/40">Vol. 01</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 z-20 bg-canvas">
                    <div className="px-4 lg:px-6 py-3 lg:py-5">
                      <h1 className="font-display text-[48px] lg:text-[80px] text-text-primary leading-[0.85] tracking-tighter uppercase">
                        Small<br/><span className="italic text-lume-accent">Makers.</span>
                      </h1>
                      <p className="text-[9px] lg:text-[11px] text-text-secondary uppercase tracking-[0.15em] mt-2 font-medium">
                        Independent artisans crafting the future of food.
                      </p>
                    </div>
                  </div>
                  <div className={`absolute top-1/2 right-3 -translate-y-1/2 z-30 transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg animate-pulse">
                      <ChevronRight className="h-4 w-4 text-text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="sheet-face sheet-back cursor-pointer overflow-hidden" onClick={() => currentPage === 1 && prevPage()}>
                <div className="w-full h-full relative bg-canvas">
                  <div className="absolute top-0 right-0 w-[55%] h-[55%] opacity-[0.04]" style={{
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, var(--color-lume-accent, #6B7F3B) 8px, var(--color-lume-accent, #6B7F3B) 16px)'
                  }} />
                  <div className="absolute -top-2 left-4 lg:left-8 z-20">
                    <span className="font-display text-[130px] lg:text-[200px] leading-none text-text-primary text-outline">01</span>
                  </div>
                  <div className="absolute top-6 right-6 z-20 bg-white border border-black/5 px-3 py-2">
                    <span className="text-[8px] lg:text-[9px] font-medium uppercase tracking-[0.3em] text-text-primary">Chapter One</span>
                  </div>
                  <div className="absolute bottom-6 lg:bottom-8 left-6 lg:left-8 right-8 lg:right-10 top-[28%] lg:top-[32%] z-10 shadow-2xl overflow-hidden">
                    <img src="/magazine/honey-portrait.png" alt="Beekeeper" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-10 lg:bottom-14 right-2 lg:right-4 z-20 bg-text-primary text-white p-4 lg:p-6 max-w-[180px] lg:max-w-[220px] shadow-xl">
                    <p className="text-[11px] lg:text-[14px] font-display italic leading-[1.4]">"The hive works as one. We just listen."</p>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 mt-2 font-medium">— Sarah Mills</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
