"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, CreditCard, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import AnimateOnScroll from '@/components/AnimateOnScroll';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const freeShippingThreshold = 499;
  const shipping = 0; // Temporarily set to 0 for testing (or permanently for free shipping)
  const total = subtotal + shipping;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone Number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Should be a 10-digit number';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Should be a 6-digit number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await loadRazorpay();

      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const orderRes = await fetch(`${API_BASE_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      const orderData = await orderRes.json();

      if (!orderData.orderId) {
        alert("Failed to create order. Please check console.");
        console.error(orderData);
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "DropZone",
        description: "Order Payment",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const verifyRes = await fetch(`${API_BASE_URL}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                userId: user?._id,
                email: formData.email,
                items: cartItems.map(i => ({
                  product: typeof i.id === 'number' ? i.id.toString(16).padStart(24, '0') : i.id,
                  name: i.name,
                  image: i.image,
                  price: i.discountPrice,
                  quantity: i.quantity,
                  variantSku: i.selectedVariantSku,
                  color: i.selectedColor,
                  size: i.selectedSize,
                })),
                shippingAddress: {
                  street: `${formData.address1}${formData.address2 ? ', ' + formData.address2 : ''}`,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                  country: 'India',
                },
                total: total
              }
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            clearCart();
            router.push(`/order-confirm?id=${verifyData.orderId}`);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          },
          escape: false,
          backdropclose: false
        },
        retry: {
          enabled: true,
          enabled_for_fallback: true
        },
        theme: {
          color: "#c8ff00",
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartCount === 0) {
    return (
      <main className="min-h-screen flex flex-col bg-[#0e0e0e] text-white">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-black mb-4">Your cart is empty</h1>
          <Link href="/products" className="btn-accent mt-4">Return to Shop</Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0e0e0e] text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-grow w-full">
        <Link href="/cart" className="flex items-center text-sm font-bold text-gray-400 hover:text-white mb-8 transition-colors w-max group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <AnimateOnScroll animation="fade-in-up">
              <form onSubmit={handleSubmit} className="bg-[#161616] p-6 sm:p-8 rounded-[32px] shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#c8ff00]/50 to-transparent"></div>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center text-[#c8ff00]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white leading-tight">Shipping Info</h2>
                    <p className="text-gray-400 text-sm">Where should we send your drops?</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border ${errors.fullName ? 'border-[#ff4d4d]' : 'border-white/10'} text-white focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-[#ff4d4d] text-xs mt-1.5 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d]"></span>{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border ${errors.email ? 'border-[#ff4d4d]' : 'border-white/10'} text-white focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-[#ff4d4d] text-xs mt-1.5 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d]"></span>{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border ${errors.phone ? 'border-[#ff4d4d]' : 'border-white/10'} text-white focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all`}
                      placeholder="9876543210"
                    />
                    {errors.phone && <p className="text-[#ff4d4d] text-xs mt-1.5 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d]"></span>{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-300 mb-2">Street Address</label>
                    <input
                      type="text"
                      name="address1"
                      value={formData.address1}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border ${errors.address1 ? 'border-[#ff4d4d]' : 'border-white/10'} text-white focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all`}
                      placeholder="House no., Building, Street"
                    />
                    {errors.address1 && <p className="text-[#ff4d4d] text-xs mt-1.5 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d]"></span>{errors.address1}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-300 mb-2">Apartment, suite, etc. (optional)</label>
                    <input
                      type="text"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border border-white/10 text-white focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all"
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border ${errors.city ? 'border-[#ff4d4d]' : 'border-white/10'} text-white focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all`}
                      placeholder="Mumbai"
                    />
                    {errors.city && <p className="text-[#ff4d4d] text-xs mt-1.5 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d]"></span>{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border ${errors.state ? 'border-[#ff4d4d]' : 'border-white/10'} text-white focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all`}
                      placeholder="Maharashtra"
                    />
                    {errors.state && <p className="text-[#ff4d4d] text-xs mt-1.5 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d]"></span>{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">PIN Code</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border ${errors.pincode ? 'border-[#ff4d4d]' : 'border-white/10'} text-white focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all`}
                      placeholder="400001"
                    />
                    {errors.pincode && <p className="text-[#ff4d4d] text-xs mt-1.5 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d]"></span>{errors.pincode}</p>}
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#00cfff]/20 flex items-center justify-center text-[#00cfff]">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white leading-tight">Payment</h2>
                      <p className="text-gray-400 text-sm">All transactions are secure and encrypted.</p>
                    </div>
                  </div>

                  <div className="bg-[#0e0e0e] border border-white/10 rounded-xl p-5 flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-[5px] border-[#c8ff00] flex-shrink-0"></div>
                    <div className="flex-grow">
                      <span className="font-bold text-white block">Razorpay Secure</span>
                      <span className="text-xs text-gray-400">UPI, Cards, Netbanking</span>
                    </div>
                    <div className="flex gap-2 opacity-60">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/2560px-UPI-Logo-vector.svg.png" className="h-4 object-contain brightness-0 invert" alt="UPI" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-accent py-5 text-lg mt-8 shadow-[0_0_30px_rgba(200,255,0,0.15)] flex justify-center items-center gap-3"
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-6 w-6 border-2 border-black border-t-transparent" />
                  ) : (
                    <>
                      <Lock size={18} />
                      Pay ₹{total.toLocaleString()}
                    </>
                  )}
                </button>
              </form>
            </AnimateOnScroll>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <AnimateOnScroll animation="fade-in-up" delay={200}>
              <div className="bg-[#161616] p-6 sm:p-8 rounded-[32px] shadow-2xl border border-white/5 sticky top-28">
                <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-sm">Review Order</h2>
                
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-6 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.selectedVariantSku || ''}`} className="flex items-center space-x-4 bg-[#0e0e0e] p-3 rounded-2xl border border-white/5">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                        <span className="absolute -top-1 -right-1 bg-[#c8ff00] text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                        {item.selectedColor || item.selectedSize ? (
                          <p className="text-xs text-gray-400 font-medium mt-1">
                            {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-sm font-black text-[#c8ff00]">₹{(item.discountPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-gray-400 font-medium text-sm">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 font-medium text-sm">
                    <span>Shipping</span>
                    <span className={`font-bold ${shipping === 0 ? 'text-[#c8ff00]' : 'text-white'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-6 border-t border-white/10 mt-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black text-white">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
