"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import TrustBadges from '@/components/TrustBadges';
import Footer from '@/components/Footer';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import Toast from '@/components/Toast';
import { ArrowRight, Star, Quote } from 'lucide-react';

import { Product, toCardProduct } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { fetchProducts } from '@/services/api';

export default function Home() {
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        if (data.products && data.products.length > 0) {
          setLatestProducts(data.products.map(toCardProduct));
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setToastMessage(`Added ${product.name} to cart`);
    setShowToast(true);
  };

  const categories = [
    { name: 'Streetwear', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
    { name: 'Sneakers', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop' },
    { name: 'Tech', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' },
  ];

  const testimonials = [
    { name: 'Rahul V.', text: 'The quality of the oversized tees is insane for the price. Delivery was super fast to Mumbai.', rating: 5 },
    { name: 'Priya S.', text: 'Finally a streetwear brand in India that gets the aesthetic right. Im obsessed with my new cargo pants.', rating: 5 },
    { name: 'Aman K.', text: 'Customer service is top notch. The neon signs I ordered completely changed my room setup.', rating: 4 },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-[#0e0e0e] overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* Categories Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-white/5">
        <AnimateOnScroll animation="fade-in-up">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Shop by <span className="text-[#00cfff]">Vibe</span></h2>
              <p className="text-gray-400">Curated collections for your aesthetic.</p>
            </div>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, idx) => (
            <AnimateOnScroll key={idx} animation="fade-in-up" delay={idx * 100}>
              <Link href={`/products?category=${cat.name.toLowerCase()}`} className="group relative block aspect-[4/5] rounded-[24px] overflow-hidden border border-white/10">
                <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white font-bold text-xl mb-1 flex items-center justify-between">
                    {cat.name}
                    <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight size={14} />
                    </span>
                  </h3>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <AnimateOnScroll animation="fade-in-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                Latest <span className="text-[#c8ff00]">Drops</span>
              </h2>
              <p className="text-gray-400">Fresh gear added weekly. Don't miss out.</p>
            </div>
            <Link href="/products" className="btn-outline border-white/10 text-white hover:border-[#c8ff00] hover:text-[#c8ff00] hover:bg-[#c8ff00]/5 flex items-center gap-2 group">
              View All
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {latestProducts.slice(0, 8).map((product, idx) => (
            <AnimateOnScroll key={product.id} animation="fade-in-up" delay={idx * 100}>
              <ProductCard 
                product={product} 
                onAddToCart={handleAddToCart} 
              />
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <AnimateOnScroll animation="fade-in-up">
          <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#c8ff00] to-[#00cfff] p-[2px]">
            <div className="bg-[#0e0e0e] rounded-[30px] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c8ff00]/10 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="text-center md:text-left relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ff4d4d]/30 bg-[#ff4d4d]/10 text-[#ff4d4d] text-xs font-bold uppercase tracking-widest mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#ff4d4d] animate-pulse"></span>
                  Flash Sale Ending Soon
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">Up to <span className="accent-text">50% OFF</span> on Streetwear</h2>
                <p className="text-gray-400 text-lg mb-8">Grab your favorite fits before they're gone. Limited stock available.</p>
                
                {/* Countdown Timer (Visual only for now) */}
                <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                  {[
                    { label: 'Hours', value: '12' },
                    { label: 'Mins', value: '45' },
                    { label: 'Secs', value: '30' }
                  ].map((time, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-white/10 flex items-center justify-center text-2xl font-black text-white mb-2 shadow-inner">
                        {time.value}
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{time.label}</span>
                    </div>
                  ))}
                </div>

                <Link href="/products?category=sale" className="btn-accent py-4 px-8 text-lg w-full sm:w-auto shadow-[0_0_30px_rgba(200,255,0,0.3)] hover:shadow-[0_0_50px_rgba(200,255,0,0.5)] transition-all">
                  Claim Discount
                </Link>
              </div>
              
              <div className="relative w-full md:w-1/2 aspect-square max-w-[400px]">
                <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full animate-[spin-slow_20s_linear_infinite]"></div>
                <div className="absolute inset-4 bg-[#161616] rounded-full overflow-hidden shadow-2xl border border-white/10">
                  <Image src="https://images.unsplash.com/photo-1523398002811-999aa8d9512e?q=80&w=800&auto=format&fit=crop" alt="Sale" fill className="object-cover opacity-80" />
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff4d4d] rounded-full flex items-center justify-center text-white font-black text-2xl rotate-12 shadow-2xl animate-bounce-light z-10 border-4 border-[#0e0e0e]">
                  -50%
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/5">
        <AnimateOnScroll animation="fade-in-up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">No Cap, Just <span className="text-[#00cfff]">Facts</span></h2>
            <p className="text-gray-400">See what the community is saying about us.</p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <AnimateOnScroll key={idx} animation="fade-in-up" delay={idx * 150}>
              <div className="bg-[#161616] p-8 rounded-[32px] border border-white/5 hover:border-white/20 transition-all duration-300 relative group h-full flex flex-col">
                <Quote className="absolute top-6 right-6 text-white/5 w-16 h-16 group-hover:text-[#c8ff00]/10 transition-colors" />
                <div className="flex text-[#c8ff00] mb-6 gap-1">
                  {[...Array(test.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-300 text-lg font-medium leading-relaxed mb-8 flex-grow">"{test.text}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center font-bold text-white">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{test.name}</h4>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Verified Buyer
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      <TrustBadges />
      <Footer />
      
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </main>
  );
}
