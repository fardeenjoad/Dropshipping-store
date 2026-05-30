"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Receipt, Home, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c8ff00]"></div>
          <p className="text-sm font-medium text-gray-400">Checking authorizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0e0e0e] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#161616] border-r border-white/5 flex flex-col justify-between">
        <div className="p-6">
          <Link href="/" className="text-2xl font-black flex items-center gap-2 mb-8 group">
            <span className="bg-[#c8ff00] text-black w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(200,255,0,0.4)] group-hover:shadow-[0_0_25px_rgba(200,255,0,0.6)] transition-all">
              D
            </span>
            Admin
          </Link>
          
          <nav className="space-y-2">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition text-gray-400 hover:text-white hover:border-[#c8ff00]/50 border border-transparent"
            >
              <LayoutDashboard size={18} />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link 
              href="/admin/products" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition text-gray-400 hover:text-white hover:border-[#c8ff00]/50 border border-transparent"
            >
              <ShoppingBag size={18} />
              <span className="font-medium">Products</span>
            </Link>
            <Link 
              href="/admin/orders" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition text-gray-400 hover:text-white hover:border-[#c8ff00]/50 border border-transparent"
            >
              <Receipt size={18} />
              <span className="font-medium">Orders</span>
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-white/5 space-y-2">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition text-gray-400 hover:text-white text-sm font-medium"
          >
            <Home size={16} />
            <span>Go to Shop</span>
          </Link>
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition text-sm text-left font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#c8ff00]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <header className="h-16 border-b border-white/5 bg-[#161616]/80 backdrop-blur px-8 flex items-center justify-between relative z-10">
          <h1 className="font-bold text-lg text-white">Management Panel</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-[#c8ff00] uppercase tracking-wider font-bold">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 border border-[#c8ff00]/50 flex items-center justify-center font-black text-[#c8ff00]">
              {user.name[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
