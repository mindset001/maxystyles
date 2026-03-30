import Link from 'next/link';
import { RotateCcw, CheckCircle2, XCircle, AlertTriangle, Truck, Clock, Phone } from 'lucide-react';

export const metadata = {
  title: 'Returns & Exchange Policy | MaxyStyles',
  description: 'Our returns, exchanges and refund policy for ready-to-wear and custom pieces.',
};

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[#D4AF37]" />
      </div>
      <h2 className="text-lg font-semibold text-[#1A1A1A] dark:text-white">{title}</h2>
    </div>
    <div className="pl-12 text-sm text-[#5C524A] dark:text-gray-400 leading-relaxed space-y-3">
      {children}
    </div>
  </div>
);

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0A0A0A] transition-colors duration-300">

      {/* ── Hero ── */}
      <section className="pt-32 pb-14 border-b border-[#D4AF37]/20 dark:border-[#D4AF37]/10">
        <div className="container mx-auto px-6 lg:px-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="block h-px w-10 bg-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">Policy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-white leading-tight mb-4">
            Returns &amp; Exchange<br />
            <span className="italic font-normal text-[#D4AF37]">Policy</span>
          </h1>
          <p className="text-[#5C524A] dark:text-gray-400 leading-relaxed max-w-xl">
            We want you to love every piece you receive. If something isn't right, we're here to make it right — within the terms below.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
            Last updated: March 2026
          </p>
        </div>
      </section>

      {/* ── Quick summary cards ── */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 lg:px-16 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center">
              <CheckCircle2 className="h-7 w-7 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-800 dark:text-green-400">Ready-to-Wear</p>
              <p className="text-xs text-green-700 dark:text-green-500 mt-1">Exchange or store credit within 14 days</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-5 text-center">
              <XCircle className="h-7 w-7 text-red-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">Custom / Bespoke</p>
              <p className="text-xs text-red-700 dark:text-red-500 mt-1">Non-returnable — made to order</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-center">
              <AlertTriangle className="h-7 w-7 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-400">Damaged / Wrong Item</p>
              <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">Full replacement at no cost to you</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full policy ── */}
      <section className="py-14">
        <div className="container mx-auto px-6 lg:px-16 max-w-3xl">

          <Section title="Ready-to-Wear Items" icon={CheckCircle2}>
            <p>
              We accept exchanges or issue store credit on ready-to-wear items that meet the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>Request made within <strong className="text-[#1A1A1A] dark:text-white">14 days</strong> of confirmed delivery.</li>
              <li>Item is <strong className="text-[#1A1A1A] dark:text-white">unworn, unwashed, and unaltered</strong>.</li>
              <li>All original tags are still attached and intact.</li>
              <li>Item is in its original packaging or equivalent protective wrapping.</li>
            </ul>
            <p className="mt-2">
              We issue <strong className="text-[#1A1A1A] dark:text-white">store credit</strong> — not cash refunds — for eligible returns, redeemable against any future order. Exchanges for a different size or colour are processed at no additional charge where stock permits.
            </p>
            <p>
              Items purchased during a <strong className="text-[#1A1A1A] dark:text-white">sale or promotional event</strong> are eligible for exchange only — no store credit or refunds.
            </p>
          </Section>

          <Section title="Custom &amp; Bespoke Orders" icon={XCircle}>
            <p>
              All custom-made, tailored, and commissioned pieces are <strong className="text-[#1A1A1A] dark:text-white">non-returnable and non-refundable</strong>. This includes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>Pieces made to your measurements.</li>
              <li>Orders placed via our admin payment link after a negotiated quote.</li>
              <li>Items with custom fabric, embellishment, or colour selections.</li>
              <li>Commissioned portfolio or couture pieces.</li>
            </ul>
            <p className="mt-2">
              Because these garments are crafted specifically for you — using materials sourced and labour invested on your behalf — we cannot accept returns once production has begun.
            </p>
            <p>
              If there is a <strong className="text-[#1A1A1A] dark:text-white">defect or construction fault</strong> on a bespoke piece, we will correct or remake it at no charge. Please contact us within 48 hours of receiving the item with clear photographs.
            </p>
          </Section>

          <Section title="Damaged or Incorrect Items" icon={AlertTriangle}>
            <p>
              If your item arrives damaged, defective, or is not what you ordered, we take full responsibility. Here's what we'll do:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>Provide a <strong className="text-[#1A1A1A] dark:text-white">full replacement</strong> at zero cost to you.</li>
              <li>Arrange and cover the return shipping for the incorrect item.</li>
              <li>Process the replacement within 5–7 business days of receiving confirmation.</li>
            </ul>
            <p className="mt-2">
              Contact us within <strong className="text-[#1A1A1A] dark:text-white">48 hours of delivery</strong> with your order reference and photos of the issue. Claims raised after this window may not be eligible.
            </p>
          </Section>

          <Section title="Shipping &amp; Return Logistics" icon={Truck}>
            <p>
              <strong className="text-[#1A1A1A] dark:text-white">Return shipping costs</strong> are borne by the customer for change-of-mind returns or size exchanges, unless the item is faulty or incorrect.
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>We recommend using a trackable courier service — MaxyStyles is not responsible for items lost in return transit.</li>
              <li>Do not send items back without first contacting us and receiving a return confirmation.</li>
              <li>Unauthorised returns will not be processed.</li>
            </ul>
            <p className="mt-2">
              Once we receive and inspect a returned item, store credit is issued within <strong className="text-[#1A1A1A] dark:text-white">2 business days</strong>.
            </p>
          </Section>

          <Section title="How to Initiate a Return" icon={Clock}>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contact us via <Link href="/contact" className="text-[#D4AF37] hover:underline">our contact page</Link>, WhatsApp, or email within the eligible window.</li>
              <li>Provide your order reference number and reason for return.</li>
              <li>Attach clear photographs of the item (required for damage/defect claims).</li>
              <li>Wait for our team to review and issue a return authorisation — do not ship items without this.</li>
              <li>Pack the item securely and send it to the address we provide.</li>
              <li>Store credit is issued once the item passes inspection.</li>
            </ol>
          </Section>

          {/* Contact CTA */}
          <div className="mt-4 bg-[#D4AF37]/8 dark:bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-2xl p-7 flex flex-col sm:flex-row sm:items-center gap-5">
            <Phone className="h-8 w-8 text-[#D4AF37] shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-[#1A1A1A] dark:text-white mb-1">Still have questions?</p>
              <p className="text-sm text-[#5C524A] dark:text-gray-400">
                Our team is available on WhatsApp 24/7 and in-store Monday to Saturday, 8 AM – 7 PM.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-xl transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
