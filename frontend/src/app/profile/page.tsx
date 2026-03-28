'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, MapPin, ShoppingBag, Lock, Camera, LogOut,
  Save, Eye, EyeOff, CheckCircle, AlertCircle, Clock,
  Truck, XCircle, Package, ChevronRight, RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'address' | 'orders' | 'security';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productName?: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

interface Order {
  _id: string;
  products: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod?: string;
  shippingAddress: {
    street: string; city: string; state: string; zipCode: string; country: string;
  };
  createdAt: string;
}

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800',    icon: <AlertCircle className="h-3 w-3" /> },
  shipped:    { label: 'Shipped',    color: 'bg-purple-100 text-purple-800', icon: <Truck className="h-3 w-3" /> },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-800',  icon: <CheckCircle className="h-3 w-3" /> },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800',      icon: <XCircle className="h-3 w-3" /> },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm text-white transition-all ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {msg}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ onToast }: { onToast: (m: string, t: 'success' | 'error') => void }) {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      onToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      onToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAvatar(file);
      onToast('Avatar updated!', 'success');
    } catch (err: any) {
      onToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card className="bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800">
        <CardHeader><CardTitle className="text-base text-gray-900 dark:text-white">Profile Photo</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black rounded-full p-1.5 hover:bg-[#B8962E] transition-colors disabled:opacity-50"
              >
                {uploading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs text-[#D4AF37] hover:underline mt-1 disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Change photo'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800">
        <CardHeader><CardTitle className="text-base text-gray-900 dark:text-white">Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Contact support to change your email</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234..."
              className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black">
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-100 dark:border-gray-800">
        <CardContent className="py-4">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Account role</span>
            <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{user?.role}</span>
          </div>
          {user?.createdAt && (
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>Member since</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Address Tab ───────────────────────────────────────────────────────────────
function AddressTab({ onToast }: { onToast: (m: string, t: 'success' | 'error') => void }) {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [addr, setAddr] = useState({
    street: user?.address?.street ?? '',
    city: user?.address?.city ?? '',
    state: user?.address?.state ?? '',
    zipCode: user?.address?.zipCode ?? '',
    country: user?.address?.country ?? 'Nigeria',
  });

  const f = (key: keyof typeof addr, label: string, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        value={addr[key]}
        onChange={(e) => setAddr((a) => ({ ...a, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
      />
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ address: addr });
      onToast('Address updated!', 'success');
    } catch (err: any) {
      onToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800">
      <CardHeader><CardTitle className="text-base text-gray-900 dark:text-white">Shipping Address</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">This address will be pre-filled at checkout.</p>
        {f('street', 'Street Address', '123 Awolowo Road')}
        <div className="grid grid-cols-2 gap-4">
          {f('city', 'City', 'Lagos')}
          {f('state', 'State', 'Lagos State')}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {f('zipCode', 'ZIP / Postal Code', '100001')}
          {f('country', 'Country', 'Nigeria')}
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black">
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Address'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/orders?userId=${user?.id}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data.data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]" />
    </div>
  );

  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-500 mb-3">{error}</p>
      <Button variant="outline" onClick={fetchOrders}>Try Again</Button>
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-16">
      <ShoppingBag className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No orders yet</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">When you place orders, they&apos;ll show up here.</p>
      <Button asChild><Link href="/products">Start Shopping</Link></Button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">{orders.length} order{orders.length !== 1 ? 's' : ''}</h2>
        <button onClick={fetchOrders} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {orders.map((order) => {
        const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
        const isOpen = expanded === order._id;
        return (
          <Card key={order._id} className="overflow-hidden bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setExpanded(isOpen ? null : order._id)}
              className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-gray-400">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {order.products.length} item{order.products.length !== 1 ? 's' : ''} · ${order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                    {cfg.icon}{cfg.label}
                  </span>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 space-y-3">
                {/* Items */}
                <div className="space-y-2">
                  {order.products.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.productName ?? 'Item'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Shipping */}
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}
                  </span>
                </div>

                {/* Payment */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Payment</span>
                  <span className="capitalize font-medium text-gray-900 dark:text-white">
                    {order.paymentMethod?.replace('_', ' ') ?? '—'} ·{' '}
                    <span className={order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                      {order.paymentStatus}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab({ onToast }: { onToast: (m: string, t: 'success' | 'error') => void }) {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!current || !next || !confirm) { setError('Fill in all fields.'); return; }
    if (next.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (next !== confirm) { setError('New passwords do not match.'); return; }
    setSaving(true);
    try {
      await changePassword(current, next);
      onToast('Password changed successfully!', 'success');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const pwInput = (label: string, value: string, onChange: (v: string) => void, autoComplete: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <Card className="bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800">
      <CardHeader><CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-white"><Lock className="h-4 w-4" /> Change Password</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {pwInput('Current Password', current, setCurrent, 'current-password')}
          {pwInput('New Password (min 6 chars)', next, setNext, 'new-password')}
          {pwInput('Confirm New Password', confirm, setConfirm, 'new-password')}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}
          <Button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8962E] text-black">
            <Lock className="h-4 w-4" />
            {saving ? 'Saving…' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (isLoading || !isAuthenticated) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile',  label: 'Profile',  icon: <User className="h-4 w-4" /> },
    { id: 'address',  label: 'Address',  icon: <MapPin className="h-4 w-4" /> },
    { id: 'orders',   label: 'My Orders', icon: <Package className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0A0A0A] transition-colors duration-300">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800">
              <CardContent className="p-2">
                {/* User summary */}
                <div className="px-3 py-3 mb-1 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Nav items */}
                <nav className="space-y-0.5">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#D4AF37] text-black font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'profile'  && <ProfileTab onToast={showToast} />}
            {activeTab === 'address'  && <AddressTab onToast={showToast} />}
            {activeTab === 'orders'   && <OrdersTab />}
            {activeTab === 'security' && <SecurityTab onToast={showToast} />}
          </main>
        </div>
      </div>
    </div>
  );
}
