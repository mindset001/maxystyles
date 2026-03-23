'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function PaymentVerifyInner() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { token } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Paystack sends ?reference= or ?trxref= on redirect
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      setErrorMsg('No payment reference found.');
      setStatus('failed');
      return;
    }

    const stored = sessionStorage.getItem('maxy-pending-order');
    if (!stored) {
      setErrorMsg('Order details not found. Please contact support with your reference: ' + reference);
      setStatus('failed');
      return;
    }

    let orderPayload: Record<string, unknown>;
    try {
      orderPayload = JSON.parse(stored);
    } catch {
      setErrorMsg('Order data is corrupted. Please contact support.');
      setStatus('failed');
      return;
    }

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-[#D4AF37] mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Verifying payment…</h1>
          <p className="text-gray-500 dark:text-gray-400">Please wait, do not refresh this page.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-3 dark:text-white">Payment Successful!</h1>
          {orderId && (
            <p className="text-sm text-gray-400 mb-2">
              Order ref:{' '}
              <span className="font-mono text-[#D4AF37]">#{orderId.slice(-8).toUpperCase()}</span>
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Thank you for shopping with MaxyStyles. Your order is confirmed and we&apos;ll be in
            touch shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-[#D4AF37] hover:bg-[#B8962E] text-black">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Failed
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-3 dark:text-white">Payment Failed</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">{errorMsg}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          If you were charged, please contact us and we will resolve this promptly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/cart">Back to Cart</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <PaymentVerifyInner />
    </Suspense>
  );
}
