"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Home, Copy, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSearchParams } from 'next/navigation';
import AnimateOnScroll from '@/components/AnimateOnScroll';

function OrderConfirmContent() {
  const searchParams = useSearchParams();
  const realOrderId = searchParams.get('id');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!realOrderId) return;
    navigator.clipboard.writeText(realOrderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
      <Navbar />

      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c8ff00]/5 rounded-full blur-[150px] pointer-events-none"></div>

        <AnimateOnScroll animation="scale-in">
          <div className="max-w-md w-full bg-[#161616] rounded-[40px] p-10 md:p-12 text-center border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#c8ff00]/50 to-transparent"></div>

            {/* Success Icon */}
            <div className="w-24 h-24 bg-[#c8ff00]/10 text-[#c8ff00] rounded-full flex items-center justify-center mx-auto mb-8 relative border border-[#c8ff00]/20">
              <div className="absolute inset-0 rounded-full border border-[#c8ff00] animate-[ping_3s_ease-in-out_infinite] opacity-50"></div>
              <CheckCircle2 size={48} />
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Order Confirmed!</h1>
            <p className="text-gray-400 mb-8 font-medium">Thank you for choosing DropZone.</p>

            {/* Real Order ID */}
            {realOrderId ? (
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/5 p-5 mb-8 text-left relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#c8ff00]/0 via-[#c8ff00]/5 to-[#c8ff00]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00]"></span>
                  Tracking ID
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-mono font-bold text-white flex-1 break-all select-all">
                    {realOrderId}
                  </p>
                  <button
                    onClick={handleCopy}
                    title="Copy Order ID"
                    className="flex-shrink-0 p-2.5 rounded-xl bg-[#161616] hover:bg-white/10 border border-white/5 transition-all text-gray-400 hover:text-white"
                  >
                    {copied
                      ? <Check size={16} className="text-[#c8ff00]" />
                      : <Copy size={16} />
                    }
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-3 font-medium">
                  Copy this ID to check your order status anytime.
                </p>
              </div>
            ) : (
              <div className="bg-[#0e0e0e] px-6 py-5 rounded-2xl border border-white/5 mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status</p>
                <p className="text-base font-bold text-[#c8ff00]">Order placed successfully</p>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  Find your Order ID in <Link href="/my-orders" className="text-white hover:text-[#c8ff00] underline decoration-white/30 underline-offset-4 transition-colors">My Orders</Link>.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Link
                href={realOrderId ? `/track-order?id=${realOrderId}` : '/track-order'}
                className="w-full btn-accent py-4 text-base shadow-[0_0_20px_rgba(200,255,0,0.15)] group"
              >
                <Package size={18} />
                <span>Track My Order</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/"
                className="w-full flex items-center justify-center space-x-2 bg-[#161616] border border-white/10 hover:border-white/30 hover:bg-white/5 text-white font-bold py-4 rounded-xl transition-all"
              >
                <Home size={18} className="text-gray-400" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-in-up" delay={200}>
          <p className="mt-8 text-gray-500 text-sm font-medium">
            You can also view all orders in{' '}
            <Link href="/my-orders" className="text-white hover:text-[#c8ff00] transition-colors underline decoration-white/30 underline-offset-4">My Orders</Link>.
          </p>
        </AnimateOnScroll>
      </div>

      <Footer />
    </main>
  );
}

export default function OrderConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#c8ff00] border-t-transparent" />
      </div>
    }>
      <OrderConfirmContent />
    </Suspense>
  );
}
