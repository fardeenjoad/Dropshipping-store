"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, Minus, Plus, ChevronRight, Star, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  product: Product;
}

// Helper to extract clean text/HTML overview
const getOverviewHtml = (html: string | undefined): string => {
  if (!html) return '';
  
  // 1. Try to find the Overview section
  const overviewMatch = html.match(/<b>Overview:<\/b>([\s\S]*?)(?:<b>Product information:<\/b>|<p><b>Product information:<\/b>|<b>Product info:<\/b>|<p><b>Product info:<\/b>|<b>Size:<\/b>|<b>Note:<\/b>)/i);
  if (overviewMatch && overviewMatch[1]) {
    let content = overviewMatch[1].trim();
    content = content.replace(/^(?:<br\s*\/?>)+|(?:<br\s*\/?>)+$/gi, '').trim();
    if (content.endsWith('</p>')) {
      content = content.slice(0, -4);
    }
    if (content.startsWith('<p>')) {
      content = content.slice(3);
    }
    return content.trim();
  }

  // 2. If no Overview heading, extract the first paragraph
  const firstParagraph = html.match(/<p>([\s\S]*?)<\/p>/i);
  if (firstParagraph && firstParagraph[1]) {
    if (!firstParagraph[1].includes('<img')) {
      return firstParagraph[1];
    }
  }

  // 3. Fallback: Strip HTML tags and take first 250 characters
  const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanText.length > 250) {
    return cleanText.slice(0, 250) + '...';
  }
  return cleanText;
};

// Helper to parse key-value specifications from "Product information:" HTML block
const parseSpecsFromHtml = (html: string | undefined): Record<string, string> => {
  const specs: Record<string, string> = {};
  if (!html) return specs;

  // Find content inside the "Product information" section
  const match = html.match(/(?:Product information:|Product info:|Product information:<\/b>)<br\/>([\s\S]*?)(?:<\/p>|<b>|<\/div>|Note:)/i);
  if (match && match[1]) {
    const lines = match[1].split(/<br\/>|<br>|\n/i);
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        const val = parts.slice(1).join(':').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        if (key && val && key.length < 50 && val.length < 150) {
          specs[key] = val;
        }
      }
    });
  }
  return specs;
};

// Helper to sanitize protocol-relative image URLs and empty tags
const sanitizeDescriptionHtml = (html: string | undefined): string => {
  if (!html) return '';
  let cleaned = html.replace(/src=["']\/\/([^"']+)["']/g, 'src="https://$1"');
  cleaned = cleaned.replace(/<b>\s*<\/b>/g, '');
  return cleaned;
};

const getVideoUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.includes('mixkit.co') || url.startsWith('/') || url.startsWith('blob:')) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return `${apiBase}/products/video-proxy?url=${encodeURIComponent(url)}`;
};

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  // Sanitize and parse description details
  const sanitizedDescription = sanitizeDescriptionHtml(product.description);
  const overviewHtml = getOverviewHtml(sanitizedDescription);
  const htmlSpecs = parseSpecsFromHtml(sanitizedDescription);
  const mergedSpecs = {
    ...product.specs,
    ...htmlSpecs
  };

  // Variant selection states
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  // Set default variant values and image on product load
  useEffect(() => {
    if (product) {
      setActiveMedia({ type: 'image', url: product.image });
      if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];
        setSelectedColor(firstVariant.color);
        setSelectedSize(firstVariant.size);
      } else {
        setSelectedColor(undefined);
        setSelectedSize(undefined);
      }
    }
  }, [product]);

  // Colors and sizes available
  const colors = Array.from(new Set(product?.variants?.map(v => v.color).filter(Boolean) || [])) as string[];
  const sizes = Array.from(new Set(product?.variants?.map(v => v.size).filter(Boolean) || [])) as string[];

  // Find matching variant
  const currentVariant = product?.variants?.find(v => 
    (!selectedColor || v.color === selectedColor) && 
    (!selectedSize || v.size === selectedSize)
  ) || product?.variants?.[0];

  // Update active image if variant changes and has a custom image
  useEffect(() => {
    if (currentVariant?.image) {
      setActiveMedia({ type: 'image', url: currentVariant.image });
    }
  }, [currentVariant]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (product?.variants) {
      const compatibleVariant = product.variants.find(v => v.color === color && (!selectedSize || v.size === selectedSize));
      if (!compatibleVariant) {
        const firstWithColor = product.variants.find(v => v.color === color);
        if (firstWithColor) {
          setSelectedSize(firstWithColor.size);
        }
      }
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    if (product?.variants) {
      const compatibleVariant = product.variants.find(v => v.size === size && (!selectedColor || v.color === selectedColor));
      if (!compatibleVariant) {
        const firstWithSize = product.variants.find(v => v.size === size);
        if (firstWithSize) {
          setSelectedColor(firstWithSize.color);
        }
      }
    }
  };

  const handleAddToCart = () => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        if (!currentVariant) return;
        addToCart(product, quantity, {
          sku: currentVariant.sku,
          color: currentVariant.color,
          size: currentVariant.size,
          price: currentVariant.price,
          image: currentVariant.image || product.image
        });
      } else {
        addToCart(product, quantity);
      }
      setShowToast(true);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        if (!currentVariant) return;
        addToCart(product, quantity, {
          sku: currentVariant.sku,
          color: currentVariant.color,
          size: currentVariant.size,
          price: currentVariant.price,
          image: currentVariant.image || product.image
        });
      } else {
        addToCart(product, quantity);
      }
      router.push('/checkout');
    }
  };

  const displayDiscountPrice = currentVariant ? currentVariant.price : product.discountPrice;
  const displayOriginalPrice = currentVariant 
    ? Math.round(currentVariant.price * 1.5) 
    : product.originalPrice;
  const discountPercent = Math.round(((displayOriginalPrice - displayDiscountPrice) / displayOriginalPrice) * 100);

  // Product-level stock set by admin (stored in specs as string)
  const productLevelStock = product.specs.Stock ? parseInt(product.specs.Stock) || 0 : 0;

  // Use variant stock if it's explicitly set > 0, otherwise fall back to product-level stock
  const displayStock = (() => {
    if (currentVariant && currentVariant.stock !== undefined && currentVariant.stock > 0) {
      return currentVariant.stock;
    }
    // If all variants have 0 stock (e.g. CJ import), use product-level stock
    if (productLevelStock > 0) return productLevelStock;
    // Final fallback: try any variant's stock
    if (currentVariant && currentVariant.stock !== undefined) return currentVariant.stock;
    return 0;
  })();

  const galleryImages = [
    product.image,
    ...(product.variants?.map(v => v.image).filter(Boolean) as string[] || [])
  ];
  const uniqueGallery = Array.from(new Set(galleryImages)).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white pt-20">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
          <Link href="/" className="hover:text-[#c8ff00] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-700" />
          <Link href="/products" className="hover:text-[#c8ff00] transition-colors">Products</Link>
          <ChevronRight size={14} className="text-gray-700" />
          <span className="text-[#c8ff00] truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative">
          
          {/* Left Side: Image / Video Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="relative aspect-square rounded-[32px] overflow-hidden bg-[#161616] border border-white/5 shadow-2xl flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {activeMedia?.type === 'video' ? (
                <video
                  src={getVideoUrl(activeMedia.url)}
                  controls
                  autoPlay
                  muted
                  playsInline
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={activeMedia?.url || product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              {product.badge && (
                <span className="absolute top-6 left-6 z-20 bg-red-500 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  {product.badge}
                </span>
              )}
            </div>
            
            {/* Gallery Thumbnails */}
            {(uniqueGallery.length > 1 || product.video) && (
              <div className="flex flex-wrap gap-4">
                {product.video && (
                  <div 
                    onClick={() => setActiveMedia({ type: 'video', url: product.video! })}
                    className={`relative w-24 h-24 aspect-square rounded-2xl border-2 transition-all cursor-pointer overflow-hidden bg-black flex items-center justify-center ${
                      activeMedia?.type === 'video' ? 'border-[#c8ff00] shadow-[0_0_15px_rgba(200,255,0,0.3)]' : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <Image src={product.image} alt="video-thumbnail" fill className="object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-[#c8ff00] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(200,255,0,0.5)]">
                        <Play size={18} className="text-black fill-black ml-1" />
                      </div>
                    </div>
                  </div>
                )}

                {uniqueGallery.map((img, idx) => (
                  <div 
                    key={img + idx} 
                    onClick={() => setActiveMedia({ type: 'image', url: img })}
                    className={`relative w-24 h-24 aspect-square rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                      activeMedia?.type === 'image' && activeMedia.url === img
                        ? 'border-[#c8ff00] shadow-[0_0_15px_rgba(200,255,0,0.3)]'
                        : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                     <Image src={img} alt={`thumbnail-${idx}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Info */}
          <div className="flex flex-col relative z-10">
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4 text-[#c8ff00]">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill={s <= 4 ? "currentColor" : "none"} />)}
                </div>
                <span className="text-sm font-bold text-gray-400">(4.8 / 5.0)</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">{product.name}</h1>
              
              <div className="flex items-end space-x-4 mb-8 bg-[#161616] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8ff00]/10 rounded-full blur-[50px]"></div>
                <div className="flex flex-col relative z-10">
                  <span className="text-4xl font-black text-[#c8ff00]">₹{displayDiscountPrice.toLocaleString()}</span>
                  <span className="text-lg text-gray-500 line-through font-medium mt-1">M.R.P: ₹{displayOriginalPrice.toLocaleString()}</span>
                </div>
                <div className="bg-[#c8ff00]/10 text-[#c8ff00] border border-[#c8ff00]/20 font-black px-4 py-2 rounded-xl text-sm mb-1 ml-auto relative z-10">
                  SAVE {discountPercent}%
                </div>
              </div>

              {overviewHtml && (
                <div 
                  className="text-gray-300 leading-relaxed mb-8 text-lg font-medium border-l-4 border-[#c8ff00] pl-6 py-2"
                  dangerouslySetInnerHTML={{ __html: overviewHtml }}
                />
              )}

              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="mb-8">
                  <span className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">
                    Select Color: <span className="text-white ml-2">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                          selectedColor === color
                            ? 'bg-[#c8ff00] text-black shadow-[0_0_20px_rgba(200,255,0,0.2)]'
                            : 'bg-[#161616] text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="mb-8">
                  <span className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">
                    Select Size: <span className="text-white ml-2">{selectedSize}</span>
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all min-w-[3.5rem] ${
                          selectedSize === size
                            ? 'bg-[#c8ff00] text-black shadow-[0_0_20px_rgba(200,255,0,0.2)]'
                            : 'bg-[#161616] text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-10">
                <span className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center bg-[#161616] border border-white/10 rounded-2xl p-1">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      disabled={displayStock === 0}
                    >
                      <Minus size={20} />
                    </button>
                    <span className="w-14 text-center font-black text-xl text-white">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}
                      className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      disabled={displayStock === 0 || quantity >= displayStock}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <span className={`text-sm font-bold tracking-wide ${displayStock === 0 ? 'text-red-500' : 'text-[#00cfff]'}`}>
                    {displayStock === 0 ? 'Out of stock' : `Only ${displayStock} items left in stock`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                <button 
                  onClick={handleAddToCart}
                  disabled={displayStock === 0}
                  className="w-full bg-[#161616] border border-[#c8ff00]/30 hover:bg-[#c8ff00]/10 hover:border-[#c8ff00] text-[#c8ff00] font-black py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide uppercase"
                >
                  <ShoppingCart size={22} />
                  <span>{displayStock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={displayStock === 0}
                  className="w-full btn-accent font-black py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide shadow-[0_0_30px_rgba(200,255,0,0.15)] uppercase"
                >
                  <Zap size={22} fill="currentColor" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Trust Markers */}
            <div className="p-5 bg-[#161616] rounded-3xl border border-white/5 flex flex-wrap items-center justify-between text-xs font-black text-gray-400 uppercase tracking-widest gap-4">
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><ChevronRight size={14} className="text-[#c8ff00]" /> Free Delivery</span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><ChevronRight size={14} className="text-[#c8ff00]" /> Cash On Delivery</span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><ChevronRight size={14} className="text-[#c8ff00]" /> Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* Detailed Description & Specifications Section */}
        <section className="mt-24 pt-16 border-t border-white/5 mb-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#c8ff00]/20 to-transparent"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            {/* Left 2 Columns: Full Product Description & Size Guides */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#161616] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c8ff00] to-[#00cfff]"></div>
                <h3 className="text-2xl font-black text-white mb-8 pb-6 border-b border-white/5 tracking-tight">
                  Product Details
                </h3>
                <div 
                  className="text-gray-400 leading-relaxed prose prose-invert prose-p:text-gray-400 prose-headings:text-white prose-strong:text-white prose-a:text-[#00cfff] max-w-none description-html"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              </div>
            </div>

            {/* Right Column: Full Specifications */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#161616] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00cfff] to-[#c8ff00]"></div>
                <h3 className="text-xl font-black text-white mb-8 pb-6 border-b border-white/5 tracking-tight">
                  Specifications
                </h3>
                <div className="space-y-5">
                  {Object.entries(mergedSpecs).map(([key, value]) => {
                    if (!value || key.toLowerCase() === 'id' || key.toLowerCase() === 'image') return null;
                    return (
                      <div key={key} className="flex flex-col pb-4 border-b border-white/5 last:border-0 last:pb-0">
                        <span className="text-[#00cfff] text-[11px] font-black uppercase tracking-widest mb-1.5">{key}</span>
                        <span className="text-white font-medium text-sm leading-relaxed">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      <Toast 
        message="Added to cart ✅" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </main>
  );
}
