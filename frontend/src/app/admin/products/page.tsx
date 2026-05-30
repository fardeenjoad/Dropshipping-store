"use client";

import React, { useState, useEffect } from 'react';
import { fetchProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminFetchCJProductDetails, adminImportCJProduct, adminSyncCJVideos } from '@/services/api';
import { Plus, Edit2, Trash2, X, AlertCircle, Loader2, Download, Sparkles, Video } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  category: string;
  images: string[];
  stock: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    category: '',
    image: '',
    stock: 0
  });

  // CJ Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [cjProductId, setCjProductId] = useState('');
  const [priceMultiplier, setPriceMultiplier] = useState(1.5);
  const [importLoading, setImportLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cjPreview, setCjPreview] = useState<any>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Sync Videos State
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleFetchPreview = async () => {
    if (!cjProductId.trim()) {
      setImportError('Please enter a valid CJ Product ID');
      return;
    }
    setPreviewLoading(true);
    setImportError('');
    setImportSuccess('');
    setCjPreview(null);
    try {
      const details = await adminFetchCJProductDetails(cjProductId.trim());
      setCjPreview(details);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to fetch preview details');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cjProductId.trim()) {
      setImportError('Please enter a valid CJ Product ID');
      return;
    }
    setImportLoading(true);
    setImportError('');
    setImportSuccess('');
    try {
      await adminImportCJProduct(cjProductId.trim(), priceMultiplier);
      setImportSuccess('Product successfully imported from CJ Dropshipping!');
      setCjProductId('');
      setCjPreview(null);
      setTimeout(() => {
        setImportModalOpen(false);
        setImportSuccess('');
        loadProducts();
      }, 1500);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const handleSyncVideos = async () => {
    setSyncLoading(true);
    setSyncMessage('');
    try {
      const result = await adminSyncCJVideos();
      setSyncMessage(result.message || 'Videos synced!');
      loadProducts();
      setTimeout(() => setSyncMessage(''), 4000);
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : 'Sync failed');
      setTimeout(() => setSyncMessage(''), 4000);
    } finally {
      setSyncLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      costPrice: 0,
      category: '',
      image: '',
      stock: 0
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice || 0,
      category: product.category,
      image: product.images?.[0] || '',
      stock: product.stock
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await adminDeleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...formData,
      images: [formData.image || '/images/sample.jpg']
    };

    try {
      if (editingProduct) {
        const updated = await adminUpdateProduct(editingProduct._id, payload);
        setProducts(products.map(p => p._id === editingProduct._id ? updated : p));
      } else {
        const created = await adminCreateProduct(payload);
        setProducts([created, ...products]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Manage Products</h2>
          <p className="text-slate-400 text-sm mt-1">Add, update, or remove products from the catalog.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {syncMessage && (
            <p className="text-xs text-emerald-400 font-medium">{syncMessage}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleSyncVideos}
              disabled={syncLoading}
              title="Fetch and save videos for all CJ products missing a video"
              className="flex items-center gap-2 bg-slate-800 border border-purple-700/50 text-purple-300 hover:text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-purple-900/40 transition shadow-lg shadow-slate-900/40 disabled:opacity-50"
            >
              {syncLoading ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
              <span>Sync Videos</span>
            </button>
            <button
              onClick={() => {
                setImportModalOpen(true);
                setImportError('');
                setImportSuccess('');
                setCjPreview(null);
                setCjProductId('');
              }}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition shadow-lg shadow-slate-900/40"
            >
              <Download size={18} />
              <span>Import from CJ</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-blue-900/40"
            >
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="animate-spin text-blue-500" size={36} />
        </div>
      ) : (
        <div className="bg-slate-950/20 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Selling Price</th>
                  <th className="p-4 text-right">Cost Price</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 text-sm">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-white/5 transition">
                    <td className="p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images?.[0] || '/product-1.png'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-800"
                      />
                    </td>
                    <td className="p-4 font-semibold max-w-[200px] truncate">{product.name}</td>
                    <td className="p-4 text-slate-400">{product.category}</td>
                    <td className="p-4 text-right font-semibold text-white">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right text-slate-400">₹{(product.costPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${
                        product.stock > 10 ? 'bg-emerald-500/10 text-emerald-400' :
                        product.stock > 0 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">No products found. Add one to get started!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Premium Wireless Earbuds"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Tell customers about the product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Cost Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Electronics"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Stock Qty</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. /product-watch.png or https://example.com/image.png"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-900/30"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CJ Product Importer Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Download className="text-blue-500" size={22} />
                <span>Import Product from CJ Dropshipping</span>
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {importError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3">
                  <Sparkles size={20} />
                  <span>{importSuccess}</span>
                </div>
              )}

              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">CJ Product ID (PID)</label>
                  <input
                    type="text"
                    value={cjProductId}
                    onChange={(e) => setCjProductId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 5D9B3A7E-8E2E-4D4E-8C8F-7B2B3B4B5B6B"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchPreview}
                  disabled={previewLoading || importLoading}
                  className="py-2.5 px-5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50 flex items-center gap-2 border border-slate-750"
                >
                  {previewLoading && <Loader2 className="animate-spin" size={16} />}
                  <span>Preview</span>
                </button>
              </div>

              {cjPreview && (
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={cjPreview.productImage}
                      alt={cjPreview.productNameEn || cjPreview.productName}
                      className="w-20 h-20 object-cover rounded-xl border border-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-base truncate">{cjPreview.productNameEn || cjPreview.productName}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cjPreview.description}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400">
                        {cjPreview.categoryName}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Supplier Variants & Inventory</h5>
                    <div className="overflow-x-auto max-h-40 border border-slate-800 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                            <th className="p-2">Color/Size</th>
                            <th className="p-2">Supplier Cost (USD)</th>
                            <th className="p-2">Selling Price (INR)</th>
                            <th className="p-2 text-center">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-slate-300">
                          {cjPreview.variants?.map((v: any) => {
                            const originalCostUsd = v.variantSellPrice || 0;
                            const markedUpPrice = Math.round(originalCostUsd * 80 * priceMultiplier);
                            return (
                              <tr key={v.vid} className="hover:bg-white/5">
                                <td className="p-2 font-medium">{v.variantKey || `${v.color || ''} ${v.size || ''}` || 'Default'}</td>
                                <td className="p-2">${originalCostUsd.toFixed(2)}</td>
                                <td className="p-2 font-semibold text-white">₹{markedUpPrice.toLocaleString('en-IN')}</td>
                                <td className="p-2 text-center">{v.stock}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleImportSubmit} className="space-y-4 pt-4 border-t border-slate-850">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Price Multiplier markup (USD to INR)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="1.0"
                      value={priceMultiplier}
                      onChange={(e) => setPriceMultiplier(Number(e.target.value))}
                      className="w-32 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400">
                      Multiplier applies markup: Cost (USD) × 80 × Multiplier = Selling Price (₹)
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importLoading || !cjPreview}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {importLoading && <Loader2 className="animate-spin" size={18} />}
                    <span>{importLoading ? 'Importing...' : 'Confirm Import'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
