'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Eye, TrendingUp, ShoppingCart, Users, Package,
  Loader2, RefreshCw, Calendar, Award,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayPoint { _id: { year: number; month: number; day: number }; count?: number; total?: number }
interface TopPage  { _id: string; label: string; count: number }
interface TopProduct { _id: string; revenue: number; units: number }
interface Analytics {
  views: {
    total: number; today: number; yesterday: number;
    thisWeek: number; thisMonth: number;
    byDay: DayPoint[]; topPages: TopPage[];
  };
  orders: {
    total: number; thisMonth: number; lastMonth: number;
    byStatus: { _id: string; count: number }[];
    revenueByDay: DayPoint[];
  };
  revenue: { total: number; lastMonth: number };
  customers: { total: number; thisMonth: number };
  products: { total: number; topProducts: TopProduct[] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pctChange(now: number, prev: number): string {
  if (prev === 0) return now > 0 ? '+100%' : '—';
  const p = ((now - prev) / prev) * 100;
  return `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`;
}

function fill30Days(data: DayPoint[], valueKey: 'count' | 'total'): { label: string; value: number }[] {
  const map: Record<string, number> = {};
  data.forEach((d) => {
    const key = `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`;
    map[key] = (d.count ?? d.total ?? 0) as number;
  });
  const result: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    result.push({ label: `${dt.getDate()}/${dt.getMonth()+1}`, value: map[key] ?? 0 });
  }
  return result;
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data, color = '#D4AF37', label = '' }: {
  data: { label: string; value: number }[];
  color?: string;
  label?: string;
}) {
  const W = 700; const H = 140; const PAD = 8;
  const max = Math.max(...data.map(d => d.value), 1);
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (d.value / max) * (H - PAD * 2);
    return { x, y, ...d };
  });
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = [
    `M ${pts[0].x},${H - PAD}`,
    ...pts.map(p => `L ${p.x},${p.y}`),
    `L ${pts[pts.length-1].x},${H - PAD}`,
    'Z',
  ].join(' ');

  // Tick labels: show every 5th
  const ticks = pts.filter((_, i) => i % 5 === 0 || i === pts.length - 1);

  return (
    <div className="relative">
      {label && <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 140 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${color.replace('#','')})`} />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          i % 5 === 0 || i === pts.length - 1 ? (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
          ) : null
        ))}
        {ticks.map((p, i) => (
          <text key={i} x={p.x} y={H} textAnchor="middle" fontSize="9" fill="#9CA3AF">{p.label}</text>
        ))}
      </svg>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function Stat({ icon: Icon, label, value, sub, subGood }: {
  icon: any; label: string; value: string | number; sub?: string; subGood?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
        <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-[#D4AF37]" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 ${subGood === undefined ? 'text-gray-400 dark:text-gray-500' : subGood ? 'text-green-500' : 'text-red-400'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range] = useState<'30d'>('30d');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/analytics`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      setError('Could not load analytics data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
        <p className="text-sm">Loading analytics…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <TrendingUp className="h-7 w-7 opacity-30" />
        <p className="text-sm text-center">{error}</p>
        <button onClick={fetchData} className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    );
  }

  const viewsChartData    = fill30Days(data.views.byDay, 'count');
  const revenueChartData  = fill30Days(data.orders.revenueByDay, 'total');

  const viewChangeVsYesterday = data.views.yesterday > 0
    ? pctChange(data.views.today, data.views.yesterday)
    : data.views.today > 0 ? 'New views today' : 'No views yet';

  const statusColors: Record<string, string> = {
    pending:    'bg-yellow-400',
    processing: 'bg-blue-400',
    shipped:    'bg-purple-400',
    delivered:  'bg-green-400',
    cancelled:  'bg-red-400',
  };
  const totalOrdersForPct = data.orders.byStatus.reduce((s, b) => s + b.count, 0) || 1;

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
            Analytics
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Last 30 days · updates in real-time</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-[#D4AF37] transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={Eye}
          label="Total Views"
          value={data.views.total.toLocaleString()}
          sub={`${data.views.today.toLocaleString()} today · ${viewChangeVsYesterday} vs yesterday`}
        />
        <Stat
          icon={Calendar}
          label="Views This Month"
          value={data.views.thisMonth.toLocaleString()}
          sub={`${data.views.thisWeek.toLocaleString()} this week`}
        />
        <Stat
          icon={ShoppingCart}
          label="Orders This Month"
          value={data.orders.thisMonth.toLocaleString()}
          sub={pctChange(data.orders.thisMonth, data.orders.lastMonth) + ' vs last month'}
          subGood={data.orders.thisMonth >= data.orders.lastMonth}
        />
        <Stat
          icon={TrendingUp}
          label="Total Revenue"
          value={`₦${data.revenue.total.toLocaleString()}`}
          sub={`₦${data.revenue.lastMonth.toLocaleString()} last month`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat icon={Users}   label="Total Customers"  value={data.customers.total.toLocaleString()} sub={`+${data.customers.thisMonth} this month`} />
        <Stat icon={Package} label="Products Listed"  value={data.products.total.toLocaleString()} />
        <Stat icon={ShoppingCart} label="All-time Orders"   value={data.orders.total.toLocaleString()} />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-1">Page Views</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Daily views over the last 30 days</p>
          <LineChart data={viewsChartData} color="#D4AF37" />
        </div>
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-1">Revenue (₦)</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Daily revenue from completed orders — last 30 days</p>
          <LineChart data={revenueChartData} color="#3B82F6" />
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top pages */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#D4AF37]" />
            Top Pages
          </p>
          {data.views.topPages.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No page view data yet. Views will appear as customers browse the site.</p>
          ) : (
            <div className="space-y-3">
              {data.views.topPages.map((p, i) => {
                const pct = data.views.total > 0 ? (p.count / data.views.total) * 100 : 0;
                return (
                  <div key={p._id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 text-[#1A1A1A] dark:text-gray-200 truncate">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 w-4">{i + 1}</span>
                        <span className="truncate">{p.label || p._id}</span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 shrink-0 ml-3">{p.count.toLocaleString()} views</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D4AF37] rounded-full transition-all"
                        style={{ width: `${pct.toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Order status */}
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[#D4AF37]" />
              Order Status
            </p>
            {data.orders.byStatus.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-2.5">
                {data.orders.byStatus.map((s) => {
                  const pct = (s.count / totalOrdersForPct) * 100;
                  return (
                    <div key={s._id} className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${statusColors[s._id] ?? 'bg-gray-400'}`} />
                      <span className="text-xs capitalize text-[#1A1A1A] dark:text-gray-200 flex-1">{s._id}</span>
                      <span className="text-xs text-gray-400 w-6 text-right">{s.count}</span>
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${statusColors[s._id] ?? 'bg-gray-400'} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top products */}
          <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-[#D4AF37]" />
              Top Products
            </p>
            {data.products.topProducts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {data.products.topProducts.map((p, i) => (
                  <div key={p._id} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1A1A1A] dark:text-gray-200 truncate">{p._id || 'Custom Order'}</p>
                      <p className="text-[10px] text-gray-400">{p.units} unit{p.units !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#D4AF37] shrink-0">₦{p.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
