'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PROMO_CODES: Record<string, number> = {
  MAXY10: 0.1,
  STYLE20: 0.2,
  FASHION15: 0.15,
};

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

const emptyForm: CheckoutForm = {
  name: '', email: '', phone: '',
  street: '', city: '', state: '', zipCode: '', country: 'Nigeria',
  notes: '',
};

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { user, isAuthenticated, token } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Checkout form modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<CheckoutForm>>({});

  // Shipping: free over $150
  const shipping = cartTotal > 150 ? 0 : cartTotal === 0 ? 0 : 15;
  const discountAmount = appliedPromo ? cartTotal * appliedPromo.discount : 0;
  const tax = (cartTotal - discountAmount) * 0.075;
  const orderTotal = cartTotal - discountAmount + shipping + tax;

  const handleOpenCheckout = () => {
    setForm(isAuthenticated && user ? {
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      street: user.address?.street ?? '',
      city: user.address?.city ?? '',
      state: user.address?.state ?? '',
      zipCode: user.address?.zipCode ?? '',
      country: user.address?.country ?? 'Nigeria',
      notes: '',
    } : emptyForm);
    setFormErrors({});
    setOrderError('');
    setShowCheckout(true);
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const discount = PROMO_CODES[code];
    if (discount) {
      setAppliedPromo({ code, discount });
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError('Invalid promo code. Try MAXY10, STYLE20, or FASHION15.');
    }
  };

  const validateForm = (): boolean => {
    const errs: Partial<CheckoutForm> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.street.trim()) errs.street = 'Street address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.country.trim()) errs.country = 'Country is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInitiatePayment = async () => {
    if (!validateForm()) return;
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
        ...(isAuthenticated && user && { user: user.id }),
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

      // Persist order payload so the verify page can create the order after redirect
      sessionStorage.setItem('maxy-pending-order', JSON.stringify(orderPayload));

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAuthenticated && token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/payments/initialize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: form.email.trim(),
          amount: orderTotal, // backend converts to kobo
          callback_url: `${window.location.origin}/payment/verify`,
          metadata: {
            customer_name: form.name.trim(),
            item_count: items.length,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initialize payment');

      // Redirect to Paystack hosted payment page
      window.location.href = data.data.authorization_url;
      // Note: setIsPlacing(false) intentionally omitted — user is navigating away
    } catch (err: any) {
      setOrderError(err.message ?? 'Something went wrong. Please try again.');
      setIsPlacing(false);
    }
  };

  const field = (
    key: keyof CheckoutForm,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full bg-transparent border rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition ${
          formErrors[key] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
        }`}
      />
      {formErrors[key] && <p className="text-xs text-red-500 mt-1">{formErrors[key]}</p>}
    </div>
  );


  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0A0A0A] transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Checkout</h2>
                <button onClick={() => setShowCheckout(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Contact */}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {field('name', 'Full Name *', 'text', 'Your full name')}
                    {field('email', 'Email Address *', 'email', 'your@email.com')}
                    {field('phone', 'Phone Number', 'tel', '+234...')}
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Shipping Address</h3>
                  <div className="space-y-3">
                    {field('street', 'Street Address *', 'text', '123 Main Street')}
                    <div className="grid grid-cols-2 gap-3">
                      {field('city', 'City *', 'text', 'Lagos')}
                      {field('state', 'State', 'text', 'Lagos State')}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {field('zipCode', 'ZIP / Postal Code', 'text', '100001')}
                      {field('country', 'Country *', 'text', 'Nigeria')}
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-400">Secure Payment via Paystack</p>
                    <p className="text-xs text-green-600 dark:text-green-500">Card, bank transfer, USSD &amp; more — powered by Paystack</p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Any special instructions..."
                    rows={2}
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition resize-none"
                  />
                </div>

                {/* Order total recap */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span><span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (7.5%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-2 mt-1 text-gray-900 dark:text-white">
                    <span>Total</span><span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {orderError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {orderError}
                  </div>
                )}

                <Button
                  className="w-full bg-[#0BA74B] hover:bg-[#099c44] text-white"
                  size="lg"
                  onClick={handleInitiatePayment}
                  disabled={isPlacing}
                >
                  {isPlacing ? 'Redirecting to Paystack…' : `Pay with Paystack · ₦${orderTotal.toFixed(2)}`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
            {items.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {items.reduce((s, i) => s + i.quantity, 0)} item(s) in your cart
              </p>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-20 w-20 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven&apos;t added anything yet.</p>
            <Button asChild><Link href="/products">Start Shopping</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Items</h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear all
                </button>
              </div>

              {items.map((item) => (
                <Card key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-0.5">{item.category}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">Size: {item.selectedSize}</span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">Color: {item.selectedColor}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-xl">
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-xl transition-colors"
                            ><Minus className="h-3 w-3" /></button>
                            <span className="px-3 text-sm font-medium min-w-[2.5ch] text-center text-gray-900 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-xl transition-colors"
                            ><Plus className="h-3 w-3" /></button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order summary */}
            <div className="space-y-4">
              {/* Promo code */}
              <Card className="bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white">
                    <Tag className="h-4 w-4" /> Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">{appliedPromo.code}</p>
                        <p className="text-xs text-green-600">{(appliedPromo.discount * 100).toFixed(0)}% off applied</p>
                      </div>
                      <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }}>
                        <X className="h-4 w-4 text-green-600 hover:text-green-800" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                        className="flex-1 px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition uppercase"
                      />
                      <Button size="sm" onClick={handleApplyPromo} variant="outline">Apply</Button>
                    </div>
                  )}
                  {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-base text-gray-900 dark:text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({(appliedPromo.discount * 100).toFixed(0)}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Tax (7.5%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-xl">
                      Add ${(150 - cartTotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-100 dark:border-gray-800 pt-3 text-gray-900 dark:text-white">
                    <span>Total</span><span>${orderTotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full mt-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold" size="lg" onClick={handleOpenCheckout}>
                    Proceed to Checkout
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Secure checkout &bull; Free returns within 30 days
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#FAF8F4] dark:bg-[#111] border-dashed border-gray-200 dark:border-gray-800">
                <CardContent className="py-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Free shipping on orders over <span className="font-semibold text-gray-700 dark:text-gray-300">$150</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
