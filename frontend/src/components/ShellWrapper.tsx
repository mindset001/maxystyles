'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ChatWidgetLoader from '@/components/ChatWidgetLoader';
import { AlertTriangle, X } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const [maintenance, setMaintenance] = useState<{ on: boolean; msg: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isAdmin) return;
    fetch(`${API}/admin/settings`)
      .then((r) => r.json())
      .then((d) => {
        if (d.maintenanceMode) {
          setMaintenance({ on: true, msg: d.maintenanceMessage || "We're currently performing maintenance. We'll be back shortly." });
        }
      })
      .catch(() => {});
  }, [isAdmin]);

  const showBanner = !isAdmin && !dismissed && maintenance?.on;

  return (
    <>
      {showBanner && (
        <div className="w-full bg-[#D4AF37]/15 border-b border-[#D4AF37]/30 backdrop-blur-sm px-4 py-2.5 flex items-center gap-3 z-50">
          <AlertTriangle className="h-4 w-4 text-[#D4AF37] shrink-0" />
          <p className="flex-1 text-sm text-[#1A1A1A] dark:text-[#FAF8F4]">{maintenance!.msg}</p>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-white" />
          </button>
        </div>
      )}
      {!isAdmin && <Navigation />}
      {children}
      {!isAdmin && <Footer />}
      {!isAdmin && <ChatWidgetLoader />}
    </>
  );
}
