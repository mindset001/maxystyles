'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'completed' | 'failed';

interface OrderProduct {
  product: { _id: string; name: string; price: number; images?: string[] } | null;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

interface Order {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string } | null;
  guestInfo?: { name: string; email: string; phone?: string };
  products: OrderProduct[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock      className="h-3 w-3" /> },
  processing: { label: 'Processing', color: 'bg-blue-100   text-blue-800   border-blue-200',   icon: <AlertCircle className="h-3 w-3" /> },
  shipped:    { label: 'Shipped',    color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Truck       className="h-3 w-3" /> },
  delivered:  { label: 'Delivered',  color: 'bg-green-100  text-green-800  border-green-200',  icon: <CheckCircle className="h-3 w-3" /> },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100    text-red-800    border-red-200',    icon: <XCircle     className="h-3 w-3" /> },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Paid',      color: 'bg-green-100  text-green-800'  },
  failed:    { label: 'Failed',    color: 'bg-red-100    text-red-800'    },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── Order Detail Modal ─────────────────────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) return;
    setUpdating(true);
    await onStatusChange(order._id, selectedStatus);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + Update */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Order Status</p>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleStatusUpdate}
              disabled={updating || selectedStatus === order.status}
              className="mt-6"
            >
              {updating ? 'Saving…' : 'Update Status'}
            </Button>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs">👤</span>
              Customer
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
              {order.user ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.user.name}</p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Account</span>
                  </div>
                  <p className="text-gray-500">{order.user.email}</p>
                  {order.user.phone && <p className="text-gray-500">{order.user.phone}</p>}
                </>
              ) : order.guestInfo ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.guestInfo.name}</p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Guest</span>
                  </div>
                  <p className="text-gray-500">{order.guestInfo.email}</p>
                  {order.guestInfo.phone && <p className="text-gray-500">{order.guestInfo.phone}</p>}
                </>
              ) : (
                <p className="text-gray-400 italic">Unknown customer</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              Items ({order.products.length})
            </h3>
            <div className="space-y-2">
              {order.products.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{item.product?.name ?? 'Deleted product'}</p>
                    <p className="text-gray-500">Size: {item.size} · Colour: {item.color} · Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t font-semibold">
              <span>Total</span>
              <span className="text-lg">₦{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              Shipping Address
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              Payment
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <PaymentBadge status={order.paymentStatus} />
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking #</span>
                  <span className="font-mono">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">{order.notes}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 text-right">
            Placed: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`${API_URL}/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.data ?? []);
      setTotalPages(data.pagination?.pages ?? 1);
      setTotalOrders(data.pagination?.total ?? 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast('Order status updated');
      // Update local state optimistically
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
      if (selectedOrder?._id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, status } : prev);
      }
    } else {
      showToast('Failed to update status');
    }
  };

  // Client-side search filter (by customer name or order ID suffix)
  const displayed = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      (o.user?.name ?? o.guestInfo?.name ?? '').toLowerCase().includes(q) ||
      (o.user?.email ?? o.guestInfo?.email ?? '').toLowerCase().includes(q)
    );
  });

  // Summary counts
  const counts = orders.reduce<Record<string, number>>(
    (acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; },
    {}
  );

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">{totalOrders} total orders</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              statusFilter === s
                ? 'border-blue-500 bg-blue-50'
                : 'border-transparent bg-white hover:border-gray-200'
            } shadow-sm`}
          >
            <p className="text-2xl font-bold text-gray-900">{counts[s] ?? 0}</p>
            <div className="mt-1"><StatusBadge status={s} /></div>
          </button>
        ))}
      </div>

      {/* Filters + Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, email or order ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 mb-3">{error}</p>
              <Button onClick={fetchOrders} variant="outline">Try Again</Button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Order ID</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Items</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Payment</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayed.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {order.user?.name ?? order.guestInfo?.name ?? '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user?.email ?? order.guestInfo?.email ?? '—'}
                        </p>
                        {!order.user && order.guestInfo && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Guest</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{order.products.length}</td>
                      <td className="px-6 py-4 font-semibold">₦{order.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
