"use client";

import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setCartOpen, updateQuantity, removeFromCart, subtotal, cartCount } = useCart();
  const router = useRouter();

  // Prevent background scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutRedirect = () => {
    setCartOpen(false);
    router.push('/checkout');
  };

  const freeShippingThreshold = 499;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={() => setCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-[#0e0e0e] shadow-2xl border-l border-white/10 flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[#c8ff00]" size={22} />
              <h2 className="text-lg font-black text-white">Your Cart ({cartCount})</h2>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Shipping Progress */}
          {cartItems.length > 0 && (
            <div className="px-6 py-4 border-b border-white/5 bg-[#161616]">
              <p className="text-sm font-bold text-gray-300 mb-2">
                {progressPercent >= 100 
                  ? <span className="text-[#c8ff00]">🎉 You've unlocked FREE shipping!</span>
                  : `Add ₹${(freeShippingThreshold - subtotal).toLocaleString('en-IN')} more for FREE shipping.`
                }
              </p>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#c8ff00] to-[#00cfff] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-[#161616] border border-white/5 text-gray-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(200,255,0,0.05)]">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 max-w-[200px] mb-8">Add some fresh drops to your cart to see them here.</p>
                <button
                  onClick={() => { setCartOpen(false); router.push('/products'); }}
                  className="btn-accent w-full"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={`${item.id}-${item.selectedVariantSku || idx}`} className="p-3 bg-[#161616] rounded-2xl border border-white/5 flex gap-4 animate-fade-in-up group" style={{ animationDelay: `${idx * 50}ms` }}>
                  <img
                    src={item.image || '/product-1.png'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl border border-white/5 shrink-0 bg-[#0e0e0e]"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="text-sm font-bold text-white truncate pr-6">{item.name}</h4>
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="text-xs text-gray-400 mt-1 font-medium">
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                          {item.selectedColor && item.selectedSize && ' | '}
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                        </p>
                      )}
                      <p className="text-sm font-black text-[#c8ff00] mt-1.5">₹{item.discountPrice.toLocaleString('en-IN')}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-white/10 rounded-lg bg-[#0e0e0e]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariantSku)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-l-lg transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariantSku)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedVariantSku)}
                        className="text-gray-500 hover:text-[#ff4d4d] p-1.5 rounded-lg hover:bg-[#ff4d4d]/10 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-white/5 px-6 py-6 bg-[#161616] space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-400">Subtotal</span>
                <span className="text-xl font-black text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Taxes and shipping calculated at checkout.</p>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={handleCheckoutRedirect}
                  className="w-full btn-accent py-4 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(200,255,0,0.2)]"
                >
                  <span>Checkout Now</span>
                  <ArrowRight size={18} />
                </button>
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="w-full py-3 px-4 rounded-xl text-center text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
