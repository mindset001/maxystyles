'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  ChevronRight,
  ShoppingBag,
  Lock,
  Truck,
  RotateCcw,
  Shield,
  CheckCircle2,
  Loader2,
  Trash2,
  Tag,
  X,
  ArrowLeft,
  CreditCard,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PROMO_CODES: Record<string, number> = {
  MAXY10: 0.1,
  STYLE20: 0.2,
  FASHION15: 0.15,
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
}

type FormErrors = Partial<CheckoutForm>;

const EMPTY_FORM: CheckoutForm = {
  name: '', email: '', phone: '',
  street: '', city: '', state: '', zipCode: '', country: 'Nigeria',
  notes: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputCls = (err?: string) =>
  `w-full bg-transparent border rounded-xl px-4 py-3 text-sm text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-colors ${
    err ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
  }`;

function StepIndicator({ step }: { step: 1 | 2 }) {
  const steps = ['Delivery', 'Review & Pay'];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done
                    ? 'bg-green-500 text-white'
                    : active
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : n}
              </div>
              <span
                className={`text-sm font-semibold uppercase tracking-widest hidden sm:block ${
                  active ? 'text-[#1A1A1A] dark:text-white' : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-10 sm:w-16 mx-3 ${done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
function OrderSummary({
  cartTotal, discountAmount, shipping, tax, orderTotal,
  appliedPromo, promoCode, promoError, onPromoChange, onApplyPromo, onRemovePromo,
}: {
  cartTotal: number; discountAmount: number; shipping: number; tax: number; orderTotal: number;
  appliedPromo: { code: string; discount: number } | null;
  promoCode: string; promoError: string;
  onPromoChange: (v: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
}) {
  const { items } = useCart();
  return (
    <aside className="lg:w-96 flex-shrink-0">
      <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden sticky top-28">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
          <h2 className="font-bold text-[#1A1A1A] dark:text-white text-sm uppercase tracking-widest">
            Order Summary
          </h2>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-600">
            {items.reduce((s, i) => s + i.quantity, 0)} item(s)
          </span>
        </div>

        {/* Items */}
        <div className="divide-y divide-gray-50 dark:divide-gray-800/60 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3 px-6 py-3">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                {item.image && !item.image.includes('/images/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1A1A1A] dark:text-white line-clamp-1">{item.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                  {item.selectedSize} · {item.selectedColor} · ×{item.quantity}
                </p>
              </div>
              <p className="text-xs font-bold text-[#1A1A1A] dark:text-white flex-shrink-0">
                ₦{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Promo */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          {appliedPromo ? (
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">{appliedPromo.code}</p>
                  <p className="text-[10px] text-green-600">{(appliedPromo.discount * 100).toFixed(0)}% off applied</p>
                </div>
              </div>
              <button onClick={onRemovePromo} className="text-green-600 hover:text-green-800 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => onPromoChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && onApplyPromo()}
                className="flex-1 px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition uppercase tracking-widest"
              />
              <button
                onClick={onApplyPromo}
                className="px-4 py-2 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-[#D4AF37] hover:text-black transition-all"
              >
                Apply
              </button>
            </div>
          )}
          {promoError && <p className="text-[10px] text-red-500 mt-1.5">{promoError}</p>}
        </div>

        {/* Totals */}
        <div className="px-6 pb-6 space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>₦{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({(appliedPromo.discount * 100).toFixed(0)}%)</span>
              <span>−₦{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Shipping</span>
            <span>
              {shipping === 0
                ? <span className="text-green-600 font-medium">Free</span>
                : `₦${shipping.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Tax (7.5%)</span>
            <span>₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-gray-100 dark:border-gray-800 pt-3 mt-1 text-[#1A1A1A] dark:text-white">
            <span>Total</span>
            <span>₦{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Trust */}
        <div className="px-6 pb-6 grid grid-cols-3 gap-2 border-t border-gray-50 dark:border-gray-800/60 pt-4">
          {[
            { icon: Lock, text: 'Secure' },
            { icon: Truck, text: 'Fast shipping' },
            { icon: RotateCcw, text: '30-day returns' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1 text-center">
              <Icon className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-[10px] text-gray-500 dark:text-gray-600 leading-tight">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated, token } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Pre-fill from user if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: (user as any).phone ?? '',
        street: (user as any).address?.street ?? '',
        city: (user as any).address?.city ?? '',
        state: (user as any).address?.state ?? '',
        zipCode: (user as any).address?.zipCode ?? '',
        country: (user as any).address?.country ?? 'Nigeria',
        notes: '',
      });
    }
  }, [isAuthenticated, user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) router.replace('/cart');
  }, [items.length, router]);

  const shipping = cartTotal > 50000 ? 0 : cartTotal === 0 ? 0 : 2500;
  const discountAmount = appliedPromo ? cartTotal * appliedPromo.discount : 0;
  const tax = (cartTotal - discountAmount) * 0.075;
  const orderTotal = cartTotal - discountAmount + shipping + tax;

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const discount = PROMO_CODES[code];
    if (discount) {
      setAppliedPromo({ code, discount });
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError('Invalid promo code.');
    }
  };

  const setField = (key: keyof CheckoutForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.street.trim()) errs.street = 'Street address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.country.trim()) errs.country = 'Country is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep1()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePay = async () => {
    setIsPlacing(true);
    setOrderError('');
    try {
      const orderPayload: Record<string, unknown> = {
        ...(!isAuthenticated && {
          guestInfo: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
          },
        }),
        ...(isAuthenticated && user && { user: (user as any).id ?? (user as any)._id }),
        products: items.map((item) => ({
          productName: item.name,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.price,
        })),
        totalAmount: parseFloat(orderTotal.toFixed(2)),
        shippingAddress: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim() || form.city.trim(),
          zipCode: form.zipCode.trim() || '000000',
          country: form.country.trim(),
        },
        notes: form.notes.trim() || undefined,
      };

      sessionStorage.setItem('maxy-pending-order', JSON.stringify(orderPayload));

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAuthenticated && token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/payments/initialize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: form.email.trim(),
          amount: orderTotal,
          callback_url: `${window.location.origin}/payment/verify`,
          metadata: {
            customer_name: form.name.trim(),
            item_count: items.length,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to initialize payment');

      window.location.href = data.data.authorization_url;
    } catch (err: any) {
      setOrderError(err.message ?? 'Something went wrong. Please try again.');
      setIsPlacing(false);
    }
  };

  const Field = ({
    name, label, type = 'text', placeholder = '', className = '',
  }: {
    name: keyof CheckoutForm; label: string; type?: string; placeholder?: string; className?: string;
  }) => (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white mb-2">
        {label}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setField(name, e.target.value)}
        placeholder={placeholder}
        className={inputCls(formErrors[name])}
      />
      {formErrors[name] && <p className="text-xs text-red-500 mt-1">{formErrors[name]}</p>}
    </div>
  );

  if (items.length === 0) {
    return null; // redirecting
  }

  return (
    <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] min-h-screen text-[#1A1A1A] dark:text-white transition-colors duration-300">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0D0D0D]">
        <div className="container mx-auto px-6 lg:px-16 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-widest text-[#D4AF37]">
            MAXY<span className="text-[#1A1A1A] dark:text-white font-light">STYLES</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-600">
            <Lock className="h-3.5 w-3.5 text-[#D4AF37]" />
            Secure Checkout
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 mb-8 uppercase tracking-widest">
          <Link href="/cart" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />Cart
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#1A1A1A] dark:text-white">Checkout</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">

          {/* ── LEFT: Form ────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <StepIndicator step={step} />

            {/* ─ STEP 1: Delivery ──────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-8">
                {/* Contact */}
                <section>
                  <h2 className="text-lg font-bold mb-1 text-[#1A1A1A] dark:text-white">Contact Information</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-5">
                    {isAuthenticated ? 'Your details are pre-filled from your profile.' : 'No account? No problem — you can checkout as a guest.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field name="name" label="Full Name *" placeholder="Jane Doe" className="sm:col-span-2" />
                    <Field name="email" label="Email Address *" type="email" placeholder="jane@example.com" />
                    <Field name="phone" label="Phone Number" type="tel" placeholder="+234 800 000 0000" />
                  </div>
                </section>

                {/* Shipping */}
                <section>
                  <h2 className="text-lg font-bold mb-1 text-[#1A1A1A] dark:text-white">Shipping Address</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-5">Where should we deliver your order?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field name="street" label="Street Address *" placeholder="12 Fashion Road" className="sm:col-span-2" />
                    <Field name="city" label="City *" placeholder="Lagos" />
                    <Field name="state" label="State / Province" placeholder="Lagos State" />
                    <Field name="zipCode" label="ZIP / Postal Code" placeholder="100001" />
                    <Field name="country" label="Country *" placeholder="Nigeria" />
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white mb-2">
                    Order Notes <span className="text-gray-400 dark:text-gray-600 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    placeholder="Special instructions, preferred delivery time, etc."
                    rows={3}
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition resize-none"
                  />
                </section>

                <button
                  onClick={handleContinue}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold py-4 text-sm uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Review
                  <ChevronRight className="h-4 w-4" />
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-600">
                    Have an account?{' '}
                    <Link href={`/login?redirect=/checkout`} className="text-[#D4AF37] hover:underline">
                      Sign in
                    </Link>{' '}
                    to pre-fill your details.
                  </p>
                )}
              </div>
            )}

            {/* ─ STEP 2: Review & Pay ──────────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-8">
                {/* Delivery Summary */}
                <section className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#D4AF37]" />
                      Delivery Details
                    </h2>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-[#D4AF37] hover:underline uppercase tracking-widest"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">Name</p>
                      <p className="text-[#1A1A1A] dark:text-white font-medium">{form.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">Email</p>
                      <p className="text-[#1A1A1A] dark:text-white font-medium">{form.email}</p>
                    </div>
                    {form.phone && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">Phone</p>
                        <p className="text-[#1A1A1A] dark:text-white font-medium">{form.phone}</p>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">Shipping Address</p>
                      <p className="text-[#1A1A1A] dark:text-white font-medium">
                        {form.street}, {form.city}{form.state ? `, ${form.state}` : ''}{form.zipCode ? ` ${form.zipCode}` : ''}, {form.country}
                      </p>
                    </div>
                    {form.notes && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">Notes</p>
                        <p className="text-[#5C524A] dark:text-gray-400 italic text-xs">{form.notes}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Items Review */}
                <section className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
                    <h2 className="font-bold text-[#1A1A1A] dark:text-white text-sm">
                      Your Items ({items.reduce((s, i) => s + i.quantity, 0)})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 px-6 py-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {item.image && !item.image.includes('/images/') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#1A1A1A] dark:text-white">{item.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                              Size: {item.selectedSize}
                            </span>
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                              Colour: {item.selectedColor}
                            </span>
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#1A1A1A] dark:text-white flex-shrink-0">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Payment Method */}
                <section className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                  <h2 className="font-bold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#D4AF37]" />
                    Payment Method
                  </h2>
                  <div className="flex items-center gap-4 p-4 border-2 border-[#D4AF37] bg-[#D4AF37]/5 dark:bg-[#D4AF37]/5 rounded-xl">
                    <div className="w-10 h-10 bg-[#0BA74B] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">Paystack</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Card · Bank transfer · USSD · Mobile money</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37] ml-auto" />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-3 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Your payment is processed securely by Paystack. We never store your card details.
                  </p>
                </section>

                {/* Error */}
                {orderError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-5 py-4 text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                    <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {orderError}
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handlePay}
                  disabled={isPlacing}
                  className="w-full bg-[#0BA74B] hover:bg-[#099c44] disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 text-sm uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isPlacing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Redirecting to Paystack…</>
                  ) : (
                    <><CreditCard className="h-4 w-4" />Pay ₦{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} with Paystack</>
                  )}
                </button>

                <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                  By placing your order you agree to our{' '}
                  <Link href="/contact" className="text-[#D4AF37] hover:underline">Terms &amp; Conditions</Link>
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Summary ────────────────────────────────────────────────── */}
          <OrderSummary
            cartTotal={cartTotal}
            discountAmount={discountAmount}
            shipping={shipping}
            tax={tax}
            orderTotal={orderTotal}
            appliedPromo={appliedPromo}
            promoCode={promoCode}
            promoError={promoError}
            onPromoChange={setPromoCode}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={() => { setAppliedPromo(null); setPromoCode(''); setPromoError(''); }}
          />
        </div>
      </div>
    </div>
  );
}
