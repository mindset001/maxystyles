'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token.trim()) { setError('Please enter your reset token.'); return; }
    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition';

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-white">Password Updated!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your password has been reset successfully. Redirecting you to the sign-in page…
        </p>
        <Link href="/login" className="inline-block mt-2 text-sm text-[#D4AF37] hover:underline font-medium">
          Go to Sign In →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Token */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reset Token *</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={3}
          placeholder="Paste your reset token here…"
          className={`${inputClass} resize-none font-mono text-xs`}
        />
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
          From the <Link href="/forgot-password" className="text-[#D4AF37] hover:underline">forgot password</Link> page. Valid for 1 hour.
        </p>
      </div>

      {/* New password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password *</label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password *</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
        )}
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
        {submitting ? 'Resetting Password…' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0A0A0A] flex items-center justify-center px-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-[#1A1A1A] dark:text-white">MaxyStyles</Link>
          <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">Set a new password</p>
        </div>

        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            <KeyRound className="h-5 w-5 text-[#D4AF37]" />
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Paste your reset token and choose a strong new password.
          </p>

          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>

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
