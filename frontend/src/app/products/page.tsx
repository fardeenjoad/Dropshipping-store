"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import Toast from '@/components/Toast';
import { fetchProducts } from '@/services/api';
import { ALL_PRODUCTS, Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  ratings: number;
  numReviews: number;
  video?: string;
}

const cleanStringValue = (val: string | undefined): string => {
  if (!val) return '';
  let str = val.trim();
  
  const stripQuotes = (s: string): string => {
    s = s.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1).trim();
    }
    return s;
  };

  let prev;
  do {
    prev = str;
    str = stripQuotes(str);
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed) && parsed.length > 0) {
          str = String(parsed[0]).trim();
        }
      } catch {
        try {
          const formatted = str
            .replace(/'/g, '"')
            .replace(/\\"/g, '"');
          const parsed = JSON.parse(formatted);
          if (Array.isArray(parsed) && parsed.length > 0) {
            str = String(parsed[0]).trim();
          }
        } catch {
          // ignore
        }
      }
    }
  } while (str !== prev);

  return str;
};

const sanitizeUrl = (url: string | undefined): string => {
  if (!url) return '';
  const cleanUrl = cleanStringValue(url);
  if (cleanUrl.startsWith('//')) {
    return `https:${cleanUrl}`;
  }
  return cleanUrl;
};

const toCardProduct = (p: ApiProduct): Product => ({
  id: p._id,
  name: cleanStringValue(p.name),
  image: sanitizeUrl(p.images?.[0] || '/product-1.png'),
  originalPrice: Math.round(p.price * 1.5),
  discountPrice: p.price,
  description: p.description,
  specs: { Category: p.category, Stock: String(p.stock) },
  video: p.video ? sanitizeUrl(p.video) : undefined,
});

function ProductsContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        if (data.products && data.products.length > 0) {
          setProducts(data.products.map(toCardProduct));
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setToastMessage(`Added ${product.name} to cart`);
    setShowToast(true);
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryParam ? p.specs?.Category?.toLowerCase().includes(categoryParam.toLowerCase()) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen flex flex-col bg-[#0e0e0e]">
      <Navbar />

      {/* Header Banner */}
      <div className="pt-24 pb-12 bg-[#161616] border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-[#c8ff00]/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <AnimateOnScroll animation="fade-in-up">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">
              {categoryParam ? `${categoryParam} Drops` : 'All Drops'}
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Cop the freshest gear before it sells out.</p>
          </AnimateOnScroll>
        </div>
      </div>

      <div className="py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                <SlidersHorizontal size={18} />
                Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                Sort by: Featured
                <ChevronDown size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drops..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all font-medium"
              />
            </div>
          </div>

          {usingDummy && (
            <AnimateOnScroll animation="fade-in-up">
              <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm flex items-center gap-3 font-medium">
                <SlidersHorizontal size={18} className="text-amber-400 shrink-0" />
                Showing sample drops. Add your MongoDB URI and seed the database to show real products.
              </div>
            </AnimateOnScroll>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-[#161616] rounded-[24px] border border-white/5 overflow-hidden flex flex-col">
                  <div className="flex-1 skeleton"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 skeleton rounded-md"></div>
                    <div className="h-6 w-1/3 skeleton rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <AnimateOnScroll animation="fade-in-up">
              <div className="text-center py-32 bg-[#161616] rounded-[32px] border border-white/5">
                <div className="w-20 h-20 bg-[#0e0e0e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/5">
                  <Search size={32} className="text-gray-500" />
                </div>
                <p className="text-2xl font-black text-white mb-2">No drops found</p>
                <p className="text-gray-400">Try a different search term or category.</p>
              </div>
            </AnimateOnScroll>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {filtered.map((product, idx) => (
                <AnimateOnScroll key={product.id} animation="fade-in-up" delay={(idx % 4) * 100}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#c8ff00] border-t-transparent" />
      </div>
    }>
      <ProductsContent />
    </React.Suspense>
  );
}
