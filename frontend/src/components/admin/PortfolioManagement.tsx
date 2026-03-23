'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Edit, Trash2, Upload, X, Eye, EyeOff,
  CheckCircle, AlertCircle, RefreshCw, ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PORTFOLIO_CATEGORIES = [
  'Traditional Wear', 'Contemporary Fashion', 'Monogram Designs',
  'Wedding Attire', 'Corporate Wear', 'Alterations',
];

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  tags: string[];
  client: string;
  completionTime: string;
  rating: number;
  year: number;
  isPublished: boolean;
  createdAt: string;
}

const emptyForm = {
  title: '', description: '', category: PORTFOLIO_CATEGORIES[0],
  client: '', completionTime: '', rating: '5', year: String(new Date().getFullYear()),
  tags: '', isPublished: true,
};

// ── Toast ─────────────────────────────────────────────────────────────────────
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

export default function PortfolioManagement() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/portfolio`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : (data.data ?? []));
    } catch {
      showToast('Failed to load portfolio', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setSelectedFiles([]);
    setPreviews([]);
    setExistingImages([]);
    setShowForm(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditItem(item);
    setForm({
      title: item.title, description: item.description, category: item.category,
      client: item.client, completionTime: item.completionTime,
      rating: String(item.rating), year: String(item.year),
      tags: item.tags.join(', '), isPublished: item.isPublished,
    });
    setSelectedFiles([]);
    setPreviews([]);
    setExistingImages(item.images ?? []);
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewFile = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setSelectedFiles((p) => p.filter((_, j) => j !== i));
    setPreviews((p) => p.filter((_, j) => j !== i));
  };

  const removeExistingImage = (i: number) => {
    setExistingImages((p) => p.filter((_, j) => j !== i));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.client.trim()) {
      showToast('Title and client are required', 'error');
      return;
    }
    if (existingImages.length + selectedFiles.length === 0) {
      showToast('Add at least one image', 'error');
      return;
    }
    setSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    existingImages.forEach((url) => fd.append('existingImages', url));
    selectedFiles.forEach((f) => fd.append('images', f));

    const url = editItem
      ? `${API}/admin/portfolio/upload/${editItem._id}`
      : `${API}/admin/portfolio/upload`;
    const method = editItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      showToast(editItem ? 'Portfolio item updated!' : 'Portfolio item created!', 'success');
      setShowForm(false);
      fetchItems();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this portfolio item?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/admin/portfolio/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Deleted successfully', 'success');
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const f = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
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

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchItems}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Project</Button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{editItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {f('title', 'Project Title *', 'text', 'e.g., Custom Agbada with Gold Embroidery')}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black resize-none"
                  placeholder="Describe this project..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
                  >
                    {PORTFOLIO_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {f('client', 'Client Name *', 'text', 'Client name')}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {f('completionTime', 'Completion Time', 'text', '2 weeks')}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
                  >
                    {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                {f('year', 'Year', 'number', String(new Date().getFullYear()))}
              </div>
              {f('tags', 'Tags (comma-separated)', 'text', 'Embroidery, Traditional, Gold')}

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Images *</label>

                {/* Existing images (edit mode) */}
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {existingImages.map((url, i) => (
                      <div key={i} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                        <button
                          onClick={() => removeExistingImage(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                        ><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New file previews */}
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
                  <p className="text-sm text-gray-600">Click to add images (max 10MB each)</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP supported</p>
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={form.isPublished}
                  onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Published (visible on portfolio page)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSubmit} disabled={saving} className="flex-1">
                  {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving…</> : `${editItem ? 'Update' : 'Create'} Portfolio Item`}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items table */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No portfolio items yet.</p>
              <Button className="mt-4" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add First Item</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4">Image</th>
                    <th className="pb-3 pr-4">Title</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Client</th>
                    <th className="pb-3 pr-4">Rating</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        {item.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.images[0]} alt="" className="w-14 h-14 object-cover rounded-lg" />
                        ) : (
                          <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-medium max-w-[200px]">
                        <p className="truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.year}</p>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{item.category}</td>
                      <td className="py-3 pr-4 text-gray-600">{item.client}</td>
                      <td className="py-3 pr-4">{'⭐'.repeat(item.rating)}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(item._id)}
                            disabled={deleting === item._id}
                          >
                            {deleting === item._id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
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
