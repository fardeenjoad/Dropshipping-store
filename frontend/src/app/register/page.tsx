"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { registerUser } from '@/services/api';
import { UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(name, email, password);
      login(data.user, data.token);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-[#0e0e0e] text-white">
      {/* Right side: Branding (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[#161616] flex-col justify-between p-12 border-l border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#c8ff00]/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-glow"></div>
          <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-[#00cfff]/10 rounded-full blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618354691438-25bc04584c23?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-[#161616]/50"></div>
        </div>

        <div className="relative z-10 flex justify-end">
          <Link href="/" className="text-3xl font-black tracking-tight text-white flex items-center gap-2 group w-max">
            <span className="bg-gradient-to-r from-[#c8ff00] to-[#00cfff] w-10 h-10 rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(200,255,0,0.4)]">
              D
            </span>
            DropZone<span className="text-[#c8ff00]">.</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md ml-auto text-right">
          <AnimateOnScroll animation="fade-in-up">
            <h2 className="text-5xl font-black mb-6 leading-tight">Join the <br/><span className="text-[#00cfff]">Movement.</span></h2>
            <p className="text-xl text-gray-400 font-medium">Create an account to track orders, save wishlists, and get exclusive drops.</p>
          </AnimateOnScroll>
          
          <div className="mt-12 glass p-6 rounded-2xl border border-white/10 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#c8ff00]/20 flex items-center justify-center text-[#c8ff00] font-bold">✓</div>
               <span className="text-sm font-medium">Free shipping on orders ₹499+</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#c8ff00]/20 flex items-center justify-center text-[#c8ff00] font-bold">✓</div>
               <span className="text-sm font-medium">Early access to limited drops</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#c8ff00]/20 flex items-center justify-center text-[#c8ff00] font-bold">✓</div>
               <span className="text-sm font-medium">Easy 7-day returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Left side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        {/* Mobile branding */}
        <div className="md:hidden absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2 text-white">
            <ArrowLeft size={20} />
            <span className="font-bold">Back to Store</span>
          </Link>
        </div>

        <div className="w-full max-w-md mt-16 md:mt-0">
          <AnimateOnScroll animation="fade-in-up">
            <div className="md:hidden mb-8 text-center">
              <span className="bg-gradient-to-r from-[#c8ff00] to-[#00cfff] w-12 h-12 rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(200,255,0,0.4)] mx-auto text-xl font-black mb-4">
                D
              </span>
              <h1 className="text-3xl font-black">DropZone<span className="text-[#c8ff00]">.</span></h1>
            </div>

            <div className="bg-[#161616] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              {/* Subtle top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#00cfff]/50 to-transparent"></div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">Create Account</h2>
                <p className="text-gray-400 text-sm">Join us today. It takes less than a minute.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 text-[#ff4d4d] text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d]"></span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group relative">
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all peer"
                    placeholder="Full Name"
                  />
                  <label htmlFor="name" className="absolute left-5 top-4 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#c8ff00] peer-focus:bg-[#161616] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#161616] peer-valid:px-1">
                    Full Name
                  </label>
                </div>

                <div className="group relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all peer"
                    placeholder="Email Address"
                  />
                  <label htmlFor="email" className="absolute left-5 top-4 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#c8ff00] peer-focus:bg-[#161616] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#161616] peer-valid:px-1">
                    Email Address
                  </label>
                </div>

                <div className="group relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all peer pr-12"
                    placeholder="Password"
                  />
                  <label htmlFor="password" className="absolute left-5 top-4 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#c8ff00] peer-focus:bg-[#161616] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#161616] peer-valid:px-1">
                    Password (Min. 6 chars)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="group relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all peer pr-12"
                    placeholder="Confirm Password"
                  />
                  <label htmlFor="confirmPassword" className="absolute left-5 top-4 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#c8ff00] peer-focus:bg-[#161616] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#161616] peer-valid:px-1">
                    Confirm Password
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-accent py-4 text-base mt-4 shadow-[0_0_20px_rgba(200,255,0,0.15)] hover:shadow-[0_0_30px_rgba(200,255,0,0.3)]"
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                  ) : (
                    <>
                      Create Account
                      <UserPlus size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-gray-400 text-sm mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-bold hover:text-[#c8ff00] transition-colors underline decoration-white/30 underline-offset-4">
                Sign in
              </Link>
            </p>
          </AnimateOnScroll>
        </div>
      </div>
    </div>
  );
}
