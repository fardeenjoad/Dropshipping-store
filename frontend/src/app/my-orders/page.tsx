"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { fetchMyOrders } from '@/services/api';
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  paymentMethod: string;
  shippingAddress: { city: string; state: string; pincode: string };
  createdAt: string;
  trackingNumber?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: 'text-amber-600 bg-amber-50 border-amber-200',    icon: <Clock size={14} /> },
  processing: { label: 'Processing', color: 'text-blue-600 bg-blue-50 border-blue-200',       icon: <Loader2 size={14} className="animate-spin" /> },
  shipped:    { label: 'Shipped',    color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: <Truck size={14} /> },
  delivered:  { label: 'Delivered',  color: 'text-green-600 bg-green-50 border-green-200',    icon: <CheckCircle size={14} /> },
  cancelled:  { label: 'Cancelled',  color: 'text-red-600 bg-red-50 border-red-200',          icon: <XCircle size={14} /> },
};

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await fetchMyOrders();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <Package size={28} className="text-blue-600" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track and manage your orders</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-700">No orders yet</h2>
            <p className="text-gray-400 mt-1 mb-6">Start shopping to see your orders here.</p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              // Use trackingNumber if available, otherwise use _id
              const trackId = order.trackingNumber || order._id;
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Order ID</p>
                      <p className="text-sm font-bold text-gray-700 font-mono">#{order._id.slice(-10).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                      <Link
                        href={`/my-orders/${order._id}`}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        View Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Items preview */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 mb-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      <p className="text-sm text-gray-700 font-medium line-clamp-1">
                        {order.items.map(i => i.name).join(', ')}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-xs text-indigo-600 mt-1.5 font-semibold font-mono bg-indigo-50 border border-indigo-100 inline-block px-2 py-0.5 rounded-lg">
                          📦 Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>

                    {/* Price, date & track button */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                      <p className="text-xl font-extrabold text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {['shipped', 'processing', 'delivered'].includes(order.status) && (
                        <Link
                          href={`/track-order?id=${trackId}`}
                          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Truck size={13} />
                          Track Order
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
