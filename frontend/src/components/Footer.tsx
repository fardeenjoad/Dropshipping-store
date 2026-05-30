import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0e0e0e] border-t border-white/5 pt-20 pb-8 mt-auto relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-px bg-gradient-to-r from-transparent via-[#c8ff00] to-transparent opacity-50"></div>
      <div className="absolute top-0 right-1/4 w-96 h-px bg-gradient-to-r from-transparent via-[#00cfff] to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-3xl font-black tracking-tight text-white flex items-center gap-2 mb-6 group inline-flex">
              <span className="bg-gradient-to-r from-[#c8ff00] to-[#00cfff] w-10 h-10 rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(200,255,0,0.4)] group-hover:shadow-[0_0_25px_rgba(200,255,0,0.6)] transition-all duration-300">
                D
              </span>
              DropZone<span className="text-[#c8ff00]">.</span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-8 pr-4">
              India's premium destination for trending streetwear and lifestyle drops. Curated for the culture.
            </p>

            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c8ff00] animate-pulse"></span>
              Join the Drop List
            </h4>
            <form className="flex relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-5 py-3.5 bg-[#161616] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all placeholder:text-gray-600"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#c8ff00] text-black px-4 rounded-lg font-bold hover:bg-[#d4ff26] transition-colors flex items-center justify-center">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wide">Shop</h4>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-gray-400 hover:text-[#c8ff00] hover:translate-x-1 transition-all inline-block">All Drops</Link></li>
              <li><Link href="/products?category=new" className="text-gray-400 hover:text-[#c8ff00] hover:translate-x-1 transition-all inline-block">New Arrivals</Link></li>
              <li><Link href="/products?category=trending" className="text-gray-400 hover:text-[#c8ff00] hover:translate-x-1 transition-all inline-block">Trending</Link></li>
              <li><Link href="/products?category=sale" className="text-gray-400 hover:text-[#ff4d4d] hover:translate-x-1 transition-all inline-block">Flash Sale</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wide">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/track-order" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Track Order</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">FAQs</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Shipping Info</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wide">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Terms of Service</Link></li>
              <li><Link href="/refunds" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-sm font-medium">
            © {new Date().getFullYear()} DropZone India. All rights reserved.
          </p>
          
          <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 rounded-full bg-[#161616] border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#c8ff00] hover:border-[#c8ff00]/30 transition-all text-xs font-bold">
              IG
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#161616] border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#c8ff00] hover:border-[#c8ff00]/30 transition-all text-xs font-bold">
              X
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#161616] border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#c8ff00] hover:border-[#c8ff00]/30 transition-all text-xs font-bold">
              YT
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#161616] border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#c8ff00] hover:border-[#c8ff00]/30 transition-all text-xs font-bold">
              FB
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
