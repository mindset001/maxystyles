'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ChatWidgetLoader from '@/components/ChatWidgetLoader';

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navigation />}
      {children}
      {!isAdmin && <Footer />}
      {!isAdmin && <ChatWidgetLoader />}
    </>
  );
}
