'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight, Home, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function PaymentVerifyInner() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { token } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      setErrorMsg('No payment reference found in the URL.');
      setStatus('failed');
      return;
    }

    const stored = sessionStorage.getItem('maxy-pending-order');
    let orderPayload: Record<string, unknown> | null = null;

    if (stored) {
      try {
        orderPayload = JSON.parse(stored);
      } catch {
        // corrupted — still proceed, backend will use Paystack metadata
      }
    }
    // If no stored order (e.g. admin-generated payment link), orderPayload stays
    // null and the backend will build the order from Paystack transaction metadata.

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${API_URL}/payments/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reference, orderPayload }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          sessionStorage.removeItem('maxy-pending-order');
          clearCart();
          setOrderId(data.data?._id ?? '');
          setStatus('success');
        } else {
          throw new Error(data.message || 'Payment verification failed');
        }
      })
      .catch((err: any) => {
        setErrorMsg(err.message || 'Payment could not be verified. Please contact support.');
        setStatus('failed');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] min-h-screen flex items-center justify-center px-6 text-[#1A1A1A] dark:text-white">
        <div className="text-center max-w-sm">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-[#D4AF37]/20 dark:border-[#D4AF37]/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[#D4AF37] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold tracking-widest text-[#D4AF37]">M</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-3">Verifying Payment…</h1>
          <p className="text-[#8C7B6E] dark:text-gray-500 text-sm leading-relaxed">
            Please wait — do not close or refresh this page.
            <br />We are confirming your transaction with Paystack.
          </p>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] min-h-screen flex items-center justify-center px-6 py-16 text-[#1A1A1A] dark:text-white">
        <div className="w-full max-w-lg text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full" />
            <CheckCircle2 className="absolute inset-0 m-auto h-12 w-12 text-green-500" />
          </div>
          <div className="flex items-center gap-3 justify-center mb-6">
            <span className="h-px w-10 bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Order Confirmed</span>
            <span className="h-px w-10 bg-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-bold mb-3 leading-tight">
            Payment <span className="text-[#D4AF37] italic font-normal">successful.</span>
          </h1>
          {orderId && (
            <div className="inline-flex items-center gap-2 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-full px-5 py-2.5 mb-6">
              <span className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-widest">Order Ref</span>
              <span className="font-mono font-bold text-[#D4AF37] text-sm">#{orderId.slice(-8).toUpperCase()}</span>
            </div>
          )}
          <p className="text-[#5C524A] dark:text-gray-400 mb-10 leading-relaxed max-w-md mx-auto">
            Thank you for shopping with <strong className="text-[#1A1A1A] dark:text-white font-semibold">MaxyStyles</strong>.
            Your order has been placed and confirmed. We&apos;ll be in touch shortly with delivery updates.
          </p>
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-8 text-left space-y-3">
            {[
              'Order confirmation received',
              'Payment securely processed by Paystack',
              'Your items are being prepared for dispatch',
              'Delivery confirmation will be sent to your email',
            ].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-[#5C524A] dark:text-gray-400">{step}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold px-8 py-3.5 text-sm uppercase tracking-widest rounded-xl transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />Continue Shopping
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white hover:border-[#D4AF37] hover:text-[#D4AF37] font-semibold px-8 py-3.5 text-sm uppercase tracking-widest rounded-xl transition-colors"
            >
              <Home className="h-4 w-4" />Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Failed ────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] min-h-screen flex items-center justify-center px-6 py-16 text-[#1A1A1A] dark:text-white">
      <div className="w-full max-w-lg text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 rounded-full" />
          <XCircle className="absolute inset-0 m-auto h-12 w-12 text-red-500" />
        </div>
        <div className="flex items-center gap-3 justify-center mb-6">
          <span className="h-px w-10 bg-red-400" />
          <span className="text-red-500 text-xs uppercase tracking-[0.3em]">Payment Failed</span>
          <span className="h-px w-10 bg-red-400" />
        </div>
        <h1 className="text-4xl font-bold mb-3 leading-tight">
          Something went <span className="text-red-500 italic font-normal">wrong.</span>
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-6 py-4 mb-8 text-sm text-red-700 dark:text-red-400 text-left leading-relaxed">
          {errorMsg}
        </div>
        <p className="text-[#8C7B6E] dark:text-gray-500 text-sm mb-10 leading-relaxed max-w-md mx-auto">
          If you believe you were charged, please contact us immediately and we will investigate
          and resolve the issue as quickly as possible.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold px-8 py-3.5 text-sm uppercase tracking-widest rounded-xl transition-colors"
          >
            <ArrowRight className="h-4 w-4" />Back to Cart
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white hover:border-[#D4AF37] hover:text-[#D4AF37] font-semibold px-8 py-3.5 text-sm uppercase tracking-widest rounded-xl transition-colors"
          >
            <Phone className="h-4 w-4" />Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FAF8F4] dark:bg-[#0A0A0A] min-h-screen flex items-center justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-[#D4AF37]/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <PaymentVerifyInner />
    </Suspense>
  );
}
