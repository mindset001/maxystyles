'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PROMO_CODES: Record<string, number> = {
  MAXY10: 0.1,
  STYLE20: 0.2,
  FASHION15: 0.15,
};

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const router = useRouter();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Shipping: free over ₦50,000
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
      setPromoError('Invalid promo code. Try MAXY10, STYLE20, or FASHION15.');
    }
  };

  const handleCheckout = () => router.push('/checkout');


  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0A0A0A] transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
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
                            <p className="font-bold text-lg text-gray-900 dark:text-white">₦{(item.price * item.quantity).toLocaleString()}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-400">₦{item.price.toLocaleString()} each</p>
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
                    <span>Subtotal</span><span>₦{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({(appliedPromo.discount * 100).toFixed(0)}%)</span>
                      <span>-₦{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `₦${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Tax (7.5%)</span><span>₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-xl">
                      Add ₦{(50000 - cartTotal).toLocaleString()} more for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-100 dark:border-gray-800 pt-3 text-gray-900 dark:text-white">
                    <span>Total</span><span>₦{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <Button className="w-full mt-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold flex items-center justify-center gap-2" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
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
