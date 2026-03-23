'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Grid3X3,
  List,
  Eye,
  Star,
  Clock,
  Scissors,
  Calendar,
  User,
  Tag,
  Award,
  ArrowRight,
} from 'lucide-react';
import { FadeUp, SlideLeft, SlideRight, Stagger, StaggerChild, ScaleIn } from '@/components/animations';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Works');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [portRes, testRes] = await Promise.all([
        fetch(`${API}/admin/portfolio`),
        fetch(`${API}/admin/testimonials/all`),
      ]);
      const [portData, testData] = await Promise.all([portRes.json(), testRes.json()]);
      setPortfolioItems(portData.data ?? portData ?? []);
      setTestimonials((testData.data ?? testData ?? []).filter((t: any) => t.isPublished));
    } catch {
      // server may be offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const categories = [
    'All Works',
    ...Array.from(new Set(portfolioItems.map((i: any) => i.category).filter(Boolean))),
  ];

  const filteredItems =
    selectedCategory === 'All Works'
      ? portfolioItems
      : portfolioItems.filter((i: any) => i.category === selectedCategory);

  const SkeletonCard = () => (
    <div className="overflow-hidden border border-[#D4AF37]/20 dark:border-[#D4AF37]/10">
      <div className="h-64 bg-[#EDE7DC] dark:bg-[#111] animate-pulse" />
      <div className="p-6">
        <div className="h-5 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded w-3/4 mb-3" />
        <div className="h-4 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded w-full mb-2" />
        <div className="h-4 bg-[#EDE7DC] dark:bg-[#1A1A1A] animate-pulse rounded w-2/3" />
      </div>
    </div>
  );

  return (
    <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-white min-h-screen transition-colors duration-300">

      {/* HERO */}
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
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-medium">Our Craft</span>
            </div>
            <h1 className="text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.9] tracking-tight mb-8">
              <span className="block">Our</span>
              <span className="block text-[#D4AF37] italic font-normal">portfolio.</span>
            </h1>
            </FadeUp>
            <FadeUp delay={0.55}>
            <div className="h-px w-24 bg-[#D4AF37] mb-8" />
            <p className="text-[#5C524A] dark:text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
              Every piece a story. Every stitch a commitment. Browse our finest work in tailoring and monogram design.
            </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/15 bg-[#F3EDE6]/60 dark:bg-transparent">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-3 divide-x divide-[#D4AF37]/25 dark:divide-[#D4AF37]/15">
            <div className="py-10 px-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">
                {loading ? '…' : portfolioItems.length}
              </div>
              <div className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500">Portfolio Items</div>
            </div>
            <div className="py-10 px-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">5 ★</div>
              <div className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500">Customer Rating</div>
            </div>
            <div className="py-10 px-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">5+</div>
              <div className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500">Years Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS + GRID */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-14">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 text-xs uppercase tracking-widest font-semibold border transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                      : 'border-[#D4AF37]/40 dark:border-[#D4AF37]/25 text-[#5C524A] dark:text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 border border-[#D4AF37]/30 dark:border-[#D4AF37]/15">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors duration-200 ${viewMode === 'grid' ? 'bg-[#D4AF37] text-black' : 'text-[#8C7B6E] dark:text-gray-500 hover:text-[#D4AF37]'}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-32">
              <Scissors className="h-16 w-16 text-[#D4AF37]/30 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-3">No portfolio items yet</h3>
              <p className="text-[#8C7B6E] dark:text-gray-500">Check back soon. New work is on the way!</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
              {filteredItems.map((item: any) => {
                const firstImage = item.images?.[0];
                return (
                  <div
                    key={item._id}
                    className={`group overflow-hidden border border-[#D4AF37]/25 dark:border-[#D4AF37]/10 hover:border-[#D4AF37]/60 transition-all duration-500 bg-white/40 dark:bg-transparent shadow-sm ${viewMode === 'list' ? 'flex' : ''}`}
                  >
                    <div className={`relative overflow-hidden flex-shrink-0 ${viewMode === 'list' ? 'w-64' : ''}`}>
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={item.title}
                          className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${viewMode === 'list' ? 'h-full' : 'h-64'}`}
                        />
                      ) : (
                        <div className={`w-full bg-gradient-to-br from-[#EDE7DC] to-[#E0D5C8] dark:from-[#111] dark:to-[#1A1A1A] flex items-center justify-center ${viewMode === 'list' ? 'h-full min-h-[12rem]' : 'h-64'}`}>
                          <Scissors className="h-12 w-12 text-[#D4AF37]/40" />
                        </div>
                      )}

                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="w-9 h-9 bg-[#D4AF37] text-black flex items-center justify-center hover:bg-[#F4E5C3] transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-[#111] border border-[#D4AF37]/30 shadow-2xl">
                            <DialogHeader className="border-b border-[#D4AF37]/20 pb-5 mb-6">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="block h-px w-8 bg-[#D4AF37]" />
                                <span className="text-[#D4AF37] text-xs uppercase tracking-widest">{item.category}</span>
                              </div>
                              <DialogTitle className="text-xl font-bold text-[#1A1A1A] dark:text-white">{item.title}</DialogTitle>
                              <DialogDescription className="text-[#5C524A] dark:text-gray-400 text-sm mt-2">{item.description}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              {item.images?.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                  {item.images.map((img: string, idx: number) => (
                                    <img key={idx} src={img} alt={`${item.title} ${idx + 1}`} className="w-full object-cover aspect-square" />
                                  ))}
                                </div>
                              ) : (
                                <div className="h-48 bg-[#EDE7DC] dark:bg-[#1A1A1A] flex items-center justify-center">
                                  <Scissors className="h-16 w-16 text-[#D4AF37]/30" />
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3 border border-[#D4AF37]/20 p-4">
                                  {item.client && <div><p className="text-xs uppercase tracking-widest text-[#8C7B6E] mb-1 flex items-center gap-1"><User className="h-3 w-3 text-[#D4AF37]" />Client</p><p className="text-sm font-medium dark:text-white">{item.client}</p></div>}
                                  {item.completionTime && <div><p className="text-xs uppercase tracking-widest text-[#8C7B6E] mb-1 flex items-center gap-1"><Clock className="h-3 w-3 text-[#D4AF37]" />Timeline</p><p className="text-sm font-medium dark:text-white">{item.completionTime}</p></div>}
                                  {item.year && <div><p className="text-xs uppercase tracking-widest text-[#8C7B6E] mb-1 flex items-center gap-1"><Calendar className="h-3 w-3 text-[#D4AF37]" />Year</p><p className="text-sm font-medium dark:text-white">{item.year}</p></div>}
                                </div>
                                <div className="space-y-3 border border-[#D4AF37]/20 p-4">
                                  <div><p className="text-xs uppercase tracking-widest text-[#8C7B6E] mb-2 flex items-center gap-1"><Tag className="h-3 w-3 text-[#D4AF37]" />Category</p><span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1">{item.category}</span></div>
                                  {item.rating && <div><p className="text-xs uppercase tracking-widest text-[#8C7B6E] mb-1 flex items-center gap-1"><Award className="h-3 w-3 text-[#D4AF37]" />Rating</p><div className="flex items-center gap-1">{[...Array(item.rating)].map((_: any, i: number) => <Star key={i} className="h-3.5 w-3.5 text-[#D4AF37] fill-current" />)}<span className="ml-1 text-xs text-[#8C7B6E]">{item.rating}/5</span></div></div>}
                                  {item.tags?.length > 0 && <div><p className="text-xs uppercase tracking-widest text-[#8C7B6E] mb-1">Techniques</p><div className="flex flex-wrap gap-1">{item.tags.map((tag: string) => <span key={tag} className="text-xs border border-[#D4AF37]/20 text-[#6B6057] px-2 py-0.5">{tag}</span>)}</div></div>}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] uppercase tracking-widest bg-[#0A0A0A]/70 text-[#D4AF37] px-2.5 py-1">{item.category}</span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-2 group-hover:text-[#D4AF37] transition-colors">{item.title}</h3>
                        <p className="text-sm text-[#6B6057] dark:text-gray-500 leading-relaxed line-clamp-2 mb-4">{item.description}</p>
                        {item.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {item.tags.map((tag: string) => (
                              <span key={tag} className="text-[10px] uppercase tracking-widest border border-[#D4AF37]/25 text-[#8C7B6E] px-2 py-0.5">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/15">
                        <div className="flex items-center gap-4 text-xs text-[#8C7B6E]">
                          {item.completionTime && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.completionTime}</span>}
                          {item.rating && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[#D4AF37]" />{item.rating}/5</span>}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-xs uppercase tracking-widest text-[#D4AF37] hover:text-[#F4E5C3] flex items-center gap-1 transition-colors">View <ArrowRight className="h-3 w-3" /></button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl bg-white dark:bg-[#111] border border-[#D4AF37]/30 shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-bold dark:text-white">{item.title}</DialogTitle>
                              <DialogDescription className="text-sm text-[#6B6057]">{item.description}</DialogDescription>
                            </DialogHeader>
                            {item.images?.length > 0 ? (
                              <div className="grid grid-cols-2 gap-3 mt-4">
                                {item.images.map((img: string, idx: number) => <img key={idx} src={img} alt={`${item.title} ${idx + 1}`} className="w-full object-cover aspect-square" />)}
                              </div>
                            ) : (
                              <div className="h-48 bg-[#EDE7DC] flex items-center justify-center mt-4"><Scissors className="h-14 w-14 text-[#D4AF37]/30" /></div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      {!loading && testimonials.length > 0 && (
        <section className="py-28 md:py-40 bg-[#EDE7DC] dark:bg-[#0D0D0D] border-y border-[#D4AF37]/25 dark:border-[#D4AF37]/10">
          <div className="container mx-auto px-6 lg:px-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="block h-px w-12 bg-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-20 max-w-lg leading-tight">
              What clients <span className="text-[#D4AF37] italic font-normal">say</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-0 border border-[#D4AF37]/30 dark:border-[#D4AF37]/15 shadow-sm">
              {testimonials.map((t: any) => (
                <div key={t._id} className="p-10 border-r border-[#D4AF37]/30 dark:border-[#D4AF37]/15 last:border-r-0 bg-white/40 dark:bg-transparent">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(t.rating ?? 5)].map((_: any, j: number) => (
                      <Star key={j} className="h-4 w-4 text-[#D4AF37] fill-current" />
                    ))}
                  </div>
                  <p className="text-[#5C524A] dark:text-gray-400 italic text-sm leading-relaxed mb-8">
                    &ldquo;{t.testimonialText}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#D4AF37]/15">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#D4AF37]">
                        {t.customerName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{t.customerName}</p>
                      {t.customerRole && <p className="text-xs text-[#8C7B6E]">{t.customerRole}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[#D4AF37] py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <FadeUp>
          <div className="flex items-center gap-3 justify-center mb-8">
            <span className="block h-px w-12 bg-black/30" />
            <span className="text-black/60 text-xs uppercase tracking-[0.3em]">Commission Your Piece</span>
            <span className="block h-px w-12 bg-black/30" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Ready to create something <br />
            <span className="italic font-normal">beautiful?</span>
          </h2>
          <p className="text-black/60 text-lg max-w-xl mx-auto mb-12">
            Let MaxyStyles bring your vision to life with expert tailoring and custom monogram design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 bg-black text-[#D4AF37] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#111] transition-colors duration-300"
            >
              Contact Us
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 border-2 border-black/30 text-black px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:border-black transition-colors duration-300"
            >
              Browse Products
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
