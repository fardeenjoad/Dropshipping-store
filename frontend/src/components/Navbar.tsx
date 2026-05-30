"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, User, LogOut, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const { cartCount, setCartOpen } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2 group">
                <span className="bg-gradient-to-r from-[#c8ff00] to-[#00cfff] w-8 h-8 rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(200,255,0,0.4)] group-hover:shadow-[0_0_25px_rgba(200,255,0,0.6)] transition-all duration-300">
                  D
                </span>
                DropZone<span className="text-[#c8ff00]">.</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.path} 
                  className={`text-sm font-medium transition-colors relative group ${
                    pathname === link.path ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[#c8ff00] origin-left transition-transform duration-300 ${
                    pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>
              ))}
            </div>

            {/* Cart & Auth */}
            <div className="flex items-center space-x-5">
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-300 hover:text-[#c8ff00] transition-colors group focus:outline-none"
              >
                <ShoppingCart size={22} className="group-hover:scale-110 transition-transform duration-300" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-black transform translate-x-1/4 -translate-y-1/4 bg-[#c8ff00] rounded-full shadow-[0_0_10px_rgba(200,255,0,0.5)] animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors font-medium text-sm text-white"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c8ff00] to-[#00cfff] flex items-center justify-center text-black font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.name.split(' ')[0]}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#161616] rounded-xl shadow-2xl border border-white/10 py-2 z-50 animate-fade-in-up">
                      <div className="px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                          Admin Panel
                          <ChevronRight size={14} className="text-gray-500" />
                        </Link>
                      )}
                      
                      <Link href="/my-orders" className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        My Orders
                        <ChevronRight size={14} className="text-gray-500" />
                      </Link>
                      
                      <div className="h-px bg-white/5 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#ff4d4d] hover:bg-[#ff4d4d]/10 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    Log in
                  </Link>
                  <Link href="/register" className="btn-accent text-sm py-2 px-4 shadow-[0_0_15px_rgba(200,255,0,0.2)] hover:shadow-[0_0_25px_rgba(200,255,0,0.4)]">
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in md:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-[#161616] shadow-2xl border-l border-white/10 flex flex-col animate-slide-in-right">
            <div className="p-5 flex items-center justify-between border-b border-white/5">
              <span className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-[#c8ff00] w-6 h-6 rounded flex items-center justify-center text-black">D</span>
                Menu
              </span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.path} 
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    pathname === link.path 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-white/5 my-4 mx-4"></div>

              {user ? (
                <>
                  <div className="px-4 py-3 mb-2 flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8ff00] to-[#00cfff] flex items-center justify-center text-black font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  
                  <Link href="/my-orders" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                    My Orders
                  </Link>
                  
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 mt-2 rounded-xl text-base font-medium text-[#ff4d4d] hover:bg-[#ff4d4d]/10 transition-colors">
                    <LogOut size={18} />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="px-2 pt-2 space-y-3">
                  <Link href="/login" className="flex justify-center w-full px-4 py-3 rounded-xl text-base font-medium bg-white/5 text-white hover:bg-white/10 transition-colors">
                    Log in
                  </Link>
                  <Link href="/register" className="btn-accent w-full text-base py-3">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
