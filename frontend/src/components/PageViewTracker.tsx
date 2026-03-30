'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/** Maps URL path prefixes to human-friendly labels. */
function getPageLabel(path: string): string {
  if (path === '/')                        return 'Home';
  if (path.startsWith('/products/'))       return 'Product Detail';
  if (path === '/products')               return 'Products';
  if (path === '/cart')                   return 'Cart';
  if (path === '/checkout')              return 'Checkout';
  if (path.startsWith('/payment'))        return 'Payment';
  if (path === '/about')                  return 'About';
  if (path === '/portfolio')             return 'Portfolio';
  if (path === '/gallery')               return 'Gallery';
  if (path === '/contact')               return 'Contact';
  if (path === '/returns')               return 'Returns Policy';
  if (path === '/register')              return 'Register';
  if (path === '/login')                 return 'Login';
  if (path === '/profile')               return 'Profile';
  if (path === '/categories')            return 'Categories';
  return path;
}

/** Returns a stable anonymous session ID stored in sessionStorage. */
function getSessionId(): string {
  try {
    let id = sessionStorage.getItem('maxy-sid');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('maxy-sid', id);
    }
    return id;
  } catch {
    return '';
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    // Don't track admin pages or duplicate fires (React StrictMode double-invoke)
    if (pathname.startsWith('/admin')) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    fetch(`${API}/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: pathname,
        pageLabel: getPageLabel(pathname),
        sessionId: getSessionId(),
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
      // Fire-and-forget — don't block rendering on failure
    }).catch(() => {});
  }, [pathname]);

  return null;
}
