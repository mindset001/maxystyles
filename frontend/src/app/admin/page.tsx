'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Edit,
  Image,
  MessageSquare,
  MessageCircle,
  FileText,
  Sun,
  Moon,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Globe,
  Plus,
  Eye,
  Trash2,
  Upload,
  Save,
  Search,
  Link2,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OrdersManagement from '@/components/admin/OrdersManagement';
import CustomersManagement from '@/components/admin/CustomersManagement';
import PortfolioManagement from '@/components/admin/PortfolioManagement';
import ProductsManagement from '@/components/admin/ProductsManagement';
import CategoriesManagement from '@/components/admin/CategoriesManagement';
import ChatsManagement from '@/components/admin/ChatsManagement';
import PaymentLinkGenerator from '@/components/admin/PaymentLinkGenerator';
import ShippingRatesManagement from '@/components/admin/ShippingRatesManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import SettingsManagement from '@/components/admin/SettingsManagement';

const sidebarItems = [
  { id: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'products',     label: 'Products',         icon: Package },
  { id: 'categories',   label: 'Categories',       icon: BarChart3 },
  { id: 'portfolio',    label: 'Portfolio',        icon: Image },
  { id: 'orders',       label: 'Orders',           icon: ShoppingCart },
  { id: 'customers',    label: 'Customers',        icon: Users },
  { id: 'chats',        label: 'Customer Chats',   icon: MessageCircle },
  { id: 'payment-links', label: 'Payment Links',   icon: Link2 },
  { id: 'delivery-rates', label: 'Delivery Rates',  icon: Truck },
  { id: 'content',      label: 'Content Manager',  icon: Edit },
  { id: 'media',        label: 'Media Library',    icon: FileText },
  { id: 'testimonials', label: 'Testimonials',     icon: MessageSquare },
  { id: 'analytics',   label: 'Analytics',        icon: TrendingUp },
  { id: 'settings',    label: 'Settings',         icon: Settings },
];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') ?? '' : '';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  delivered:  'bg-green-100 text-green-800',
  pending:    'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  cancelled:  'bg-red-100 text-red-800',
};

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${getToken()}` };
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch(`${API}/orders?limit=5&page=1`, { headers }),
        fetch(`${API}/admin/products?limit=200`, { headers }),
        fetch(`${API}/users?limit=1&role=customer`, { headers }),
      ]);

      const [ordersData, productsData, usersData] = await Promise.all([
        ordersRes.json(), productsRes.json(), usersRes.json(),
      ]);

      const allOrders = ordersData.data ?? [];
      const allProducts = productsData.data ?? [];

      const totalRevenue = allOrders.reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0);

      setRecentOrders(allOrders.slice(0, 5));
      setLowStock(allProducts.filter((p: any) => p.inStock && p.stockQuantity <= 5).slice(0, 6));
      setStats({
        totalRevenue,
        totalOrders: ordersData.pagination?.total ?? allOrders.length,
        totalProducts: productsData.total ?? allProducts.length,
        totalCustomers: usersData.pagination?.total ?? 0,
      });
    } catch { /* silently fail – server may be offline */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const StatCard = ({ title, value, icon: Icon, prefix = '', accent = false }: {
    title: string; value: number; icon: React.ElementType; prefix?: string; accent?: boolean;
  }) => (
    <div className={`rounded-2xl p-5 border transition-all ${
      accent
        ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
        : 'bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <p className={`text-xs font-semibold uppercase tracking-widest ${
          accent ? 'text-black/60' : 'text-gray-400 dark:text-gray-500'
        }`}>{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          accent ? 'bg-black/15' : 'bg-[#D4AF37]/10'
        }`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-black' : 'text-[#D4AF37]'}`} />
        </div>
      </div>
      {loading
        ? <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
        : <p className="text-3xl font-bold tracking-tight">{prefix}{value.toLocaleString()}</p>
      }
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back — here&apos;s what&apos;s happening today.</p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="text-sm px-4 py-2 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={stats.totalRevenue} icon={BarChart3} prefix="₦" accent />
        <StatCard title="Total Orders"  value={stats.totalOrders}  icon={ShoppingCart} />
        <StatCard title="Products"      value={stats.totalProducts} icon={Package} />
        <StatCard title="Customers"     value={stats.totalCustomers} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-900 dark:text-white">Recent Orders</p>
            <span className="text-xs text-gray-400">Latest 5</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const customer = order.user?.name ?? order.guestInfo?.name ?? 'Guest';
                return (
                  <div key={order._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-[#D4AF37]/5 transition">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{customer}</p>
                      <p className="text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">₦{(order.totalAmount ?? 0).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-900 dark:text-white">Low Stock Alert</p>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />)}
            </div>
          ) : lowStock.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">All products are well-stocked!</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <span className="text-red-500 font-bold text-sm">{p.stockQuantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminSidebar = ({
  activeSection,
  setActiveSection,
  isCollapsed,
  setIsCollapsed,
  onLogout,
}: {
  activeSection: string;
  setActiveSection: (s: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  onLogout: () => void;
}) => {
  return (
    <aside className={`${
      isCollapsed ? 'w-16' : 'w-60'
    } flex-shrink-0 flex flex-col min-h-screen bg-[#0A0A0A] dark:bg-[#0A0A0A] border-r border-[#D4AF37]/15 transition-all duration-300 z-40`}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#D4AF37]/15">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37] flex items-center justify-center">
              <span className="text-black font-black text-xs">M</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">MaxyStyles</p>
              <p className="text-[#D4AF37]/60 text-[10px] leading-none mt-0.5">Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {sidebarItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`flex-shrink-0 w-4 h-4 ${active ? 'text-black' : ''}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-[#D4AF37]/15">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition"
        >
          <LogOut className="flex-shrink-0 w-4 h-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState<'homepage' | 'about' | 'contact' | 'branding'>('homepage');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const logoRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  // ── Section states ──────────────────────────────────────────────────
  const [homepage, setHomepage] = useState({
    heroTitle: 'MaxyStyles',
    heroSubtitle: 'Expert tailoring and custom monogram designing in Osogbo',
    motto: 'Anything but Styles',
    description: 'We create perfectly fitted garments that blend traditional craftsmanship with modern style.',
  });
  const [services, setServices] = useState([
    { title: 'Custom Tailoring', description: 'Perfectly fitted garments crafted to your exact measurements', icon: 'Scissors' },
    { title: 'Monogram Design', description: 'Personalized embroidery and monogram artwork for all garments', icon: 'Palette' },
    { title: 'Expert Craftsmanship', description: 'Years of experience in traditional and contemporary tailoring', icon: 'Award' },
  ]);
  const [about, setAbout] = useState({
    title: 'About MaxyStyles',
    description: 'Located in the heart of Osogbo, Osun State, MaxyStyles specializes in expert tailoring and custom monogram designing.',
  });
  const [achievements, setAchievements] = useState([
    { number: '1000+', label: 'Custom Garments' },
    { number: '500+', label: 'Monogram Designs' },
    { number: '5+', label: 'Years Experience' },
    { number: '5★', label: 'Customer Satisfaction' },
  ]);
  const [contact, setContact] = useState({
    phone1: '08109612952',
    phone2: '08142362093',
    whatsapp: '+2348109612952',
    email: 'info@maxystyles.com',
    address: 'Irewole community, zone 9, kunike junction, idi oro, ilesha garage, Osogbo, Osun State',
    instagram1: 'maxy_styles_',
    instagram2: 'finest_tailor',
    openingHours: 'Mon–Sat 8AM–7PM WAT',
  });
  const [branding, setBranding] = useState({
    logoUrl: '',
    businessName: 'MaxyStyles',
    tagline: 'Anything but Styles',
  });

  // ── Helpers ────────────────────────────────────────────────────────
  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const headers = { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };

  const save = async (section: string, body: object) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/content/${section}`, {
        method: 'PUT', headers, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      showMsg('Saved successfully!');
    } catch (err: any) {
      showMsg(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Load all content on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/admin/content`, { headers: { Authorization: `Bearer ${getToken()}` } });
        const data = await res.json();
        const sections: any[] = data.data ?? [];
        sections.forEach((s: any) => {
          if (s.section === 'homepage' && s.metadata) {
            const m = s.metadata;
            setHomepage({
              heroTitle: m.heroTitle ?? 'MaxyStyles',
              heroSubtitle: m.heroSubtitle ?? '',
              motto: m.motto ?? '',
              description: m.description ?? '',
            });
            if (Array.isArray(m.services) && m.services.length) setServices(m.services);
          }
          if (s.section === 'about') {
            setAbout({ title: s.title ?? '', description: s.content ?? '' });
            if (Array.isArray(s.metadata?.achievements) && s.metadata.achievements.length)
              setAchievements(s.metadata.achievements);
          }
          if (s.section === 'contact' && s.metadata?.contactInfo) {
            const c = s.metadata.contactInfo;
            // Handle both old space-separated string format and new array format
            const phonesArr = Array.isArray(c.phones)
              ? c.phones
              : typeof c.phones === 'string' ? c.phones.split(/\s+/).filter(Boolean) : [];
            const instaArr = Array.isArray(c.instagram)
              ? c.instagram
              : typeof c.instagram === 'string' ? c.instagram.split(/\s+/).filter(Boolean) : [];
            setContact({
              phone1: phonesArr[0] ?? '',
              phone2: phonesArr[1] ?? '',
              whatsapp: c.whatsapp ?? '',
              email: c.email ?? '',
              address: c.address ?? '',
              instagram1: instaArr[0] ?? '',
              instagram2: instaArr[1] ?? '',
              openingHours: c.openingHours ?? '',
            });
          }
          if (s.section === 'branding' && s.metadata) {
            setBranding({
              logoUrl: s.metadata.logoUrl ?? '',
              businessName: s.metadata.businessName ?? 'MaxyStyles',
              tagline: s.metadata.tagline ?? '',
            });
          }
        });
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    })();
  }, []);

  // ── Logo upload ────────────────────────────────────────────────────
  const uploadLogo = async (file: File) => {
    setLogoUploading(true);
    const fd = new FormData();
    fd.append('images', file);
    fd.append('category', 'hero');
    fd.append('isPublic', 'false');
    try {
      const res = await fetch(`${API}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      const url = data.data?.[0]?.url ?? '';
      setBranding(b => ({ ...b, logoUrl: url }));
      showMsg('Logo uploaded — click Save Branding to apply.');
    } catch (err: any) {
      showMsg(err.message || 'Logo upload failed', 'error');
    } finally {
      setLogoUploading(false);
      if (logoRef.current) logoRef.current.value = '';
    }
  };

  // ── Field helper ──────────────────────────────────────────────────
  const field = (label: string, value: string, onChange: (v: string) => void, textarea = false, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea
        ? <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}
    </div>
  );

  const tabs = [
    { id: 'homepage', label: 'Homepage' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'branding', label: 'Logo & Branding' },
  ] as const;

  if (loading) return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Content Manager</h1>
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Content Manager</h1>
        {msg && (
          <span className={`text-sm px-3 py-1.5 rounded-lg ${msgType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HOMEPAGE TAB ─────────────────────────────────────────── */}
      {activeTab === 'homepage' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {field('Business Name / Hero Title', homepage.heroTitle, v => setHomepage(h => ({ ...h, heroTitle: v })))}
              {field('Tagline / Motto', homepage.motto, v => setHomepage(h => ({ ...h, motto: v })))}
              {field('Hero Subtitle', homepage.heroSubtitle, v => setHomepage(h => ({ ...h, heroSubtitle: v })))}
              {field('Hero Description', homepage.description, v => setHomepage(h => ({ ...h, description: v })), true)}
              <Button
                className="w-full" disabled={saving}
                onClick={() => save('homepage', { metadata: { ...homepage, services } })}
              >
                <Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save Homepage'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Services / Features</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setServices(s => [...s, { title: '', description: '', icon: '' }])}>
                  <Plus className="h-4 w-4 mr-1" />Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.map((svc, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Service {i + 1}</span>
                    <button onClick={() => setServices(s => s.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                  {field('Title', svc.title, v => setServices(s => s.map((x, j) => j === i ? { ...x, title: v } : x)))}
                  {field('Description', svc.description, v => setServices(s => s.map((x, j) => j === i ? { ...x, description: v } : x)), true)}
                </div>
              ))}
              <Button
                className="w-full" disabled={saving}
                onClick={() => save('homepage', { metadata: { ...homepage, services } })}
              >
                <Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save Services'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── ABOUT TAB ─────────────────────────────────────────────── */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />About Page</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {field('Page Title', about.title, v => setAbout(a => ({ ...a, title: v })))}
              {field('Description / Story', about.description, v => setAbout(a => ({ ...a, description: v })), true)}
              <Button
                className="w-full" disabled={saving}
                onClick={() => save('about', { title: about.title, content: about.description, metadata: { achievements } })}
              >
                <Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save About Page'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Stats / Achievements</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setAchievements(a => [...a, { number: '', label: '' }])}>
                  <Plus className="h-4 w-4 mr-1" />Add Stat
                </Button>
              </div>
              <CardDescription>Numbers shown on the About page (e.g. &quot;1000+ Custom Garments&quot;)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((ach, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
                    placeholder="1000+"
                    value={ach.number}
                    onChange={e => setAchievements(a => a.map((x, j) => j === i ? { ...x, number: e.target.value } : x))}
                  />
                  <input
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
                    placeholder="Custom Garments"
                    value={ach.label}
                    onChange={e => setAchievements(a => a.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  />
                  <button onClick={() => setAchievements(a => a.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 mt-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                className="w-full mt-2" disabled={saving}
                onClick={() => save('about', { title: about.title, content: about.description, metadata: { achievements } })}
              >
                <Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save Stats'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── CONTACT TAB ───────────────────────────────────────────── */}
      {activeTab === 'contact' && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Contact Information</CardTitle>
            <CardDescription>This information is shown on the Contact page and Footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Phone 1', contact.phone1, v => setContact(c => ({ ...c, phone1: v })), false, '08109612952')}
              {field('Phone 2', contact.phone2, v => setContact(c => ({ ...c, phone2: v })), false, '08142362093')}
              {field('WhatsApp Number', contact.whatsapp, v => setContact(c => ({ ...c, whatsapp: v })), false, '+2348109612952')}
              {field('Email Address', contact.email, v => setContact(c => ({ ...c, email: v })), false, 'info@maxystyles.com')}
              {field('Instagram Handle 1', contact.instagram1, v => setContact(c => ({ ...c, instagram1: v })), false, 'maxy_styles_')}
              {field('Instagram Handle 2', contact.instagram2, v => setContact(c => ({ ...c, instagram2: v })), false, 'finest_tailor')}
              {field('Opening Hours', contact.openingHours, v => setContact(c => ({ ...c, openingHours: v })), false, 'Mon–Sat 8AM–7PM WAT')}
            </div>
            {field('Address', contact.address, v => setContact(c => ({ ...c, address: v })), true)}
            <Button
              className="w-full" disabled={saving}
              onClick={() => save('contact', {
                metadata: {
                  contactInfo: {
                    phones: [contact.phone1, contact.phone2].filter(Boolean),
                    whatsapp: contact.whatsapp,
                    email: contact.email,
                    address: contact.address,
                    instagram: [contact.instagram1, contact.instagram2].filter(Boolean),
                    openingHours: contact.openingHours,
                  }
                }
              })}
            >
              <Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save Contact Info'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── BRANDING TAB ──────────────────────────────────────────── */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" />Logo</CardTitle>
              <CardDescription>Upload your logo. It will appear in the navigation bar across all pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current logo preview */}
              {branding.logoUrl && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                  <img src={branding.logoUrl} alt="Current logo" className="h-16 w-auto object-contain rounded border bg-white p-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Current Logo</p>
                    <a href={branding.logoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate max-w-xs block">View full size</a>
                  </div>
                </div>
              )}

              <input ref={logoRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]); }} />

              <button
                onClick={() => logoRef.current?.click()}
                disabled={logoUploading}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors disabled:opacity-50"
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{logoUploading ? 'Uploading…' : branding.logoUrl ? 'Click to replace logo' : 'Click to upload logo'}</p>
                <p className="text-xs text-gray-400 mt-1">PNG with transparent background recommended</p>
              </button>

              {branding.logoUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (auto-filled after upload)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={branding.logoUrl}
                    onChange={e => setBranding(b => ({ ...b, logoUrl: e.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Brand Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {field('Business Name', branding.businessName, v => setBranding(b => ({ ...b, businessName: v })), false, 'MaxyStyles')}
              {field('Tagline', branding.tagline, v => setBranding(b => ({ ...b, tagline: v })), false, 'Anything but Styles')}
              <Button
                className="w-full" disabled={saving}
                onClick={() => save('branding', { metadata: { logoUrl: branding.logoUrl, businessName: branding.businessName, tagline: branding.tagline } })}
              >
                <Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save Branding'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const MEDIA_CATEGORIES = ['gallery', 'portfolio', 'product', 'hero', 'general', 'other'];

const MediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [uploadCategory, setUploadCategory] = useState('gallery');
  const [uploadPublic, setUploadPublic] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const fileRef = useRef<HTMLInputElement>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 3500);
  };

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterCat !== 'all' ? `?category=${filterCat}` : '';
      const res = await fetch(`${API}/admin/media${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setMediaItems(data.data ?? data ?? []);
    } catch { showMsg('Failed to load media', 'error'); }
    finally { setLoading(false); }
  }, [filterCat]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    const form = new FormData();
    Array.from(files).forEach(f => form.append('images', f));
    form.append('category', uploadCategory);
    form.append('isPublic', String(uploadPublic));
    try {
      const res = await fetch(`${API}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      const data = await res.json();
      if (res.ok) { await fetchMedia(); showMsg(`${data.data?.length ?? 1} image(s) uploaded!`); }
      else showMsg(data.message || 'Upload failed.', 'error');
    } catch { showMsg('Upload error.', 'error'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const togglePublic = async (item: any) => {
    const updated = !item.isPublic;
    setMediaItems(prev => prev.map(m => m._id === item._id ? { ...m, isPublic: updated } : m));
    try {
      await fetch(`${API}/admin/media/${item._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: updated }),
      });
    } catch { fetchMedia(); }
  };

  const changeCategory = async (item: any, category: string) => {
    setMediaItems(prev => prev.map(m => m._id === item._id ? { ...m, category } : m));
    try {
      await fetch(`${API}/admin/media/${item._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
    } catch { fetchMedia(); }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    setMediaItems(prev => prev.filter(m => m._id !== id));
    try {
      await fetch(`${API}/admin/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch { fetchMedia(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        {msg && <span className={`text-sm px-3 py-1 rounded-lg ${msgType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</span>}
      </div>

      {/* Upload card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>Images marked <strong>Show in Gallery</strong> will appear on the public Gallery page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {MEDIA_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                id="uploadPublic"
                checked={uploadPublic}
                onChange={e => setUploadPublic(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="uploadPublic" className="text-sm font-medium text-gray-700">Show in Gallery</label>
            </div>
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
            onChange={e => e.target.files && uploadFiles(e.target.files)} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg text-gray-600 mb-1">{uploading ? 'Uploading…' : 'Click to choose files'}</p>
            <p className="text-gray-500 text-sm">JPG, PNG, WEBP — up to 10 MB each, multiple allowed</p>
          </button>
        </CardContent>
      </Card>

      {/* Gallery grid */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <CardTitle>Media Gallery</CardTitle>
              <CardDescription className="mt-1">{loading ? 'Loading…' : `${mediaItems.length} item${mediaItems.length !== 1 ? 's' : ''}`}</CardDescription>
            </div>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {MEDIA_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />)}
            </div>
          ) : mediaItems.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No images here yet. Upload some above!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaItems.map((item) => (
                <div key={item._id} className="relative group flex flex-col">
                  <div className="relative">
                    <img src={item.url} alt={item.filename ?? ''} className="aspect-square w-full object-cover rounded-lg" />
                    {/* hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <a href={item.url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="secondary"><Eye className="h-3 w-3" /></Button>
                        </a>
                        <Button size="sm" variant="secondary" onClick={() => deleteMedia(item._id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {/* Public badge */}
                    <span className={`absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${item.isPublic ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {item.isPublic ? 'Public' : 'Hidden'}
                    </span>
                  </div>
                  {/* Controls */}
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <select
                      value={item.category}
                      onChange={e => changeCategory(item, e.target.value)}
                      className="border border-gray-200 rounded px-1.5 py-0.5 text-[11px] flex-1 min-w-0"
                    >
                      {MEDIA_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                    <button
                      onClick={() => togglePublic(item)}
                      title={item.isPublic ? 'Hide from gallery' : 'Show in gallery'}
                      className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors flex-shrink-0 ${
                        item.isPublic ? 'border-green-400 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-400' : 'border-gray-300 text-gray-500 hover:bg-green-50 hover:text-green-700 hover:border-green-400'
                      }`}
                    >
                      {item.isPublic ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const fetchTestimonials = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`${API}/admin/testimonials/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setTestimonials(data.data ?? data ?? []);
    } catch { /* ignore */ }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const [newTestimonial, setNewTestimonial] = useState({
    customerName: '',
    customerRole: '',
    testimonialText: '',
    rating: 5,
    projectType: 'Traditional Wear'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addTestimonial = async () => {
    if (!newTestimonial.customerName || !newTestimonial.testimonialText) {
      setMessage('Please fill in all required fields.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API}/admin/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...newTestimonial,
          isPublished: true,
          isFeatured: false
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const saved = json.data ?? json;
        setTestimonials(prev => [saved, ...prev]);
        setNewTestimonial({
          customerName: '',
          customerRole: '',
          testimonialText: '',
          rating: 5,
          projectType: 'Traditional Wear'
        });
        setMessage('Testimonial added successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to add testimonial');
      }
    } catch (error) {
      setMessage('Error adding testimonial. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API}/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response.ok) {
        setTestimonials(prev => prev.filter(t => (t._id ?? t.id) !== id));
        setMessage('Testimonial deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to delete testimonial');
      }
    } catch (error) {
      setMessage('Error deleting testimonial. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
        {message && (
          <div className={`px-4 py-2 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Add New Testimonial */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Testimonial</CardTitle>
          <CardDescription>Add customer reviews and testimonials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name *</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Customer full name"
                value={newTestimonial.customerName}
                onChange={(e) => setNewTestimonial({...newTestimonial, customerName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Customer Role/Title</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Fashion Enthusiast, CEO, etc."
                value={newTestimonial.customerRole}
                onChange={(e) => setNewTestimonial({...newTestimonial, customerRole: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Testimonial Text *</label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-lg h-24"
              placeholder="Customer's testimonial about your service..."
              value={newTestimonial.testimonialText}
              onChange={(e) => setNewTestimonial({...newTestimonial, testimonialText: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={newTestimonial.rating}
                onChange={(e) => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Project Type</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={newTestimonial.projectType}
                onChange={(e) => setNewTestimonial({...newTestimonial, projectType: e.target.value})}
              >
                <option value="Traditional Wear">Traditional Wear</option>
                <option value="Contemporary Fashion">Contemporary Fashion</option>
                <option value="Monogram Designs">Monogram Designs</option>
                <option value="Wedding Attire">Wedding Attire</option>
                <option value="Corporate Wear">Corporate Wear</option>
                <option value="Alterations">Alterations</option>
              </select>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={addTestimonial}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Adding...' : 'Add Testimonial'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Testimonials</CardTitle>
          <CardDescription>Manage published testimonials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loadingList ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />)}
              </div>
            ) : testimonials.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No testimonials yet.</p>
            ) : (
            testimonials.map((testimonial) => {
              const tid = testimonial._id ?? testimonial.id;
              return (
              <div key={tid} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {testimonial.customerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{testimonial.customerName}</h3>
                        <p className="text-sm text-gray-600">{testimonial.customerRole}</p>
                      </div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-yellow-400 rounded-sm mr-1"></div>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">
                      "{testimonial.testimonialText}"
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${testimonial.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {testimonial.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600"
                      onClick={() => deleteTestimonial(tid)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              );
            })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, user, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => logout();
  const activeLabel = sidebarItems.find(i => i.id === activeSection)?.label ?? 'Dashboard';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4] dark:bg-[#0A0A0A]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-gray-400 text-sm">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':    return <DashboardOverview />;
      case 'products':     return <ProductsManagement />;
      case 'categories':   return <CategoriesManagement />;
      case 'portfolio':    return <PortfolioManagement />;
      case 'content':      return <ContentManagement />;
      case 'media':        return <MediaLibrary />;
      case 'testimonials': return <TestimonialsManagement />;
      case 'orders':       return <OrdersManagement />;
      case 'customers':    return <CustomersManagement />;
      case 'chats':        return <ChatsManagement />;
      case 'payment-links': return <PaymentLinkGenerator />;
      case 'delivery-rates': return <ShippingRatesManagement />;
      case 'analytics':    return <AnalyticsDashboard />;
      case 'settings':     return <SettingsManagement />;
      default:             return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F0] dark:bg-[#0F0F0F] transition-colors duration-300">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile drawer */}
      <div className={`fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={(s) => { setActiveSection(s); setMobileOpen(false); }}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onLogout={handleLogout}
        />
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{activeLabel}</p>
              <p className="text-xs text-gray-400">MaxyStyles Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark/light toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Bell */}
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition">
              <Bell className="w-4 h-4" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                <span className="text-black font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase() ?? 'A'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">{user?.name ?? 'Admin'}</p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}