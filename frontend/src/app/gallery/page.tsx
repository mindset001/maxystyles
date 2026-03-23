'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, ZoomIn, Images, ArrowRight } from 'lucide-react';
import { FadeUp, SlideLeft, SlideRight, Stagger, StaggerChild, ScaleIn } from '@/components/animations';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CATEGORIES = ['all', 'gallery', 'portfolio', 'product', 'hero', 'general', 'other'];

interface MediaItem {
  _id: string;
  url: string;
  filename: string;
  altText?: string;
  caption?: string;
  category: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeCategory !== 'all' ? `?category=${activeCategory}` : '';
      const res = await fetch(`${API}/media${params}`);
      const data = await res.json();
      setItems(data.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-medium">MaxyStyles Atelier</span>
            </div>
            <h1 className="text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.9] tracking-tight mb-8">
              <span className="block">Our</span>
              <span className="block text-[#D4AF37] italic font-normal">gallery.</span>
            </h1>
            </FadeUp>
            <FadeUp delay={0.55}>
            <div className="h-px w-24 bg-[#D4AF37] mb-8" />
            <p className="text-[#5C524A] dark:text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
              A glimpse into the craftsmanship and style behind every MaxyStyles creation.
            </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER ───────────────────────────────────────────── */}
      <section className="sticky top-16 z-10 border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/15 bg-[#EDE7DC]/90 dark:bg-[#0D0D0D]/95 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex gap-1 overflow-x-auto py-4 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-xs uppercase tracking-widest font-semibold whitespace-nowrap border transition-all duration-200 flex-shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                    : 'border-[#D4AF37]/40 dark:border-[#D4AF37]/25 text-[#5C524A] dark:text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37] dark:hover:text-[#D4AF37]'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MASONRY GRID ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-16">
          {loading ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="break-inside-avoid mb-4 bg-[#EDE7DC] dark:bg-[#111] animate-pulse border border-[#D4AF37]/20 dark:border-[#D4AF37]/10"
                  style={{ height: `${180 + (i % 3) * 80}px` }}
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-32">
              <Images className="h-16 w-16 text-[#D4AF37]/30 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-3">No images yet</h3>
              <p className="text-[#8C7B6E] dark:text-gray-500">Check back soon — we&apos;re adding new work regularly.</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="break-inside-avoid mb-4 relative group cursor-pointer overflow-hidden border border-[#D4AF37]/25 dark:border-[#D4AF37]/10 hover:border-[#D4AF37]/70 dark:hover:border-[#D4AF37]/40 transition-all duration-500 shadow-sm hover:shadow-md dark:shadow-none"
                  onClick={() => setLightbox(item)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.altText || item.filename}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#0A0A0A]/0 group-hover:bg-[#0A0A0A]/40 transition-all duration-500 flex items-center justify-center">
                    <div className="w-10 h-10 border border-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomIn className="text-white h-5 w-5" />
                    </div>
                  </div>
                  {/* Caption */}
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs uppercase tracking-widest line-clamp-1">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      {!loading && items.length > 0 && (
        <section className="bg-[#D4AF37] py-24 md:py-32">
          <div className="container mx-auto px-6 lg:px-16 text-center">
            <div className="flex items-center gap-3 justify-center mb-8">
              <span className="block h-px w-12 bg-black/30" />
              <span className="text-black/60 text-xs uppercase tracking-[0.3em]">Love what you see?</span>
              <span className="block h-px w-12 bg-black/30" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Let&apos;s create something <br />
              <span className="italic font-normal">just for you.</span>
            </h2>
            <p className="text-black/60 text-lg max-w-xl mx-auto mb-12">
              Book a fitting, commission a bespoke garment, or just say hello. We&apos;re always glad to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 bg-black text-[#D4AF37] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#111] transition-colors duration-300"
              >
                Get in Touch
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/portfolio"
                className="group inline-flex items-center gap-3 border-2 border-black/30 text-black px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:border-black transition-colors duration-300"
              >
                View Portfolio
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── LIGHTBOX ──────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-[#0A0A0A]/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors duration-200"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="max-w-5xl max-h-[90vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.altText || lightbox.filename}
              className="max-h-[80vh] max-w-full object-contain border border-[#D4AF37]/20"
            />
            {(lightbox.caption || lightbox.altText) && (
              <p className="text-gray-400 text-xs uppercase tracking-widest text-center max-w-lg">
                {lightbox.caption || lightbox.altText}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
