"use client";

import React, { useState, useEffect } from 'react';
import { fetchProducts, adminFetchAllOrders } from '@/services/api';
import { ShoppingBag, Receipt, IndianRupee, TrendingUp, AlertCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  user: { name: string; email: string } | string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const ordersData = await adminFetchAllOrders();
        setOrders(ordersData);

        const productsData = await fetchProducts();
        setProducts(productsData.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalRevenue = orders.reduce((acc, order) => {
    if (order.status !== 'cancelled') {
      return acc + order.totalPrice;
    }
    return acc;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#c8ff00]" size={36} />
          <p className="text-gray-400 text-sm font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white">Dashboard Overview</h2>
        <p className="text-gray-400 text-sm mt-1">Real-time statistics and summary of your store.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales */}
        <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-white/10 transition">
          <div className="space-y-1">
            <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
            <p className="text-2xl font-black text-white flex items-center">
              <IndianRupee size={20} className="text-[#c8ff00] mr-1" />
              <span>{totalRevenue.toLocaleString('en-IN')}</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-[#0e0e0e] border border-white/5 rounded-xl flex items-center justify-center text-[#c8ff00]">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-white/10 transition">
          <div className="space-y-1">
            <p className="text-gray-400 text-sm font-medium">Total Orders</p>
            <p className="text-2xl font-black text-white">{orders.length}</p>
          </div>
          <div className="w-12 h-12 bg-[#0e0e0e] border border-white/5 rounded-xl flex items-center justify-center text-[#00cfff]">
            <Receipt size={20} />
          </div>
        </div>

        {/* Products */}
        <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-white/10 transition">
          <div className="space-y-1">
            <p className="text-gray-400 text-sm font-medium">Active Products</p>
            <p className="text-2xl font-black text-white">{products.length}</p>
          </div>
          <div className="w-12 h-12 bg-[#0e0e0e] border border-white/5 rounded-xl flex items-center justify-center text-[#ff4d4d]">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-white/10 transition">
          <div className="space-y-1">
            <p className="text-gray-400 text-sm font-medium">Pending Processing</p>
            <p className="text-2xl font-black text-amber-400">{pendingOrders + processingOrders}</p>
          </div>
          <div className="w-12 h-12 bg-[#0e0e0e] border border-white/5 rounded-xl flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-[#c8ff00] hover:underline font-bold">View All</Link>
          </div>

          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-[#0e0e0e] border border-white/5 rounded-xl hover:border-white/10 transition">
                <div>
                  <p className="text-sm font-bold text-white">
                    {typeof order.user === 'object' ? order.user.name : 'Guest User'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">#{order._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 uppercase tracking-wider ${
                    order.status === 'delivered' ? 'bg-[#c8ff00]/10 text-[#c8ff00]' :
                    order.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                    order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                    'bg-[#00cfff]/10 text-[#00cfff]'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">No orders placed yet.</p>
            )}
          </div>
        </div>

        {/* Active Inventory */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Products Stock</h3>
            <Link href="/admin/products" className="text-xs text-[#c8ff00] hover:underline font-bold">Manage Products</Link>
          </div>

          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div key={product._id} className="flex items-center justify-between p-4 bg-[#0e0e0e] border border-white/5 rounded-xl hover:border-white/10 transition">
                <div className="max-w-[70%]">
                  <p className="text-sm font-bold text-white truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Price: ₹{product.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg ${
                    product.stock > 10 ? 'bg-[#c8ff00]/10 text-[#c8ff00]' :
                    product.stock > 0 ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">No products added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
