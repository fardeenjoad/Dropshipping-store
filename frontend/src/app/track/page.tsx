"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Track Your Order</h1>
          <p className="text-gray-600 mb-8">Enter your order ID or tracking number below to see the status of your package.</p>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Order ID (e.g. #TM1234)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Track Status
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
