"use client";

import React, { useState, useEffect } from 'react';
import { adminFetchAllOrders, adminUpdateOrderStatus, adminForwardOrderToSupplier } from '@/services/api';
import { Truck, Check, AlertCircle, Eye, RefreshCw, Send, Loader2 } from 'lucide-react';

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  user: { name: string; email: string } | null;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  totalPrice: number;
  status: string;
  paymentResult?: {
    id?: string;
    status?: string;
    email?: string;
  };
  trackingNumber?: string;
  forwardedToSupplier?: boolean;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status edit form state
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminFetchAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const updated = await adminUpdateOrderStatus(selectedOrder._id, { status, trackingNumber });
      setOrders(orders.map(o => o._id === selectedOrder._id ? { ...o, status: updated.status, trackingNumber: updated.trackingNumber, deliveredAt: updated.deliveredAt } : o));
      setSelectedOrder({ ...selectedOrder, status: updated.status, trackingNumber: updated.trackingNumber });
      alert('Order status updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const handleForwardSupplier = async (id: string) => {
    try {
      const res = await adminForwardOrderToSupplier(id);
      setOrders(orders.map(o => o._id === id ? { ...o, forwardedToSupplier: true, status: 'processing' } : o));
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, forwardedToSupplier: true, status: 'processing' });
      }
      alert(res.message || 'Order successfully forwarded to CJ Dropshipping');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to forward order');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white">Manage Orders</h2>
        <p className="text-slate-400 text-sm mt-1">Track orders, update shipping statuses, and forward to supplier.</p>
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Orders Table */}
          <div className="xl:col-span-2 bg-slate-950/20 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300 text-sm">
                  {orders.map((order) => (
                    <tr key={order._id} className={`hover:bg-white/5 transition ${selectedOrder?._id === order._id ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''}`}>
                      <td className="p-4 font-mono font-bold text-xs uppercase">#{order._id.slice(-6)}</td>
                      <td className="p-4 font-semibold">{order.user ? order.user.name : 'Guest User'}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">₹{order.totalPrice.toLocaleString('en-IN')}</div>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 uppercase tracking-tight ${
                          order.paymentResult?.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.paymentResult?.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          order.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.forwardedToSupplier ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <Check size={14} />
                            <span>CJ Fwd</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleForwardSupplier(order._id)}
                            disabled={order.status === 'cancelled'}
                            className="inline-flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600 hover:text-white text-blue-400 px-2 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send size={12} />
                            <span>Fwd to CJ</span>
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details & Management Sidebar Panel */}
          <div className="xl:col-span-1">
            {selectedOrder ? (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl animate-in fade-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">Order Details</h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">#{selectedOrder._id.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Items Ordered</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm bg-slate-900/60 p-3 rounded-xl border border-slate-800/30">
                        <div>
                          <p className="font-semibold text-slate-200">{item.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <p className="font-bold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipping Address</h4>
                  <div className="text-sm bg-slate-900/60 p-4 rounded-xl border border-slate-800/30 text-slate-300 space-y-1">
                    <p className="font-bold text-slate-200">{selectedOrder.user ? selectedOrder.user.name : 'Guest Customer'}</p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                    <p className="text-slate-400 font-medium text-xs">{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Information</h4>
                  <div className="text-sm bg-slate-900/60 p-4 rounded-xl border border-slate-800/30 text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className={`font-bold uppercase ${selectedOrder.paymentResult?.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {selectedOrder.paymentResult?.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    {selectedOrder.paymentResult?.id && (
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-400">Payment ID:</span>
                        <span className="font-mono text-slate-350">{selectedOrder.paymentResult.id}</span>
                      </div>
                    )}
                    {selectedOrder.paymentResult?.email && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Payer Email:</span>
                        <span className="text-slate-300">{selectedOrder.paymentResult.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Update Status Form */}
                <form onSubmit={handleUpdateStatus} className="space-y-4 border-t border-slate-800 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Update Order Status</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Tracking Number</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. IN123456789"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                    >
                      <Truck size={16} />
                      <span>Update Status</span>
                    </button>
                  </div>
                </form>

                {/* Supplier Action Panel */}
                <div className="border-t border-slate-800 pt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-medium">Supplier Integration</h4>
                  {selectedOrder.forwardedToSupplier ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-xl text-center flex items-center justify-center gap-2">
                      <Check size={18} />
                      <span>Forwarded to CJ Dropshipping</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleForwardSupplier(selectedOrder._id)}
                      disabled={selectedOrder.status === 'cancelled'}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 hover:text-blue-300 font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw size={16} className="animate-pulse" />
                      <span>Send to CJ Supplier</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/20 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400 h-full flex flex-col justify-center min-h-[300px]">
                <Eye className="mx-auto mb-3 opacity-30" size={36} />
                <p className="text-sm">Select an order from the list to view details and manage fulfillment.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
