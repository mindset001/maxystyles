'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Grid, List, Package, ArrowRight } from 'lucide-react';
import { FadeUp, SlideLeft, SlideRight, Stagger, StaggerChild, ScaleIn } from '@/components/animations';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch(`${API}/admin/categories`),
        fetch(`${API}/products?limit=500`),
      ]);
      const [catData, prodData] = await Promise.all([catRes.json(), prodRes.json()]);
      setCategories(catData.data ?? []);
      setProducts(prodData.data ?? []);
    } catch {
      // server offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const productCountFor = (catName: string) =>
    products.filter((p: any) => p.category?.toLowerCase() === catName?.toLowerCase()).length;

  const filtered = categories.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-white min-h-screen transition-colors duration-300">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/25 to-transparent" />
          <div className="absolute right-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8DDD0]/30 via-transparent to-transparent dark:from-transparent" />
        </div>
        <div className="container mx-auto px-6 lg:px-16 relative z-10">
          <div className="max-w-4xl">
            <FadeUp delay={0.1}>
            <div className="flex items-center gap-3 mb-10">
              <span className="block h-px w-12 bg-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-medium">Shop by Category</span>
            </div>
            <h1 className="text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.9] tracking-tight mb-8">
              <span className="block">Our</span>
              <span className="block text-[#D4AF37] italic font-normal">categories.</span>
            </h1>
            </FadeUp>
            <FadeUp delay={0.55}>
            <div className="h-px w-24 bg-[#D4AF37] mb-8" />
            <p className="text-[#5C524A] dark:text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
              Discover our carefully curated collection of fashion items — organised by category for easy browsing.
            </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────── */}
      {!loading && categories.length > 0 && (
        <section className="border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/15 bg-[#F3EDE6]/60 dark:bg-transparent">
          <div className="container mx-auto px-6 lg:px-16">
            <div className="grid grid-cols-3 divide-x divide-[#D4AF37]/25 dark:divide-[#D4AF37]/15">
              <div className="py-10 px-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">{categories.length}</div>
                <div className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500">Categories</div>
              </div>
              <div className="py-10 px-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">{products.length}</div>
                <div className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500">Total Products</div>
              </div>
              <div className="py-10 px-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">100%</div>
                <div className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500">Quality Assured</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SEARCH + CONTROLS ─────────────────────────────────────────── */}
      <section className="py-10 border-b border-[#D4AF37]/20 dark:border-[#D4AF37]/10 bg-[#FAF8F4] dark:bg-[#0A0A0A]">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7B6E] dark:text-gray-600 pointer-events-none" />
              <input
                type="text"
                placeholder="Search categories…"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111] text-[#1A1A1A] dark:text-white border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 text-sm placeholder:text-[#8C7B6E] dark:placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 border border-[#D4AF37]/30 dark:border-[#D4AF37]/15">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors duration-200 ${viewMode === 'grid' ? 'bg-[#D4AF37] text-black' : 'text-[#8C7B6E] dark:text-gray-500 hover:text-[#D4AF37]'}`}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors duration-200 ${viewMode === 'list' ? 'bg-[#D4AF37] text-black' : 'text-[#8C7B6E] dark:text-gray-500 hover:text-[#D4AF37]'}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="overflow-hidden border border-[#D4AF37]/20 dark:border-[#D4AF37]/10">
                  <div className="h-52 bg-[#EDE7DC] dark:bg-[#111] animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded w-1/2" />
                    <div className="h-4 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded w-full" />
                    <div className="h-10 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32">
              <Package className="h-16 w-16 text-[#D4AF37]/30 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-3">
                {categories.length === 0 ? 'No categories yet' : 'No categories match your search'}
              </h3>
              <p className="text-[#8C7B6E] dark:text-gray-500 mb-8">
                {categories.length === 0
                  ? 'Categories will appear here once the admin adds them.'
                  : 'Try a different search term.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center gap-2 border border-[#D4AF37]/50 text-[#D4AF37] px-6 py-3 text-xs uppercase tracking-widest hover:border-[#D4AF37] transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-4'}>
              {filtered.map((cat: any) => {
                const count = productCountFor(cat.name);
                return (
                  <div
                    key={cat._id}
                    className={`group cursor-pointer overflow-hidden border border-[#D4AF37]/25 dark:border-[#D4AF37]/10 hover:border-[#D4AF37]/70 dark:hover:border-[#D4AF37]/40 transition-all duration-500 bg-white/40 dark:bg-transparent shadow-sm hover:shadow-md dark:hover:shadow-none ${viewMode === 'list' ? 'flex' : ''}`}
                    onClick={() => window.location.href = `/products?category=${encodeURIComponent(cat.name)}`}
                  >
                    {/* Image */}
                    <div className={`relative overflow-hidden flex-shrink-0 bg-[#EDE7DC] dark:bg-[#111] ${viewMode === 'list' ? 'w-52 h-40' : 'h-52'}`}>
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-[#D4AF37]/30" />
                        </div>
                      )}
                      {/* Item count badge */}
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] uppercase tracking-widest bg-[#0A0A0A]/70 text-[#D4AF37] px-2.5 py-1">
                          {count} {count === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-[#1A1A1A] dark:text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                          {cat.name}
                        </h3>
                        {cat.description && (
                          <p className="text-sm text-[#6B6057] dark:text-gray-500 leading-relaxed line-clamp-2 mb-4">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mt-4 pt-4 border-t border-[#D4AF37]/15 dark:border-[#D4AF37]/10">
                        Browse {cat.name}
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-[#D4AF37] py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <FadeUp>
          <div className="flex items-center gap-3 justify-center mb-8">
            <span className="block h-px w-12 bg-black/30" />
            <span className="text-black/60 text-xs uppercase tracking-[0.3em]">Need something custom?</span>
            <span className="block h-px w-12 bg-black/30" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Can&apos;t find your category? <br />
            <span className="italic font-normal">We&apos;ll make it work.</span>
          </h2>
          <p className="text-black/60 text-lg max-w-xl mx-auto mb-12">
            Every MaxyStyles garment can be custom-made. Tell us what you need and we&apos;ll create it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="group inline-flex items-center gap-3 bg-black text-[#D4AF37] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#111] transition-colors duration-300"
            >
              Contact Us
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/products"
              className="group inline-flex items-center gap-3 border-2 border-black/30 text-black px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:border-black transition-colors duration-300"
            >
              All Products
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
