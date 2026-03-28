'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import {
  Search,
  Grid,
  List,
  Star,
  ShoppingCart,
  SlidersHorizontal,
  Package,
  ArrowRight,
  X,
} from 'lucide-react';
import { FadeUp, SlideLeft, SlideRight, Stagger, StaggerChild, ScaleIn } from '@/components/animations';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const sortOptions = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price-low',  label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Customer Rating' },
  { value: 'newest',     label: 'Newest First' },
];

export default function ProductsPage() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API}/products?limit=200`),
        fetch(`${API}/admin/categories`),
      ]);
      const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);
      setProducts(prodData.data ?? []);
      setCategories(catData.data ?? []);
    } catch {
      // server may be offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredProducts = (() => {
    let list = [...products];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (inStockOnly) list = list.filter(p => p.inStock);
    switch (sortBy) {
      case 'price-low':  list.sort((a, b) => a.price - b.price); break;
      case 'price-high': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case 'newest':     list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }
    return list;
  })();

  const inputClass = 'bg-white dark:bg-[#111] text-[#1A1A1A] dark:text-white border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 px-4 py-2.5 text-sm placeholder:text-[#8C7B6E] dark:placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors duration-200';

  const ProductCard = ({ product }: { product: any }) => {
    const productId = product._id ?? product.id;
    return (
    <div className={`group overflow-hidden border border-[#D4AF37]/25 dark:border-[#D4AF37]/10 hover:border-[#D4AF37]/60 transition-all duration-500 bg-white/40 dark:bg-transparent shadow-sm hover:shadow-md dark:hover:shadow-none ${viewMode === 'list' ? 'flex' : ''}`}>
      {/* Image */}
      <Link href={`/products/${productId}`} className={`relative overflow-hidden bg-[#EDE7DC] dark:bg-[#111] flex-shrink-0 block ${viewMode === 'list' ? 'w-48' : 'aspect-square'}`}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center min-h-[10rem]">
            <Package className="h-12 w-12 text-[#D4AF37]/30" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && <span className="bg-[#D4AF37] text-black text-[10px] uppercase tracking-widest px-2 py-0.5 font-semibold">New</span>}
          {product.isSale && <span className="bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-widest px-2 py-0.5 font-semibold">Sale</span>}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-[#0A0A0A]/60 flex items-center justify-center">
            <span className="text-white text-xs uppercase tracking-widest font-semibold border border-white/30 px-3 py-1">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-2">{product.category}</p>
        <Link href={`/products/${productId}`}>
          <h3 className="font-bold text-sm mb-2 text-[#1A1A1A] dark:text-white group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-2 hover:text-[#D4AF37]">
            {product.name}
          </h3>
        </Link>

        {product.rating != null && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-[#D4AF37] fill-current' : 'text-[#D4AF37]/20 dark:text-[#D4AF37]/10'}`} />
            ))}
            {product.reviews != null && <span className="text-xs text-[#8C7B6E] ml-1">({product.reviews})</span>}
          </div>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold text-[#1A1A1A] dark:text-white">₦{Number(product.price ?? 0).toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-[#8C7B6E] line-through">₦{Number(product.originalPrice).toLocaleString()}</span>
          )}
        </div>

        {product.colors?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.colors.slice(0, 3).map((c: string) => (
              <span key={c} className="text-[10px] border border-[#D4AF37]/25 dark:border-[#D4AF37]/15 text-[#8C7B6E] px-2 py-0.5">{c}</span>
            ))}
            {product.colors.length > 3 && <span className="text-[10px] text-[#8C7B6E]">+{product.colors.length - 3}</span>}
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <button
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors duration-200 ${
              product.inStock
                ? 'bg-[#D4AF37] text-black hover:bg-[#F4E5C3]'
                : 'bg-[#D4AF37]/10 dark:bg-[#D4AF37]/5 text-[#8C7B6E] cursor-not-allowed'
            }`}
            disabled={!product.inStock}
            onClick={() =>
              product.inStock &&
              addToCart({
                id: productId,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice ?? null,
                image: product.images?.[0] ?? '',
                category: product.category,
                selectedSize: product.sizes?.[0] ?? 'One Size',
                selectedColor: product.colors?.[0] ?? 'Default',
                inStock: product.inStock,
              })
            }
          >
            {product.inStock ? (
              <><ShoppingCart className="w-3.5 h-3.5" />Add to Cart</>
            ) : 'Out of Stock'}
          </button>
          <Link
            href={`/products/${productId}`}
            className="px-3 py-2.5 border border-[#D4AF37]/40 dark:border-[#D4AF37]/25 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors duration-200 text-xs uppercase tracking-widest font-semibold"
            aria-label="View product details"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
  };

  return (
    <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-white min-h-screen transition-colors duration-300">

      {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/25 to-transparent" />
          <div className="absolute right-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8DDD0]/30 via-transparent to-transparent dark:from-transparent" />
        </div>
        <div className="container mx-auto px-6 lg:px-16 relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <span className="block h-px w-12 bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-medium">Our Collection</span>
          </div>
          <h1 className="text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.9] tracking-tight mb-8">
            <span className="block">Our</span>
            <span className="block text-[#D4AF37] italic font-normal">products.</span>
          </h1>
          <div className="h-px w-24 bg-[#D4AF37] mb-8" />
          <p className="text-[#5C524A] dark:text-gray-400 text-lg max-w-xl leading-relaxed font-light">
            Discover our latest fashion collection — high-quality pieces for every style.
          </p>
        </div>
      </section>

      {/* ── SEARCH + CONTROLS ─────────────────────────────────────────── */}
      <section className="border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/15 bg-[#F3EDE6]/60 dark:bg-transparent py-5">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7B6E] dark:text-gray-600 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products…"
                className={`${inputClass} w-full pl-10`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest font-semibold border transition-colors duration-200 ${showFilters ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-[#D4AF37]/40 dark:border-[#D4AF37]/25 text-[#5C524A] dark:text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37]'}`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`${inputClass} pr-8`}
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex border border-[#D4AF37]/30 dark:border-[#D4AF37]/15">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors duration-200 ${viewMode === 'grid' ? 'bg-[#D4AF37] text-black' : 'text-[#8C7B6E] hover:text-[#D4AF37]'}`}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors duration-200 ${viewMode === 'list' ? 'bg-[#D4AF37] text-black' : 'text-[#8C7B6E] hover:text-[#D4AF37]'}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex gap-10">

            {/* Sidebar filters */}
            {showFilters && (
              <aside className="w-60 flex-shrink-0 space-y-0">
                <div className="border border-[#D4AF37]/25 dark:border-[#D4AF37]/10 divide-y divide-[#D4AF37]/20 dark:divide-[#D4AF37]/10 shadow-sm dark:shadow-none">
                  {/* Categories */}
                  <div className="p-6">
                    <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Categories</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`block w-full text-left px-3 py-2 text-sm transition-colors duration-200 ${selectedCategory === 'all' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-[#5C524A] dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#D4AF37]'}`}
                      >
                        All Products
                      </button>
                      {categories.map((cat: any) => (
                        <button
                          key={cat._id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`block w-full text-left px-3 py-2 text-sm transition-colors duration-200 ${selectedCategory === cat.name ? 'bg-[#D4AF37] text-black font-semibold' : 'text-[#5C524A] dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#D4AF37]'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Availability */}
                  <div className="p-6">
                    <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Availability</h3>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="accent-[#D4AF37] w-4 h-4"
                      />
                      <span className="text-sm text-[#5C524A] dark:text-gray-400 group-hover:text-[#D4AF37] transition-colors">In stock only</span>
                    </label>
                  </div>
                  {/* Clear */}
                  {(selectedCategory !== 'all' || inStockOnly || searchTerm) && (
                    <div className="p-4">
                      <button
                        onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setInStockOnly(false); }}
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#D4AF37] hover:text-[#F4E5C3] transition-colors"
                      >
                        <X className="h-3 w-3" />Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </aside>
            )}

            {/* Products area */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-8">
                <p className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500">
                  {loading ? 'Loading…' : `Showing ${filteredProducts.length} of ${products.length} products`}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="overflow-hidden border border-[#D4AF37]/20 dark:border-[#D4AF37]/10">
                      <div className="aspect-square bg-[#EDE7DC] dark:bg-[#111] animate-pulse" />
                      <div className="p-5 space-y-3">
                        <div className="h-3 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded w-1/3" />
                        <div className="h-4 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded w-3/4" />
                        <div className="h-5 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded w-1/2" />
                        <div className="h-9 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-32">
                  <Package className="h-16 w-16 text-[#D4AF37]/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-3">
                    {products.length === 0 ? 'No products yet' : 'No products match your filters'}
                  </h3>
                  <p className="text-[#8C7B6E] dark:text-gray-500 mb-8">
                    {products.length === 0 ? 'The store is being stocked — check back soon!' : 'Try adjusting your search or filter criteria'}
                  </p>
                  {products.length > 0 && (
                    <button
                      onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setInStockOnly(false); }}
                      className="inline-flex items-center gap-2 border border-[#D4AF37]/50 text-[#D4AF37] px-6 py-3 text-xs uppercase tracking-widest hover:border-[#D4AF37] transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                  {filteredProducts.map((product: any) => (
                    <ProductCard key={product._id ?? product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-[#D4AF37] py-20 md:py-28 mt-8">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <div className="flex items-center gap-3 justify-center mb-8">
            <span className="block h-px w-12 bg-black/30" />
            <span className="text-black/60 text-xs uppercase tracking-[0.3em]">Need something bespoke?</span>
            <span className="block h-px w-12 bg-black/30" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
            Can&apos;t find what you need? <br />
            <span className="italic font-normal">We&apos;ll make it.</span>
          </h2>
          <p className="text-black/60 text-lg max-w-xl mx-auto mb-10">
            Every MaxyStyles garment can be made to measure. Contact us about a custom commission.
          </p>
          <a
            href="/contact"
            className="group inline-flex items-center gap-3 bg-black text-[#D4AF37] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#111] transition-colors duration-300"
          >
            Commission a Piece
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

    </div>
  );
}
