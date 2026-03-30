'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Tag, Percent, AlertTriangle, Save, Loader2, Plus, Trash2,
  CheckCircle2, ToggleLeft, ToggleRight, Settings,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface PromoCode {
  code: string;
  discount: number;
  active: boolean;
  description: string;
}

interface SiteSettings {
  taxRate: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  promoCodes: PromoCode[];
}

const TABS = [
  { id: 'promos',       label: 'Promo Codes',      icon: Tag },
  { id: 'tax',          label: 'Tax Rate',          icon: Percent },
  { id: 'maintenance',  label: 'Maintenance Mode',  icon: AlertTriangle },
];

const EMPTY_PROMO: PromoCode = { code: '', discount: 10, active: true, description: '' };

export default function SettingsManagement() {
  const [tab, setTab] = useState<'promos' | 'tax' | 'maintenance'>('promos');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Working copies
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [newPromo, setNewPromo] = useState<PromoCode>(EMPTY_PROMO);
  const [taxRate, setTaxRate] = useState('7.5');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/settings`);
      const data: SiteSettings = await res.json();
      setSettings(data);
      setPromoCodes(data.promoCodes ?? []);
      setTaxRate(((data.taxRate ?? 0.075) * 100).toFixed(2).replace(/\.?0+$/, ''));
      setMaintenanceMode(data.maintenanceMode ?? false);
      setMaintenanceMessage(data.maintenanceMessage ?? '');
    } catch {
      showToast('error', 'Could not load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const save = async (patch: Partial<SiteSettings>) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      const data: SiteSettings = await res.json();
      setSettings(data);
      setPromoCodes(data.promoCodes ?? []);
      showToast('success', 'Settings saved.');
    } catch (e: any) {
      showToast('error', e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const savePromos = () => save({ promoCodes });
  const saveTax    = () => {
    const v = parseFloat(taxRate);
    if (isNaN(v) || v < 0 || v > 100) { showToast('error', 'Tax rate must be between 0 and 100.'); return; }
    save({ taxRate: v / 100 });
  };
  const saveMaintenance = () => save({ maintenanceMode, maintenanceMessage });

  const togglePromoActive = (i: number) =>
    setPromoCodes((p) => p.map((c, idx) => idx === i ? { ...c, active: !c.active } : c));

  const deletePromo = (i: number) =>
    setPromoCodes((p) => p.filter((_, idx) => idx !== i));

  const updatePromo = (i: number, field: keyof PromoCode, value: string | number | boolean) =>
    setPromoCodes((p) => p.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const addPromo = () => {
    const code = newPromo.code.trim().toUpperCase();
    if (!code) { showToast('error', 'Code is required.'); return; }
    if (promoCodes.some((p) => p.code === code)) { showToast('error', 'Code already exists.'); return; }
    const disc = Number(newPromo.discount);
    if (isNaN(disc) || disc <= 0 || disc > 100) { showToast('error', 'Discount must be 1–100.'); return; }
    setPromoCodes((p) => [...p, { code, discount: disc / 100, active: true, description: newPromo.description }]);
    setNewPromo(EMPTY_PROMO);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-[#D4AF37]" />
        <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white">Settings</h2>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Promo Codes ── */}
      {tab === 'promos' && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active codes are redeemable at cart and checkout. Disable a code to stop new uses without deleting it.
          </p>

          {/* Existing codes */}
          <div className="space-y-3">
            {promoCodes.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                No promo codes yet. Add one below.
              </p>
            )}
            {promoCodes.map((p, i) => (
              <div
                key={i}
                className={`flex flex-wrap items-center gap-3 p-4 border rounded-2xl transition-all ${
                  p.active
                    ? 'bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800'
                    : 'bg-gray-50 dark:bg-[#0D0D0D] border-gray-200 dark:border-gray-800 opacity-60'
                }`}
              >
                {/* Code */}
                <input
                  value={p.code}
                  onChange={(e) => updatePromo(i, 'code', e.target.value.toUpperCase())}
                  className="w-32 px-3 py-1.5 text-sm font-mono font-bold bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none uppercase tracking-widest"
                />
                {/* Discount */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1} max={100} step={1}
                    value={Math.round(p.discount * 100)}
                    onChange={(e) => updatePromo(i, 'discount', Number(e.target.value) / 100)}
                    className="w-16 px-2 py-1.5 text-sm text-right bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none"
                  />
                  <span className="text-sm text-gray-400">%</span>
                </div>
                {/* Description */}
                <input
                  value={p.description}
                  onChange={(e) => updatePromo(i, 'description', e.target.value)}
                  placeholder="Label (optional)"
                  className="flex-1 min-w-32 px-3 py-1.5 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-[#1A1A1A] dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none"
                />
                {/* Toggle */}
                <button
                  onClick={() => togglePromoActive(i)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    p.active
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {p.active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                  {p.active ? 'Active' : 'Disabled'}
                </button>
                {/* Delete */}
                <button
                  onClick={() => deletePromo(i)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new */}
          <div className="border border-dashed border-[#D4AF37]/40 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-4">Add New Code</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Code</label>
                <input
                  value={newPromo.code}
                  onChange={(e) => setNewPromo((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER30"
                  className="w-36 px-3 py-2 text-sm font-mono bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none uppercase tracking-widest"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Discount %</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1} max={100}
                    value={newPromo.discount}
                    onChange={(e) => setNewPromo((p) => ({ ...p, discount: Number(e.target.value) }))}
                    className="w-20 px-3 py-2 text-sm text-right bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none"
                  />
                  <span className="text-sm text-gray-400">%</span>
                </div>
              </div>
              <div className="flex-1 min-w-40">
                <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Description</label>
                <input
                  value={newPromo.description}
                  onChange={(e) => setNewPromo((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Summer sale 30% off"
                  className="w-full px-3 py-2 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none"
                />
              </div>
              <button
                onClick={addPromo}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black text-sm font-semibold rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          <button
            onClick={savePromos}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#B8962E] disabled:opacity-50 text-black text-sm font-semibold rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Promo Codes
          </button>
        </div>
      )}

      {/* ── Tab: Tax Rate ── */}
      {tab === 'tax' && (
        <div className="max-w-md space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Applied to every order at checkout. Enter as a percentage (e.g. <strong>7.5</strong> for 7.5%).
          </p>
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white">
              Tax / VAT Rate
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0} max={100} step={0.5}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-32 px-4 py-3 text-lg font-bold text-right bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none"
              />
              <span className="text-xl font-bold text-gray-400">%</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                = <strong className="text-[#1A1A1A] dark:text-white">{(parseFloat(taxRate || '0') / 100).toFixed(4)}</strong> decimal
              </span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
              Example: on a ₦10,000 order, VAT = ₦{((parseFloat(taxRate || '0') / 100) * 10000).toLocaleString()}
            </div>
          </div>
          <button
            onClick={saveTax}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#B8962E] disabled:opacity-50 text-black text-sm font-semibold rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Tax Rate
          </button>
        </div>
      )}

      {/* ── Tab: Maintenance Mode ── */}
      {tab === 'maintenance' && (
        <div className="max-w-lg space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            When enabled, a banner is shown at the top of every public page. The admin panel remains accessible.
          </p>
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">Maintenance Mode</p>
                <p className="text-xs text-gray-400 mt-0.5">Shows a banner to all site visitors</p>
              </div>
              <button
                onClick={() => setMaintenanceMode((m) => !m)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  maintenanceMode ? 'bg-[#D4AF37]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Preview banner */}
            {maintenanceMode && (
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <p className="text-sm text-[#1A1A1A] dark:text-white">{maintenanceMessage || 'Maintenance message preview'}</p>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] dark:text-white mb-2">
                Banner Message
              </label>
              <textarea
                rows={3}
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="We're currently performing maintenance. We'll be back shortly."
                className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none resize-none transition"
              />
            </div>
          </div>

          <button
            onClick={saveMaintenance}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#B8962E] disabled:opacity-50 text-black text-sm font-semibold rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Maintenance Settings
          </button>
        </div>
      )}
    </div>
  );
}
