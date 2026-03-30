'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, Truck, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Default rates mirrored from shippingRates.ts (used for reset) ─────────────
const DEFAULT_RATES: Record<string, number> = {
  'Lagos': 1500,
  'Ogun': 2500, 'Oyo': 2500, 'Osun': 2500, 'Ondo': 2500, 'Ekiti': 2500, 'Edo': 2500,
  'Delta': 3500, 'Rivers': 3500, 'Anambra': 3500, 'Imo': 3500, 'Abia': 3500,
  'Enugu': 3500, 'Ebonyi': 3500, 'Cross River': 3500, 'Akwa Ibom': 3500, 'Bayelsa': 3500,
  'FCT (Abuja)': 4000, 'Kwara': 4000, 'Kogi': 4000, 'Niger': 4000,
  'Benue': 4000, 'Nasarawa': 4000, 'Plateau': 4000,
  'Kano': 5000, 'Kaduna': 5000, 'Zamfara': 5000, 'Sokoto': 5000,
  'Kebbi': 5000, 'Katsina': 5000, 'Jigawa': 5000,
  'Borno': 5500, 'Yobe': 5500, 'Gombe': 5500,
  'Bauchi': 5500, 'Adamawa': 5500, 'Taraba': 5500,
};

const ZONES: { label: string; color: string; states: string[] }[] = [
  {
    label: 'Zone 1 — Lagos',
    color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800',
    states: ['Lagos'],
  },
  {
    label: 'Zone 2 — South West',
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800',
    states: ['Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti', 'Edo'],
  },
  {
    label: 'Zone 3 — South East / South South',
    color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800',
    states: ['Delta', 'Rivers', 'Anambra', 'Imo', 'Abia', 'Enugu', 'Ebonyi', 'Cross River', 'Akwa Ibom', 'Bayelsa'],
  },
  {
    label: 'Zone 4 — North Central / FCT',
    color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800',
    states: ['FCT (Abuja)', 'Kwara', 'Kogi', 'Niger', 'Benue', 'Nasarawa', 'Plateau'],
  },
  {
    label: 'Zone 5 — North West',
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800',
    states: ['Kano', 'Kaduna', 'Zamfara', 'Sokoto', 'Kebbi', 'Katsina', 'Jigawa'],
  },
  {
    label: 'Zone 6 — North East',
    color: 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800',
    states: ['Borno', 'Yobe', 'Gombe', 'Bauchi', 'Adamawa', 'Taraba'],
  },
];

export default function ShippingRatesManagement() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/shipping-rates`);
      const data = await res.json();
      setRates(data.rates || DEFAULT_RATES);
    } catch {
      setRates(DEFAULT_RATES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const setFee = (state: string, value: string) => {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    setRates((r) => ({ ...r, [state]: isNaN(num) ? 0 : num }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/shipping-rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates }),
      });
      if (!res.ok) throw new Error();
      showToast('success', 'Delivery rates saved successfully.');
      setDirty(false);
    } catch {
      showToast('error', 'Failed to save rates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setRates(DEFAULT_RATES);
    setDirty(true);
  };

  const applyZoneFee = (zone: { states: string[] }, fee: number) => {
    setRates((r) => {
      const next = { ...r };
      zone.states.forEach((s) => (next[s] = fee));
      return next;
    });
    setDirty(true);
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#D4AF37]" />
            Delivery Rates
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Set per-state delivery fees. Changes apply immediately to the checkout page.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-[#D4AF37] hover:bg-[#B8962E] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <AlertTriangle className="h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Zones */}
      {ZONES.map((zone) => {
        const feesInZone = zone.states.map((s) => rates[s] ?? 0);
        const allSame = feesInZone.every((f) => f === feesInZone[0]);
        return (
          <div key={zone.label} className={`border rounded-2xl overflow-hidden ${zone.color}`}>
            {/* Zone header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-inherit">
              <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{zone.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Set all to:</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  placeholder={allSame ? String(feesInZone[0]) : 'mixed'}
                  onBlur={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) { applyZoneFee(zone, v); e.target.value = ''; }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                  className="w-28 px-3 py-1.5 text-xs bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-lg text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>
            {/* State rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-gray-800">
              {zone.states.map((state) => (
                <div
                  key={state}
                  className="flex items-center justify-between gap-3 px-5 py-3 bg-white dark:bg-[#111]"
                >
                  <span className="text-sm text-[#1A1A1A] dark:text-gray-200 truncate">{state}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-gray-400">₦</span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={rates[state] ?? 0}
                      onChange={(e) => setFee(state, e.target.value)}
                      className="w-24 px-2 py-1 text-sm text-right bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Sticky save bar when dirty */}
      {dirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] px-6 py-3 rounded-2xl shadow-xl text-sm">
          <span className="font-medium">You have unsaved changes</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8962E] text-black text-xs font-semibold px-4 py-1.5 rounded-xl transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save now
          </button>
        </div>
      )}
    </div>
  );
}
