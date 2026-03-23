'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Edit, Trash2, Upload, X, CheckCircle,
  AlertCircle, RefreshCw, ImageIcon, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  stockQuantity: number;
  brand?: string;
  tags: string[];
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const emptyForm = {
  name: '', description: '', price: '', category: '',
  colors: '', brand: '', tags: '', stockQuantity: '0', inStock: true,
};

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {msg}
    </div>
  );
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [filterCat, setFilterCat] = useState('');
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCat) params.set('category', filterCat);
      if (search) params.set('search', search);
      params.set('limit', '200');
      const res = await fetch(`${API}/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.data ?? []);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterCat, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/categories`);
      const data = await res.json();
      setCategories(data.data ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyForm, category: categories[0]?.name ?? '' });
    setSelectedSizes([]);
    setSelectedFiles([]);
    setPreviews([]);
    setExistingImages([]);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      category: p.category, colors: p.colors.join(', '),
      brand: p.brand ?? '', tags: p.tags.join(', '),
      stockQuantity: String(p.stockQuantity), inStock: p.inStock,
    });
    setSelectedSizes(p.sizes ?? []);
    setSelectedFiles([]);
    setPreviews([]);
    setExistingImages(p.images ?? []);
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewFile = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setSelectedFiles((p) => p.filter((_, j) => j !== i));
    setPreviews((p) => p.filter((_, j) => j !== i));
  };

  const toggleSize = (size: string) =>
    setSelectedSizes((p) => p.includes(size) ? p.filter((s) => s !== size) : [...p, size]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      showToast('Name, price and category are required', 'error');
      return;
    }
    if (existingImages.length + selectedFiles.length === 0) {
      showToast('Add at least one product image', 'error');
      return;
    }
    setSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    selectedSizes.forEach((s) => fd.append('sizes', s));
    existingImages.forEach((url) => fd.append('existingImages', url));
    selectedFiles.forEach((f) => fd.append('images', f));

    const url = editProduct
      ? `${API}/admin/products/${editProduct._id}`
      : `${API}/admin/products`;
    const method = editProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      showToast(editProduct ? 'Product updated!' : 'Product created!', 'success');
      setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Product deleted', 'success');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const inp = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProducts}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-black"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <Button variant="outline" onClick={fetchProducts}>Search</Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {inp('name', 'Product Name *', 'text', 'e.g., Agbada Set')}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black resize-none"
                  placeholder="Describe this product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {inp('price', 'Price (₦) *', 'number', '15000')}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  {categories.length > 0 ? (
                    <select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
                    >
                      <option value="">Select category…</option>
                      {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Enter category name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {inp('stockQuantity', 'Stock Quantity', 'number', '10')}
                {inp('brand', 'Brand (optional)', 'text', 'MaxyStyles')}
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sizes Available</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSizes.includes(s)
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {inp('colors', 'Colors (comma-separated)', 'text', 'White, Gold, Navy Blue')}
              {inp('tags', 'Tags (comma-separated)', 'text', 'Traditional, Embroidery')}

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>

                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {existingImages.map((url, i) => (
                      <div key={i} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                        <button
                          onClick={() => setExistingImages((p) => p.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                        ><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {previews.map((url, i) => (
                      <div key={i} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-blue-400" />
                        <button
                          onClick={() => removeNewFile(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                        ><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to add product images</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max 10MB each</p>
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {/* In Stock */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={form.inStock}
                  onChange={(e) => setForm((p) => ({ ...p, inStock: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="inStock" className="text-sm font-medium text-gray-700">In Stock</label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSubmit} disabled={saving} className="flex-1">
                  {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving…</> : `${editProduct ? 'Update' : 'Create'} Product`}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No products yet.</p>
              <Button className="mt-4" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add First Product</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4">Image</th>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Price</th>
                    <th className="pb-3 pr-4">Stock</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt="" className="w-14 h-14 object-cover rounded-lg" />
                        ) : (
                          <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-medium max-w-[180px]">
                        <p className="truncate">{p.name}</p>
                        {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 capitalize">{p.category}</td>
                      <td className="py-3 pr-4 font-semibold">₦{p.price.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <span className={p.stockQuantity <= 5 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(p._id)}
                            disabled={deleting === p._id}
                          >
                            {deleting === p._id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
