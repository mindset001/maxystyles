'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone,
  MapPin,
  Shield,
  ShoppingBag,
  Calendar,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────────

type UserRole = 'admin' | 'customer';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  return role === 'admin' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
      <Shield className="h-3 w-3" /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
      <Users className="h-3 w-3" /> Customer
    </span>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircle className="h-3 w-3" /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      <XCircle className="h-3 w-3" /> Unverified
    </span>
  );
}

function Avatar({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) {
    return <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />;
  }
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

// ── Delete Confirmation ────────────────────────────────────────────────────────

function DeleteConfirmModal({
  customer,
  onConfirm,
  onCancel,
  deleting,
}: {
  customer: Customer;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Delete Customer</h2>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-6">
          Are you sure you want to delete <span className="font-semibold">{customer.name}</span> ({customer.email})?
          All associated data will be permanently removed.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={deleting}>Cancel</Button>
          <Button
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting ? 'Deleting…' : 'Delete Customer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Customer Detail Modal ──────────────────────────────────────────────────────

function CustomerDetailModal({
  customer,
  onClose,
  onDelete,
  onRoleChange,
}: {
  customer: Customer;
  onClose: () => void;
  onDelete: (c: Customer) => void;
  onRoleChange: (id: string, role: UserRole) => Promise<void>;
}) {
  const [updatingRole, setUpdatingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(customer.role);

  const handleRoleUpdate = async () => {
    if (selectedRole === customer.role) return;
    setUpdatingRole(true);
    await onRoleChange(customer._id, selectedRole);
    setUpdatingRole(false);
  };

  const hasAddress = customer.address && Object.values(customer.address).some(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Avatar name={customer.name} avatar={customer.avatar} />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{customer.name}</h2>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <RoleBadge role={customer.role} />
            <VerifiedBadge verified={customer.isVerified} />
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-700">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">{customer.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-500">
                Joined {new Date(customer.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Address */}
          {hasAddress && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" /> Address
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-0.5">
                {customer.address?.street && <p>{customer.address.street}</p>}
                {(customer.address?.city || customer.address?.state) && (
                  <p>
                    {[customer.address.city, customer.address.state, customer.address.zipCode]
                      .filter(Boolean).join(', ')}
                  </p>
                )}
                {customer.address?.country && <p>{customer.address.country}</p>}
              </div>
            </div>
          )}

          {/* Role management */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" /> Role
            </h3>
            <div className="flex items-center gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <Button
                onClick={handleRoleUpdate}
                disabled={updatingRole || selectedRole === customer.role}
                size="sm"
              >
                {updatingRole ? 'Saving…' : 'Update'}
              </Button>
            </div>
            {selectedRole === 'admin' && customer.role !== 'admin' && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Granting admin access gives full control of the dashboard.
              </p>
            )}
          </div>

          {/* Danger zone */}
          {customer.role !== 'admin' && (
            <div className="border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
              <p className="text-xs text-gray-500 mb-3">Permanently delete this customer and all their data.</p>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => { onClose(); onDelete(customer); }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete Customer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toDelete, setToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`${API_URL}/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data.data ?? []);
      setTotalPages(data.pagination?.pages ?? 1);
      setTotalCustomers(data.pagination?.total ?? 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, debouncedSearch]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { setPage(1); }, [roleFilter]);

  const handleRoleChange = async (id: string, role: UserRole) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      showToast('Role updated successfully');
      setCustomers((prev) => prev.map((c) => c._id === id ? { ...c, role } : c));
      if (selectedCustomer?._id === id) setSelectedCustomer((prev) => prev ? { ...prev, role } : prev);
    } else {
      showToast('Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}/users/${toDelete._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleting(false);
    if (res.ok) {
      showToast('Customer deleted');
      setCustomers((prev) => prev.filter((c) => c._id !== toDelete._id));
      setTotalCustomers((n) => n - 1);
      setToDelete(null);
    } else {
      showToast('Failed to delete customer');
    }
  };

  const adminCount    = customers.filter((c) => c.role === 'admin').length;
  const verifiedCount = customers.filter((c) => c.isVerified).length;

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toastMsg}
        </div>
      )}

      {/* Modals */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onDelete={(c) => setToDelete(c)}
          onRoleChange={handleRoleChange}
        />
      )}
      {toDelete && (
        <DeleteConfirmModal
          customer={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">{totalCustomers} total users</p>
        </div>
        <Button onClick={fetchCustomers} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users',  value: totalCustomers, icon: <Users       className="h-5 w-5 text-blue-600"   />, bg: 'bg-blue-50'   },
          { label: 'Admins',       value: adminCount,     icon: <Shield      className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'Verified',     value: verifiedCount,  icon: <UserCheck   className="h-5 w-5 text-green-600"  />, bg: 'bg-green-50'  },
          { label: 'Unverified',   value: customers.length - verifiedCount, icon: <UserX className="h-5 w-5 text-gray-400" />, bg: 'bg-gray-50' },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>
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
              <Button onClick={fetchCustomers} variant="outline">Try Again</Button>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No customers found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Phone</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Joined</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={customer.name} avatar={customer.avatar} />
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{customer.phone ?? '—'}</td>
                      <td className="px-6 py-4"><RoleBadge role={customer.role} /></td>
                      <td className="px-6 py-4"><VerifiedBadge verified={customer.isVerified} /></td>
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(customer.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCustomer(customer)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" /> View
                          </Button>
                          {customer.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setToDelete(customer)}
                              className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
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
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
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
