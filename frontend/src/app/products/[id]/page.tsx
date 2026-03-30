'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Package,
  CheckCircle2,
  Truck,
  RotateCcw,
  Shield,
  ChevronDown,
  X,
  ZoomIn,
  ArrowLeft,
  Tag,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ─── Size Guide Data ───────────────────────────────────────────────────────────
const SIZE_GUIDE = [
  { size: 'XS', bust: '80–83', waist: '60–63', hips: '86–89' },
  { size: 'S',  bust: '84–87', waist: '64–67', hips: '90–93' },
  { size: 'M',  bust: '88–91', waist: '68–71', hips: '94–97' },
  { size: 'L',  bust: '92–96', waist: '72–76', hips: '98–102' },
  { size: 'XL', bust: '97–102', waist: '77–83', hips: '103–109' },
  { size: 'XXL', bust: '103–110', waist: '84–91', hips: '110–117' },
];

// ─── Accordion ────────────────────────────────────────────────────────────────
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button
        className="w-full flex items-center justify-between py-4 text-left text-sm font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white hover:text-[#D4AF37] transition-colors"
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-[#D4AF37] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-5 text-sm text-[#5C524A] dark:text-gray-400 leading-relaxed">{children}</div>}
    </div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 p-2 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors"
        onClick={(e) => { e.stopPropagation(); prev(); }}
      >
        <ChevronLeft className="h-7 w-7" />
      </button>
      <img
        src={images[idx]}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors"
        onClick={(e) => { e.stopPropagation(); next(); }}
      >
        <ChevronRight className="h-7 w-7" />
      </button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-[#D4AF37]' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Size Guide Modal ─────────────────────────────────────────────────────────
function SizeGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-[#1A1A1A] dark:text-white">Size Guide</h3>
          <button onClick={onClose} className="p-1 hover:text-[#D4AF37] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <p className="text-xs text-[#8C7B6E] dark:text-gray-500 mb-5 uppercase tracking-widest">All measurements in centimetres</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Size', 'Bust', 'Waist', 'Hips'].map((h) => (
                  <th key={h} className="text-left pb-3 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {SIZE_GUIDE.map((row) => (
                <tr key={row.size} className="hover:bg-[#FAF8F4] dark:hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-3 font-bold text-[#1A1A1A] dark:text-white pr-6">{row.size}</td>
                  <td className="py-3 text-[#5C524A] dark:text-gray-400 pr-6">{row.bust}</td>
                  <td className="py-3 text-[#5C524A] dark:text-gray-400 pr-6">{row.waist}</td>
                  <td className="py-3 text-[#5C524A] dark:text-gray-400">{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 pb-6">
          <p className="text-xs text-[#8C7B6E] dark:text-gray-600 leading-relaxed">
            If you are between sizes, we recommend sizing up. For tailored or structured pieces, contact us for a custom measurement.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card (related) ───────────────────────────────────────────────────
function RelatedCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product._id ?? product.id}`} className="group block">
      <div className="overflow-hidden border border-[#D4AF37]/25 dark:border-[#D4AF37]/10 hover:border-[#D4AF37]/60 transition-all duration-500 bg-white/40 dark:bg-transparent">
        <div className="relative aspect-square overflow-hidden bg-[#EDE7DC] dark:bg-[#111]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-10 w-10 text-[#D4AF37]/30" />
            </div>
          )}
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-[#D4AF37] text-black text-[10px] uppercase tracking-widest px-2 py-0.5 font-semibold">New</span>
          )}
        </div>
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1">{product.category}</p>
          <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">{product.name}</h4>
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white mt-2">₦{Number(product.price ?? 0).toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Reviews state ─────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/products/${params.id}`);
      if (!res.ok) { setNotFound(true); return; }
      const data = await res.json();
      const prod = data.data ?? data;
      setProduct(prod);
      setReviews(prod.reviews ?? []);
      if (prod.sizes?.length) setSelectedSize(prod.sizes[0]);
      if (prod.colors?.length) setSelectedColor(prod.colors[0]);
      // Fetch related
      const relRes = await fetch(`${API}/products?limit=8`);
      const relData = await relRes.json();
      const all: any[] = relData.data ?? [];
      setRelated(all.filter((p) => (p._id ?? p.id) !== (params.id as string) && p.category === prod.category).slice(0, 4));
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleAddToCart = () => {
    let hasError = false;
    if (product.sizes?.length && !selectedSize) { setSizeError(true); hasError = true; }
    if (product.colors?.length && !selectedColor) { setColorError(true); hasError = true; }
    if (hasError) return;

    addToCart({
      id: product._id ?? product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.images?.[0] ?? '',
      category: product.category,
      selectedSize: selectedSize || 'One Size',
      selectedColor: selectedColor || 'Default',
      inStock: product.inStock,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!reviewForm.name.trim()) { setReviewError('Please enter your name.'); return; }
    if (!reviewForm.comment.trim()) { setReviewError('Please write a comment.'); return; }
    if (!reviewForm.rating) { setReviewError('Please select a star rating.'); return; }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API}/products/${params.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      setReviews(data.data?.reviews ?? []);
      setReviewForm({ name: '', email: '', rating: 0, comment: '' });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const images: string[] = product?.images?.length ? product.images : [];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] min-h-screen pt-32">
        <div className="container mx-auto px-6 lg:px-16 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-4">
              <div className="aspect-square bg-[#EDE7DC] dark:bg-[#111] animate-pulse rounded" />
              <div className="flex gap-3">
                {[1,2,3].map(i => <div key={i} className="w-20 h-20 bg-[#EDE7DC] dark:bg-[#111] animate-pulse rounded" />)}
              </div>
            </div>
            <div className="space-y-5 pt-4">
              <div className="h-4 w-28 bg-[#EDE7DC] dark:bg-[#111] animate-pulse rounded" />
              <div className="h-10 w-3/4 bg-[#EDE7DC] dark:bg-[#111] animate-pulse rounded" />
              <div className="h-8 w-32 bg-[#EDE7DC] dark:bg-[#111] animate-pulse rounded" />
              <div className="space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-4 bg-[#EDE7DC] dark:bg-[#111] animate-pulse rounded" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <Package className="h-20 w-20 text-[#D4AF37]/30 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-[#1A1A1A] dark:text-white mb-3">Product Not Found</h1>
          <p className="text-[#8C7B6E] dark:text-gray-500 mb-8">This product may have been removed or does not exist.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#B8962E] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const sortedSizes = product.sizes
    ? [...product.sizes].sort((a: string, b: string) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
    : [];

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-white min-h-screen transition-colors duration-300">

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <Lightbox images={images} startIndex={activeImage} onClose={() => setLightboxOpen(false)} />
      )}
      {/* Size Guide */}
      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="pt-28 pb-0">
        <div className="container mx-auto px-6 lg:px-16">
          <nav className="flex items-center gap-2 text-xs text-[#8C7B6E] dark:text-gray-500 uppercase tracking-widest">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-[#D4AF37] transition-colors">Products</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1A1A1A] dark:text-white line-clamp-1 max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ── LEFT: Image Gallery ──────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-[4/5] overflow-hidden bg-[#EDE7DC] dark:bg-[#111] group cursor-zoom-in"
              onClick={() => images.length && setLightboxOpen(true)}
            >
              {images.length > 0 ? (
                <>
                  <img
                    key={activeImage}
                    src={images[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all duration-300">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow" />
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i - 1 + images.length) % images.length); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i + 1) % images.length); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-20 w-20 text-[#D4AF37]/30" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {product.isNew && <span className="bg-[#D4AF37] text-black text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold">New</span>}
                {discount && <span className="bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold">-{discount}%</span>}
                {!product.inStock && <span className="bg-red-600 text-white text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold">Sold Out</span>}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all duration-200 ${
                      activeImage === i ? 'border-[#D4AF37]' : 'border-transparent hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ──────────────────────────────────────── */}
          <div className="flex flex-col pt-2">

            {/* Category + Back link */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">{product.category}</span>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-xs text-[#8C7B6E] dark:text-gray-500 hover:text-[#D4AF37] transition-colors uppercase tracking-widest"
              >
                <ArrowLeft className="h-3.5 w-3.5" />Back
              </button>
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-[#1A1A1A] dark:text-white">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating != null && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-[#D4AF37] fill-current' : 'text-[#D4AF37]/20 dark:text-[#D4AF37]/10'}`} />
                  ))}
                </div>
                <span className="text-sm text-[#5C524A] dark:text-gray-400 font-medium">{Number(product.rating).toFixed(1)}</span>
                {product.reviews != null && (
                  <span className="text-sm text-[#8C7B6E] dark:text-gray-600">({product.reviews} reviews)</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <span className="text-3xl font-bold text-[#1A1A1A] dark:text-white">
                ₦{Number(product.price ?? 0).toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-[#8C7B6E] line-through">₦{Number(product.originalPrice).toLocaleString()}</span>
                  {discount && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[#5C524A] dark:text-gray-400 leading-relaxed mb-8 text-sm">
                {product.description}
              </p>
            )}

            {/* Color selector */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white">
                    Colour: <span className="text-[#D4AF37] font-normal">{selectedColor}</span>
                  </span>
                  {colorError && !selectedColor && (
                    <span className="text-xs text-red-500">Please select a colour</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => { setSelectedColor(color); setColorError(false); }}
                      className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all duration-200 font-medium ${
                        selectedColor === color
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                          : 'border-gray-200 dark:border-gray-700 text-[#5C524A] dark:text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sortedSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white">
                    Size: <span className="text-[#D4AF37] font-normal">{selectedSize}</span>
                  </span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-[#D4AF37] hover:underline uppercase tracking-widest"
                  >
                    Size Guide
                  </button>
                </div>
                {sizeError && !selectedSize && (
                  <p className="text-xs text-red-500 mb-2">Please select a size</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {sortedSizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`w-12 h-12 text-sm uppercase font-semibold border transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                          : 'border-gray-200 dark:border-gray-700 text-[#5C524A] dark:text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex gap-3 mb-6">
              {/* Qty */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 h-12 text-[#1A1A1A] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-4 h-12 flex items-center justify-center text-sm font-semibold text-[#1A1A1A] dark:text-white min-w-[3rem] border-x border-gray-200 dark:border-gray-700">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 h-12 text-[#1A1A1A] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 h-12 inline-flex items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                  added
                    ? 'bg-green-600 text-white'
                    : product.inStock
                    ? 'bg-[#D4AF37] text-black hover:bg-[#B8962E]'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                {added ? (
                  <><CheckCircle2 className="h-4 w-4" />Added to Cart</>
                ) : product.inStock ? (
                  <><ShoppingCart className="h-4 w-4" />Add to Cart</>
                ) : 'Out of Stock'}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setWishlist((w) => !w)}
                aria-label="Add to wishlist"
                className={`w-12 h-12 flex items-center justify-center border transition-all duration-200 ${
                  wishlist
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'border-gray-200 dark:border-gray-700 text-[#8C7B6E] hover:border-red-400 hover:text-red-400'
                }`}
              >
                <Heart className={`h-4.5 w-4.5 ${wishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Stock / share */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-[#5C524A] dark:text-gray-400 uppercase tracking-widest">
                  {product.inStock
                    ? product.stockQuantity > 10
                      ? 'In Stock'
                      : `Only ${product.stockQuantity} left`
                    : 'Out of Stock'}
                </span>
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs text-[#8C7B6E] dark:text-gray-500 hover:text-[#D4AF37] transition-colors uppercase tracking-widest"
              >
                <Share2 className="h-3.5 w-3.5" />
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8 py-5 border-y border-gray-100 dark:border-gray-800">
              {[
                { icon: Truck, label: 'Nigeria-wide delivery', sub: 'Fee based on your state' },
                { icon: RotateCcw, label: 'Easy returns', sub: '14-day exchange policy' },
                { icon: Shield, label: 'Secure checkout', sub: 'Encrypted payments' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon className="h-5 w-5 text-[#D4AF37]" />
                  <span className="text-[11px] font-semibold text-[#1A1A1A] dark:text-white uppercase tracking-wide">{label}</span>
                  <span className="text-[10px] text-[#8C7B6E] dark:text-gray-600">{sub}</span>
                </div>
              ))}
            </div>

            {/* Accordion details */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
              <Accordion title="Product Details">
                <ul className="space-y-2">
                  {product.brand && <li><span className="text-[#1A1A1A] dark:text-gray-300 font-medium">Brand:</span> {product.brand}</li>}
                  {product.category && <li><span className="text-[#1A1A1A] dark:text-gray-300 font-medium">Category:</span> {product.category}</li>}
                  {sortedSizes.length > 0 && <li><span className="text-[#1A1A1A] dark:text-gray-300 font-medium">Available sizes:</span> {sortedSizes.join(', ')}</li>}
                  {product.colors?.length > 0 && <li><span className="text-[#1A1A1A] dark:text-gray-300 font-medium">Available colours:</span> {product.colors.join(', ')}</li>}
                  <li><span className="text-[#1A1A1A] dark:text-gray-300 font-medium">SKU:</span> {String(product._id ?? product.id).slice(-8).toUpperCase()}</li>
                </ul>
              </Accordion>

              {product.tags?.length > 0 && (
                <Accordion title="Tags">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-2.5 py-1">
                        <Tag className="h-3 w-3" />{tag}
                      </span>
                    ))}
                  </div>
                </Accordion>
              )}

              <Accordion title="Shipping & Returns">
                <p className="mb-2">We deliver to all 36 states + FCT. Delivery fees start from <strong>₦1,500</strong> (Lagos) and vary by state — the exact fee is shown at checkout once you select your delivery state. Standard delivery takes 3–7 business days.</p>
                <p className="mb-2">Ready-to-wear items may be exchanged or returned for store credit within <strong>14 days</strong> of delivery, provided they are unworn, tags-on, and in original packaging.</p>
                <p className="mb-2">Custom and bespoke orders are <strong>non-returnable</strong> — made exclusively for you. Defective or incorrect items receive a full replacement at no cost; report within 48 hours of delivery.</p>
                <p>
                  <a href="/returns" className="text-[#D4AF37] hover:underline text-sm">View our full Returns &amp; Exchange Policy →</a>
                </p>
              </Accordion>

              <Accordion title="Care Instructions">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Hand wash or dry clean recommended</li>
                  <li>Do not bleach</li>
                  <li>Iron on low heat; avoid direct contact with embellishments</li>
                  <li>Store in a cool, dry place away from direct sunlight</li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 dark:border-gray-800 py-16 mt-4">
        <div className="container mx-auto px-6 lg:px-16">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <span className="block h-px w-12 bg-[#D4AF37]" />
            <h2 className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
              Customer Reviews
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* ── Left: Summary + Review list ── */}
            <div>
              {/* Average summary */}
              <div className="flex items-center gap-6 mb-8 p-5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-xl">
                <div className="text-center">
                  <p className="text-5xl font-bold text-[#1A1A1A] dark:text-white">
                    {reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'}
                  </p>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className={`h-4 w-4 ${reviews.length && n <= Math.round(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
                {/* Rating bars */}
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map((n) => {
                    const count = reviews.filter(r => r.rating === n).length;
                    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={n} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="w-3 text-right">{n}</span>
                        <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#D4AF37] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-5">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review list */}
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-600 italic">No reviews yet. Be the first to share your thoughts!</p>
              ) : (
                <div className="space-y-5">
                  {[...reviews].reverse().map((review: any, i: number) => (
                    <div key={i} className="border-b border-gray-100 dark:border-gray-800 pb-5 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{review.name}</p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-2">
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200 dark:text-gray-700'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-[#5C524A] dark:text-gray-400 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Submit form ── */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white mb-6">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Your Rating *</label>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`h-7 w-7 transition-colors ${n <= (hoverRating || reviewForm.rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300 dark:text-gray-600'}`} />
                      </button>
                    ))}
                    {reviewForm.rating > 0 && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {['','Poor','Fair','Good','Very Good','Excellent'][reviewForm.rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Your Name *</label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Amara O."
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
                  />
                </div>

                {/* Email (optional) */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Email <span className="normal-case font-normal">(optional, not shown)</span></label>
                  <input
                    type="email"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Your Review *</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    rows={4}
                    placeholder="Share your thoughts on quality, fit, and style…"
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition resize-none"
                  />
                </div>

                {reviewError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-xl">
                    Thank you! Your review has been submitted.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8962E] disabled:opacity-60 text-black font-semibold text-sm uppercase tracking-widest py-3 rounded-xl transition-colors duration-200"
                >
                  {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Products ─────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="border-t border-[#D4AF37]/20 dark:border-[#D4AF37]/10 py-20 mt-8">
          <div className="container mx-auto px-6 lg:px-16">
            <div className="flex items-center gap-4 mb-10">
              <span className="block h-px w-12 bg-[#D4AF37]" />
              <h2 className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => <RelatedCard key={p._id ?? p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#D4AF37] py-16">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 leading-tight">
            Want something made to measure?<br />
            <span className="italic font-normal">We&apos;ll craft it just for you.</span>
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-black text-[#D4AF37] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-[#111] transition-colors mt-4"
          >
            Commission a Piece
          </Link>
        </div>
      </section>
    </div>
  );
}
