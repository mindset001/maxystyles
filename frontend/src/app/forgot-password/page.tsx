'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, KeyRound, Copy, Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      // Show reset token if returned (dev mode)
      setResetToken(data.resetToken ?? '');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToken = async () => {
    if (!resetToken) return;
    await navigator.clipboard.writeText(resetToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0A0A0A] flex items-center justify-center px-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-[#1A1A1A] dark:text-white">MaxyStyles</Link>
          <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">Reset your password</p>
        </div>

        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            <KeyRound className="h-5 w-5 text-[#D4AF37]" />
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Enter your registered email address. We&apos;ll generate a reset token you can use on the next page.
          </p>

          {resetToken ? (
            /* ── Success state ── */
            <div className="space-y-5">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-xl leading-relaxed">
                ✓ Reset token generated. Copy it below and paste it on the reset page.
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Your Reset Token</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-200 font-mono break-all select-all">
                    {resetToken}
                  </code>
                  <button
                    onClick={copyToken}
                    className="shrink-0 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                    title="Copy token"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1.5">This token is valid for 1 hour. Do not share it with anyone.</p>
              </div>

              <Link
                href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                className="block w-full text-center bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold text-sm uppercase tracking-widest py-3 rounded-xl transition-colors duration-200"
              >
                Continue to Reset Password →
              </Link>
            </div>
          ) : (
            /* ── Email form ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full pl-9 bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#D4AF37] hover:bg-[#B8962E] disabled:opacity-60 text-black font-semibold text-sm uppercase tracking-widest py-3 rounded-xl transition-colors duration-200"
              >
                {submitting ? 'Generating Token…' : 'Generate Reset Token'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#D4AF37] transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
