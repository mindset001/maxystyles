import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ClientProviders from "@/components/ClientProviders";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "MaxyStyles - Expert Tailoring & Monogram Design | Osogbo",
  description: "Professional tailoring and custom monogram designing in Osogbo, Osun State. Anything but Styles - Expert craftsmanship for all your fashion needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking theme script — runs before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('maxy-theme');
                  var theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${playfair.variable} ${lato.variable} antialiased bg-[#FAF8F4] dark:bg-[#0A0A0A] transition-colors duration-300`}
      >
        <ClientProviders>
          <Navigation />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
