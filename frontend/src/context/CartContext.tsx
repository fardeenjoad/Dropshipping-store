"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/products';

export interface CartItem extends Product {
  quantity: number;
  selectedVariantSku?: string;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedVariant?: { sku: string; color?: string; size?: string; price?: number; image?: string }
  ) => void;
  removeFromCart: (productId: string | number, variantSku?: string) => void;
  updateQuantity: (productId: string | number, quantity: number, variantSku?: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trendmart_cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('trendmart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedVariant?: { sku: string; color?: string; size?: string; price?: number; image?: string }
  ) => {
    setCartItems(prev => {
      const variantSku = selectedVariant?.sku;
      const color = selectedVariant?.color;
      const size = selectedVariant?.size;
      const price = selectedVariant?.price ?? product.discountPrice;
      const image = selectedVariant?.image ?? product.image;

      const existing = prev.find(item => item.id === product.id && item.selectedVariantSku === variantSku);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.selectedVariantSku === variantSku
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { 
        ...product, 
        discountPrice: price, 
        image: image, 
        quantity, 
        selectedVariantSku: variantSku,
        selectedColor: color,
        selectedSize: size
      }];
    });
    setCartOpen(true); // Automatically slide open cart drawer when product is added
  };

  const removeFromCart = (productId: string | number, variantSku?: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.selectedVariantSku === variantSku)));
  };

  const updateQuantity = (productId: string | number, quantity: number, variantSku?: string) => {
    if (quantity < 1) {
      removeFromCart(productId, variantSku);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.id === productId && item.selectedVariantSku === variantSku ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.discountPrice * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, subtotal, isCartOpen, setCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
