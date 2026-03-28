'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/profile');
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/profile');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0A0A0A] flex items-center justify-center px-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-[#1A1A1A] dark:text-white">MaxyStyles</Link>
          <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <LogIn className="h-5 w-5 text-[#D4AF37]" />
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-1">
              <Link href="/forgot-password" className="text-xs text-[#D4AF37] hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold rounded-xl" size="lg" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-[#D4AF37] hover:underline">Create one</Link>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Are you an admin?{' '}
              <Link href="/admin/login" className="hover:underline text-gray-500 dark:text-gray-500">Admin login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
