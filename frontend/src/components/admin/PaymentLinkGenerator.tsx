'use client';

import { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Trash2,
  Clock,
  User,
  Mail,
  FileText,
  Banknote,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

interface GeneratedLink {
  id: string;
  customerName: string;
  email: string;
  description: string;
  amount: number;
  url: string;
  reference: string;
  createdAt: Date;
}

export default function PaymentLinkGenerator() {
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    description: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const [copiedId, setCopiedId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(form.amount);
    if (!form.customerName.trim()) { setError('Customer name is required.'); return; }
    if (!form.email.trim()) { setError('Customer email is required.'); return; }
    if (!form.description.trim()) { setError('Description / item is required.'); return; }
    if (!amount || amount <= 0) { setError('Enter a valid amount.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          amount,                          // backend multiplies ×100 for kobo
          callback_url: `${FRONTEND_URL}/payment/verify`,
          metadata: {
            customerName: form.customerName.trim(),
            description: form.description.trim(),
            customOrder: true,
            source: 'admin_payment_link',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to generate link');

      const newLink: GeneratedLink = {
        id: data.data.reference,
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
        amount,
        url: data.data.authorization_url,
        reference: data.data.reference,
        createdAt: new Date(),
      };

      setLinks((prev) => [newLink, ...prev]);
      setForm({ customerName: '', email: '', description: '', amount: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async (link: GeneratedLink) => {
    await navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const whatsappShare = (link: GeneratedLink) => {
    const msg =
      `Hello ${link.customerName},\n\n` +
      `Thank you for your interest! Here is your secure payment link for *${link.description}* — ` +
      `₦${link.amount.toLocaleString()}:\n\n${link.url}\n\n` +
      `This link is unique to your order. Please complete payment at your earliest convenience.\n\n` +
      `— MaxyStyles`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const removeLink = (id: string) => setLinks((prev) => prev.filter((l) => l.id !== id));

  const inputClass =
    'w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
          <Link2 className="h-5 w-5 text-[#D4AF37]" />
          Payment Link Generator
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          After negotiating with a customer via chat or WhatsApp, generate a secure Paystack link
          for the agreed amount and share it directly with them.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── Form ── */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white mb-5">
            New Payment Link
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Customer name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Customer Name *
              </label>
              <input
                name="customerName"
                type="text"
                value={form.customerName}
                onChange={handleChange}
                placeholder="e.g. Amara Johnson"
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Customer Email *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Item / Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Custom Ankara A-line gown — burgundy, size M"
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5" /> Agreed Amount (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 font-medium pointer-events-none">₦</span>
                <input
                  name="amount"
                  type="number"
                  min="100"
                  step="50"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="45000"
                  className={`${inputClass} pl-8`}
                />
              </div>
              {form.amount && parseFloat(form.amount) > 0 && (
                <p className="text-xs text-[#D4AF37] mt-1">
                  ₦{parseFloat(form.amount).toLocaleString('en-NG')}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] hover:bg-[#B8962E] disabled:opacity-60 text-black font-semibold text-sm uppercase tracking-widest py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Generate Payment Link
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── How it works ── */}
        <div className="space-y-4">
          <div className="bg-[#D4AF37]/8 dark:bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">How it works</h4>
            <ol className="space-y-3">
              {[
                'Customer contacts you via WhatsApp, Instagram DM, or the site chat.',
                'You discuss the item, negotiate the price, agree on details.',
                'Fill the form with their email, what they\'re buying, and the agreed amount.',
                'Click "Generate Payment Link" — Paystack creates a secure, unique checkout link.',
                'Copy the link or tap "Share on WhatsApp" to send it directly to the customer.',
                'Customer pays via the link. You\'ll see the order appear in the Orders section.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#D4AF37] text-black text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            <strong>Note:</strong> Each generated link is tied to the customer&apos;s email and expires after 1 hour of inactivity on the Paystack checkout page. Generate a new one if needed.
          </div>
        </div>
      </div>

      {/* ── Generated links history (this session) ── */}
      {links.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#D4AF37]" />
            Generated This Session
          </h3>
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-[#1A1A1A] dark:text-white">{link.customerName}</p>
                      <span className="text-xs text-gray-400 dark:text-gray-600">·</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{link.email}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{link.description}</p>
                    <p className="text-sm font-bold text-[#D4AF37] mt-1">₦{link.amount.toLocaleString('en-NG')}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
                      Ref: {link.reference} · {link.createdAt.toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Copy */}
                    <button
                      onClick={() => copyLink(link)}
                      className="flex items-center gap-1.5 text-xs border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                      title="Copy link"
                    >
                      {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedId === link.id ? 'Copied!' : 'Copy'}
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={() => whatsappShare(link)}
                      className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </button>

                    {/* Open */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                      title="Preview link"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview
                    </a>

                    {/* Remove from list */}
                    <button
                      onClick={() => removeLink(link.id)}
                      className="text-gray-300 dark:text-gray-700 hover:text-red-400 transition-colors p-2 rounded-lg"
                      title="Remove from list"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Link preview bar */}
                <div className="mt-3 flex items-center gap-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg px-3 py-2">
                  <Link2 className="h-3 w-3 text-gray-400 shrink-0" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">{link.url}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
