'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag, User, Menu, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { cartCount, openCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [logoUrl, setLogoUrl] = useState('');
  const [businessName, setBusinessName] = useState('MaxyStyles');
  const [tagline, setTagline] = useState('Anything but Styles');

  // Fetch branding from CMS
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiBase}/content?section=branding`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const m = data?.data?.metadata;
        if (!m) return;
        if (m.logoUrl) setLogoUrl(m.logoUrl);
        if (m.businessName) setBusinessName(m.businessName);
        if (m.tagline) setTagline(m.tagline);
      })
      .catch(() => { /* use defaults */ });
  }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="bg-white/90 dark:bg-[#0A0A0A] backdrop-blur-md border-b border-[#D4AF37]/25 dark:border-[#D4AF37]/15 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={businessName} className="h-9 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{businessName}</span>
            )}
            <span className="ml-1 text-xs text-[#D4AF37]/70 hidden lg:block italic">{tagline}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link href="/portfolio" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
              Portfolio
            </Link>
            <Link href="/gallery" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
              Gallery
            </Link>
            <Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
              Products
            </Link>
            <Link href="/categories" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
              Categories
            </Link>
            <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              {isAuthenticated && user ? (
                <button
                  onClick={() => setIsUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <span className="hidden sm:block font-medium max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                </button>
              ) : (
                <Button variant="ghost" size="icon" asChild className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] hover:bg-black/5 dark:hover:bg-white/5">
                  <Link href="/login" aria-label="Sign in"><User className="h-5 w-5" /></Link>
                </Button>
              )}

              {/* Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#D4AF37]/15 rounded-xl shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-400" /> My Profile
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-gray-400" /> My Orders
                  </Link>
                  <div className="border-t border-gray-100 dark:border-[#D4AF37]/10 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] hover:bg-black/5 dark:hover:bg-white/5" onClick={openCart} aria-label="Open cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#D4AF37]/15">
            <div className="flex flex-col space-y-2">
              <Link href="/portfolio" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors">
                Portfolio
              </Link>
              <Link href="/gallery" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors">
                Gallery
              </Link>
              <Link href="/products" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors">
                Products
              </Link>
              <Link href="/categories" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors">
                Categories
              </Link>
              <Link href="/about" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors">
                About
              </Link>
              <Link href="/contact" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors">
                Contact
              </Link>
              <div className="border-t border-[#D4AF37]/15 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors block">
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-red-500 hover:text-red-700 transition-colors text-left w-full"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors block">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}