"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Zap, Heart } from 'lucide-react';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const getVideoUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.includes('mixkit.co') || url.startsWith('/') || url.startsWith('blob:')) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return `${apiBase}/products/video-proxy?url=${encodeURIComponent(url)}`;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const discountPercent = Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isHovered) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {/* autoplay blocked, ignore */});
    } else {
      videoRef.current.pause();
    }
  }, [isHovered]);

  return (
    <div className="glow-border h-full">
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="card overflow-hidden flex flex-col h-full relative group cursor-pointer"
      >
        {/* Product Image / Video Preview */}
        <Link href={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a] block">
          
          {/* Wishlist Button */}
          <button 
            onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
            className={`absolute top-4 right-4 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isLiked ? 'bg-[#ff4d4d] text-white shadow-[0_0_15px_rgba(255,77,77,0.5)]' : 'bg-black/50 text-white hover:bg-black/80 backdrop-blur-md border border-white/10'}`}
          >
            <Heart size={16} className={isLiked ? 'fill-current' : ''} />
          </button>

          {/* Video element */}
          {product.video && (
            <video
              ref={videoRef}
              src={getVideoUrl(product.video)}
              muted
              loop
              playsInline
              preload="none"
              className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          {/* Static thumbnail */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ease-out ${isHovered ? 'scale-110 opacity-60' : 'scale-100 opacity-100'}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {product.badge && (
            <span className="absolute top-4 left-4 z-20 badge badge-danger shadow-[0_0_10px_rgba(255,77,77,0.4)]">
              {product.badge}
            </span>
          )}
          
          <span className="absolute bottom-4 left-4 z-20 badge bg-[#c8ff00] text-black shadow-[0_0_10px_rgba(200,255,0,0.3)] flex items-center gap-1">
            <Zap size={10} fill="currentColor" />
            {discountPercent}% OFF
          </span>

          {/* Slide-up Add to Cart overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 z-30 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex justify-center">
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
              className="w-full btn-accent py-3 font-bold shadow-2xl backdrop-blur-md bg-[#c8ff00]/90"
            >
              <ShoppingBag size={18} />
              Quick Add
            </button>
          </div>
        </Link>

        {/* Details */}
        <div className="p-5 flex flex-col flex-grow bg-[#161616]">
          <Link href={`/product/${product.id}`}>
            <h3 className="text-gray-200 font-bold text-lg mb-1.5 line-clamp-1 group-hover:text-[#c8ff00] transition-colors font-sans">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center space-x-2 mt-auto pt-2">
            <span className="text-xl font-black text-white">₹{product.discountPrice.toLocaleString()}</span>
            <span className="text-sm text-gray-500 line-through font-medium">₹{product.originalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
