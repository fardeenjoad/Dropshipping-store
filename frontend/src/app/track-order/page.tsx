"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Package, Truck, CheckCircle2, Circle, Search, Calendar, Hash, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchOrderById } from '@/services/api';
import { useSearchParams } from 'next/navigation';

const STEPS = ["Placed", "Paid", "Processed", "Shipped", "Delivered"];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get('id');

  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (idToTrack: string) => {
    if (!idToTrack.trim()) {
      setError('Please enter an Order ID.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const data = await fetchOrderById(idToTrack.trim());
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found. Please verify your Order ID and login status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryOrderId) {
      setOrderId(queryOrderId);
      handleTrack(queryOrderId);
    }
  }, [queryOrderId]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(orderId);
  };

  const getStepStatus = (step: string) => {
    if (!order) return 'pending';
    switch (step) {
      case 'Placed':
        return 'completed';
      case 'Paid':
        return order.paidAt || order.status !== 'pending' ? 'completed' : 'pending';
      case 'Processed':
        return order.forwardedToSupplier || ['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : 'pending';
      case 'Shipped':
        return ['shipped', 'delivered'].includes(order.status) ? 'completed' : 'pending';
      case 'Delivered':
        return order.status === 'delivered' ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  const getStepDate = (step: string) => {
    if (!order) return null;
    switch (step) {
      case 'Placed':
        return order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
      case 'Paid':
        return order.paidAt ? new Date(order.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
      case 'Processed':
        return order.forwardedToSupplier ? 'Forwarded to supplier' : null;
      case 'Shipped':
        return order.trackingNumber ? `Tracking generated` : null;
      case 'Delivered':
        return order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex-grow py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#070b19] via-[#091026] to-[#050714]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Track Your Order
          </h1>
          <p className="text-slate-400">Enter your <strong className="text-slate-300">Order ID</strong> or <strong className="text-slate-300">Tracking Number</strong> from your order confirmation.</p>
        </div>

        {/* Search Box */}
        <form onSubmit={onSubmit} className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-4 mb-12 shadow-2xl">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Enter Order ID or Tracking Number (e.g. TM-56964)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 focus:ring-2 focus:ring-blue-500 outline-none text-white font-semibold transition-all placeholder:text-slate-650"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>}
            <span>Track Status</span>
          </button>
        </form>

        {error && (
           <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-5 rounded-2xl mb-12">
             <div className="flex items-center gap-3 mb-3">
               <AlertCircle size={20} className="shrink-0" />
               <span className="font-semibold">{error}</span>
             </div>
             <p className="text-sm text-slate-400 ml-8">
               💡 <strong className="text-slate-300">Tip:</strong> Go to{' '}
               <a href="/my-orders" className="text-blue-400 underline hover:text-blue-300">My Orders</a>{' '}
               and click the <strong className="text-slate-300">"Track Order"</strong> button to auto-fill the correct ID.
             </p>
           </div>
        )}

        {/* Tracking Results */}
        {order && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Order Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center space-x-4">
                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Placed</p>
                  <p className="text-base font-bold text-white mt-1">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center space-x-4">
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <Hash size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status / Tracking</p>
                  <p className="text-base font-bold text-white mt-1 uppercase">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                <Truck className="text-blue-400" size={22} />
                <span>Delivery Timeline</span>
              </h3>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-800 rounded-full"></div>
                
                <div className="space-y-12 relative">
                  {STEPS.map((step, idx) => {
                    const status = getStepStatus(step);
                    const dateText = getStepDate(step);
                    
                    return (
                      <div key={step} className="flex items-start">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          status === 'completed' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                            : 'bg-slate-950 border-2 border-slate-800 text-slate-600'
                        }`}>
                          {status === 'completed' ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Circle size={10} fill="currentColor" />
                          )}
                        </div>
                        
                        <div className="ml-6 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className={`text-base font-bold ${status === 'completed' ? 'text-white' : 'text-slate-500'}`}>
                              {step === 'Processed' ? 'Processed by Supplier' : step}
                            </h4>
                            {dateText && (
                              <span className="text-xs text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800 w-fit">
                                {dateText}
                              </span>
                            )}
                          </div>
                          
                          {status === 'completed' && (
                            <p className="text-sm text-slate-400 mt-2">
                              {step === 'Placed' && "Your order has been recorded in our system."}
                              {step === 'Paid' && "Payment verified successfully. Ready to source."}
                              {step === 'Processed' && `Order synchronized with dropship partner${order.supplierOrderId ? ` (ID: ${order.supplierOrderId})` : ''}.`}
                              {step === 'Shipped' && (
                                <span className="block space-y-2">
                                  <span>Package forwarded to local delivery hubs.</span>
                                  {order.trackingNumber && (
                                    <span className="block mt-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 w-fit">
                                      <span className="text-xs text-slate-400 block uppercase tracking-wider font-bold">Tracking Number</span>
                                      <span className="text-sm font-mono font-bold text-blue-400 block mt-0.5">{order.trackingNumber}</span>
                                      <a 
                                        href={`https://www.17track.net/en/track?nums=${order.trackingNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2 font-bold transition"
                                      >
                                        <span>Track on 17Track</span>
                                        <ExternalLink size={12} />
                                      </a>
                                    </span>
                                  )}
                                </span>
                              )}
                              {step === 'Delivered' && "Package successfully delivered to destination address."}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Package className="text-indigo-400" size={22} />
                <span>Items In This Order</span>
              </h3>
              <div className="divide-y divide-slate-800">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image || '/product-1.png'}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl border border-slate-800"
                      />
                      <div>
                        <p className="font-bold text-white leading-snug">{item.name}</p>
                        {(item.color || item.size) && (
                          <p className="text-xs text-slate-400 mt-1">
                            {item.color && `Color: ${item.color}`}
                            {item.color && item.size && ' | '}
                            {item.size && `Size: ${item.size}`}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 mt-6 pt-6 flex justify-between items-center text-base">
                <span className="font-semibold text-slate-400">Total Price paid</span>
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen bg-[#070b19] flex flex-col text-slate-100">
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow py-16 px-4 flex justify-center items-center bg-[#070b19]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }>
        <TrackOrderContent />
      </Suspense>
      <Footer />
    </main>
  );
}
