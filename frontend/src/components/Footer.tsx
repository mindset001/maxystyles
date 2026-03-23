'use client';

import Link from 'next/link';
import { Phone, MapPin, Instagram, MessageCircle, Mail, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/products', label: 'Products' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="bg-[#EDE7DC] dark:bg-[#0A0A0A] border-t border-[#D4AF37]/30 dark:border-[#D4AF37]/15 text-[#1A1A1A] dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-6 lg:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold text-[#1A1A1A] dark:text-white mb-2">MaxyStyles</h3>
            <p className="text-[#D4AF37] italic text-lg mb-6">&ldquo;Anything but Styles&rdquo;</p>
            <p className="text-[#5C524A] dark:text-gray-500 leading-relaxed text-sm max-w-sm mb-8">
              Boutique tailoring atelier based in Osogbo, Osun State. We craft perfectly fitted
              garments — from traditional ankara to contemporary suiting — with uncompromising
              attention to detail.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-widest font-medium hover:gap-4 transition-all duration-300"
            >
              Book a consultation
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-6">Contact</h4>
            <div className="space-y-4">
              <a href="tel:08109612952" className="flex items-start gap-3 group">
                <Phone className="h-4 w-4 text-[#D4AF37]/60 dark:text-[#D4AF37]/40 mt-0.5 flex-shrink-0 group-hover:text-[#D4AF37] transition-colors" />
                <div className="text-sm text-[#5C524A] dark:text-gray-400 group-hover:text-[#1A1A1A] dark:group-hover:text-gray-200 transition-colors leading-relaxed">
                  <p>08109612952</p>
                  <p>08142362093</p>
                </div>
              </a>
              <a
                href="https://wa.me/2348109612952"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 group"
              >
                <MessageCircle className="h-4 w-4 text-[#D4AF37]/60 dark:text-[#D4AF37]/40 mt-0.5 flex-shrink-0 group-hover:text-[#D4AF37] transition-colors" />
                <span className="text-sm text-[#5C524A] dark:text-gray-400 group-hover:text-[#1A1A1A] dark:group-hover:text-gray-200 transition-colors">
                  +2348109612952 (WhatsApp)
                </span>
              </a>
              <a href="mailto:info@maxystyles.com" className="flex items-start gap-3 group">
                <Mail className="h-4 w-4 text-[#D4AF37]/60 dark:text-[#D4AF37]/40 mt-0.5 flex-shrink-0 group-hover:text-[#D4AF37] transition-colors" />
                <span className="text-sm text-[#5C524A] dark:text-gray-400 group-hover:text-[#1A1A1A] dark:group-hover:text-gray-200 transition-colors">
                  info@maxystyles.com
                </span>
              </a>
              <div className="flex items-start gap-3">
                <Instagram className="h-4 w-4 text-[#D4AF37]/60 dark:text-[#D4AF37]/40 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[#5C524A] dark:text-gray-400 leading-relaxed">
                  <p>@maxy_styles_</p>
                  <p>@finest_tailor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Atelier */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-6">Atelier</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#D4AF37]/60 dark:text-[#D4AF37]/40 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#5C524A] dark:text-gray-400 leading-relaxed">
                  Irewole community, zone 9,<br />
                  Kunike junction, Idi Oro,<br />
                  Osogbo, Osun State
                </p>
              </div>
              <div className="border-t border-[#D4AF37]/25 dark:border-[#D4AF37]/10 pt-4">
                <p className="text-xs uppercase tracking-widest text-[#D4AF37]/70 dark:text-[#D4AF37]/50 mb-2">Hours</p>
                <p className="text-sm text-[#5C524A] dark:text-gray-400">Mon – Sat &nbsp;8 AM – 7 PM</p>
                <p className="text-sm text-[#5C524A] dark:text-gray-400">Sun &nbsp;By appointment</p>
                <p className="text-xs text-[#D4AF37] dark:text-[#D4AF37]/60 mt-2">WhatsApp available 24 / 7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#D4AF37]/25 dark:border-[#D4AF37]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex flex-wrap gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-widest text-[#8C7B6E] dark:text-gray-500 hover:text-[#D4AF37] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[#9C8B7E] dark:text-gray-600">
            &copy; {new Date().getFullYear()} MaxyStyles. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}