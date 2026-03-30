'use client';

import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeCart]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Shipping is location-based and calculated at checkout

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#111] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Cart
              {cartCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <ShoppingBag className="h-16 w-16 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 dark:text-gray-600">Add some items to get started!</p>
              <Button onClick={closeCart} asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => (
                <li
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex gap-4 px-6 py-4"
                >
                  {/* Image placeholder */}
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image && !item.image.includes('/images/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{item.category}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg">
                        {item.selectedSize}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg">
                        {item.selectedColor}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-xl transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-sm font-medium min-w-[2ch] text-center text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-xl transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price + remove */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.selectedSize, item.selectedColor)
                          }
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 space-y-3 bg-gray-50 dark:bg-[#0D0D0D]">
            <div className="flex justify-between font-semibold text-base text-gray-900 dark:text-white">
              <span>Subtotal</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Shipping fee calculated from your delivery state at checkout.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <Button asChild className="w-full" onClick={closeCart}>
                <Link href="/cart">View Cart &amp; Checkout</Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={closeCart} asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
