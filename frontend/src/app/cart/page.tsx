"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, cartCount } = useCart();
  
  const freeShippingThreshold = 499;
  const shipping = subtotal > freeShippingThreshold || cartCount === 0 ? 0 : 99;
  const total = subtotal + shipping;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (cartCount === 0) {
    return (
      <main className="min-h-screen flex flex-col bg-[#0e0e0e] text-white">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center mt-20">
          <AnimateOnScroll animation="scale-in">
            <div className="bg-[#161616] p-8 rounded-full border border-white/5 mb-6 shadow-[0_0_30px_rgba(200,255,0,0.05)]">
              <ShoppingBag size={80} className="text-[#c8ff00] opacity-80" />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-in-up" delay={100}>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Your cart is empty</h1>
            <p className="text-gray-400 mb-8 max-w-sm font-medium">Looks like you haven't added any drops to your cart yet. Explore our latest collections.</p>
            <Link 
              href="/products" 
              className="btn-accent py-4 px-10 text-lg shadow-[0_0_20px_rgba(200,255,0,0.2)]"
            >
              Start Shopping
            </Link>
          </AnimateOnScroll>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0e0e0e] text-white">
      <Navbar />
      
      <div className="flex-grow pt-24 pb-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-[#00cfff]/5 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center space-x-4 mb-10 border-b border-white/5 pb-6">
            <Link href="/products" className="p-3 bg-[#161616] rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Your Cart <span className="text-[#c8ff00]">({cartCount})</span></h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-7 space-y-4">
              {/* Free Shipping Progress */}
              <div className="bg-[#161616] p-6 rounded-[24px] border border-white/5 mb-6">
                <p className="text-sm font-bold text-gray-300 mb-3">
                  {progressPercent >= 100 
                    ? <span className="text-[#c8ff00] flex items-center gap-2">🎉 You've unlocked FREE shipping!</span>
                    : `Add ₹${(freeShippingThreshold - subtotal).toLocaleString('en-IN')} more to unlock FREE shipping.`
                  }
                </p>
                <div className="h-2 w-full bg-[#0e0e0e] rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#c8ff00] to-[#00cfff] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {cartItems.map((item, idx) => (
                <AnimateOnScroll key={`${item.id}-${item.selectedVariantSku || ''}`} animation="fade-in-up" delay={idx * 100}>
                  <div className="bg-[#161616] p-4 sm:p-6 rounded-[24px] border border-white/5 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 relative group overflow-hidden">
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                    {/* Image */}
                    <div className="relative w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 rounded-[16px] overflow-hidden bg-[#0e0e0e] border border-white/5">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 128px" />
                    </div>

                    {/* Info */}
                    <div className="flex-grow text-center sm:text-left w-full sm:w-auto">
                      <h3 className="text-lg font-bold text-white mb-1 leading-tight pr-8 sm:pr-0">{item.name}</h3>
                      {item.selectedColor || item.selectedSize ? (
                        <p className="text-xs text-gray-400 font-medium mb-3 bg-[#0e0e0e] inline-block px-2 py-1 rounded-md border border-white/5">
                          {[item.selectedColor, item.selectedSize].filter(Boolean).join(' • ')}
                        </p>
                      ) : null}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mt-2">
                        <p className="text-xl font-black text-[#c8ff00] mb-4 sm:mb-0">₹{item.discountPrice.toLocaleString()}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-center sm:justify-start space-x-4 bg-[#0e0e0e] rounded-xl px-2 py-1 border border-white/5 w-max mx-auto sm:mx-0">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariantSku)} className="p-2 text-gray-500 hover:text-white transition-colors"><Minus size={16} /></button>
                          <span className="w-8 text-center font-bold text-white text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariantSku)} className="p-2 text-gray-500 hover:text-white transition-colors"><Plus size={16} /></button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedVariantSku)}
                      className="absolute top-4 right-4 sm:static p-2.5 sm:p-3 text-gray-500 hover:text-[#ff4d4d] hover:bg-[#ff4d4d]/10 rounded-xl transition-all"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <AnimateOnScroll animation="fade-in-up" delay={200}>
                <div className="bg-[#161616] p-8 rounded-[32px] border border-white/5 sticky top-28 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#c8ff00]/30 to-transparent"></div>
                  
                  <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-sm">Order Summary</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-400 font-medium text-sm">
                      <span>Subtotal ({cartCount} items)</span>
                      <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-medium text-sm">
                      <span>Estimated Shipping</span>
                      <span className={`font-bold ${shipping === 0 ? 'text-[#c8ff00]' : 'text-white'}`}>
                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                      </span>
                    </div>
                    
                    <div className="pt-6 mt-4 border-t border-white/10 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-1">Total</p>
                        <span className="text-3xl font-black text-white">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href="/checkout" 
                    className="w-full btn-accent py-4 flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(200,255,0,0.15)] hover:shadow-[0_0_30px_rgba(200,255,0,0.3)]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={20} />
                  </Link>

                  <div className="mt-6 flex items-center justify-center gap-3">
                     <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><Lock size={12} /> SECURE CHECKOUT</span>
                     <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                     <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><Truck size={12} /> FAST DELIVERY</span>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// Quick icons for the summary
const Lock = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const Truck = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
);
