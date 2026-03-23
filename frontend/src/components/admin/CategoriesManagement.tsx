'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Edit, Trash2, Upload, X, CheckCircle,
  AlertCircle, RefreshCw, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = { name: '', description: '', isActive: true };

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

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [existingImage, setExistingImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/categories`);
      const data = await res.json();
      setCategories(data.data ?? []);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditCat(null);
    setForm(emptyForm);
    setImageFile(null);
    setPreview('');
    setExistingImage('');
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description, isActive: cat.isActive });
    setImageFile(null);
    setPreview('');
    setExistingImage(cat.image ?? '');
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    setSaving(true);

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('description', form.description.trim());
    fd.append('isActive', String(form.isActive));
    if (existingImage) fd.append('existingImage', existingImage);
    if (imageFile) fd.append('image', imageFile);

    const url = editCat
      ? `${API}/admin/categories/${editCat._id}`
      : `${API}/admin/categories`;
    const method = editCat ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      showToast(editCat ? 'Category updated!' : 'Category created!', 'success');
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/admin/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Category deleted', 'success');
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const currentImage = preview || existingImage;

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCategories}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{editCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Traditional Wear"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
                />
                {form.name && (
                  <p className="text-xs text-gray-400 mt-1">
                    Slug: <span className="font-mono">{form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Brief description of this category…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black resize-none"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image (optional)</label>
                {currentImage ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentImage} alt="" className="w-full h-40 object-cover rounded-lg border" />
                    <button
                      onClick={() => { setImageFile(null); setPreview(''); setExistingImage(''); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    ><X className="h-3.5 w-3.5" /></button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-lg"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload category image</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (visible on site)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSubmit} disabled={saving} className="flex-1">
                  {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving…</> : `${editCat ? 'Update' : 'Create'} Category`}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">No categories yet. Create one to organise your products.</p>
          <Button className="mt-4" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add First Category</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card key={cat._id} className={`overflow-hidden ${!cat.isActive ? 'opacity-60' : ''}`}>
              {cat.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.image} alt={cat.name} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Layers className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mb-2">{cat.slug}</p>
                {cat.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cat.description}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(cat)}>
                    <Edit className="h-3.5 w-3.5 mr-1" />Edit
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(cat._id)}
                    disabled={deleting === cat._id}
                  >
                    {deleting === cat._id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
