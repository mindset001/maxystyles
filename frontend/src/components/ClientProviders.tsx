'use client';

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import CartDrawer from '@/components/CartDrawer';
import { ThemeProvider } from '@/context/ThemeContext';
import PageViewTracker from '@/components/PageViewTracker';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <PageViewTracker />
          {children}
          <CartDrawer />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
