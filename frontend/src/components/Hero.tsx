import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';

const Hero = () => {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0e0e0e] pt-16">
      {/* Background Image & Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-general.png"
          alt="Trending lifestyle products"
          fill
          className="object-cover object-center opacity-40 scale-105 animate-[spin-slow_60s_linear_infinite_reverse]"
          priority
          sizes="100vw"
        />
        {/* Gradients to blend image with background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/50 to-transparent"></div>
        
        {/* Neon Glow Blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#c8ff00]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00cfff]/10 rounded-full blur-[100px] mix-blend-screen animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left: Text & CTAs */}
        <div className="flex-1 text-center lg:text-left mt-10 lg:mt-0">
          <AnimateOnScroll animation="fade-in-up" delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass border border-white/10 text-xs font-bold tracking-widest uppercase text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ff00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c8ff00]"></span>
              </span>
              New Collection Drop
            </div>
          </AnimateOnScroll>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-white">
            <AnimateOnScroll animation="fade-in-up" delay={200}>
              Street-Ready <br className="hidden sm:block" />
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-in-up" delay={300}>
              <span className="relative inline-block">
                Fits.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#c8ff00] animate-pulse-glow" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                </svg>
              </span>
              <span className="text-[#888888]"> For Less.</span>
            </AnimateOnScroll>
          </h1>

          <AnimateOnScroll animation="fade-in-up" delay={400}>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Discover the most trending lifestyle products handpicked for quality and style. <strong className="text-white">Fast delivery across India.</strong>
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-in-up" delay={500}>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link 
                href="/products" 
                className="btn-accent w-full sm:w-auto text-lg py-4 px-8 shadow-[0_0_20px_rgba(200,255,0,0.3)]"
              >
                <Zap fill="currentColor" size={20} />
                Shop Now
              </Link>
              <Link 
                href="/products" 
                className="btn-outline w-full sm:w-auto text-lg py-4 px-8 group"
              >
                View Deals
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-in-up" delay={700}>
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 pt-8 border-t border-white/10">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0e0e0e] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold z-[${10-i}]`}>
                    {i === 4 ? '+5k' : `👦`}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex text-[#c8ff00] mb-1 text-xs">★★★★★</div>
                <p className="text-gray-400 font-medium">Loved by <span className="text-white font-bold">50,000+</span> shoppers</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Right: Floating Visual / Product Peek */}
        <div className="flex-1 hidden lg:block relative h-[600px] w-full">
          <AnimateOnScroll animation="fade-in-up" delay={400} className="absolute inset-0">
            {/* Main floating card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-96 bg-[#161616] rounded-[30px] border border-white/10 shadow-2xl overflow-hidden animate-float z-20">
               <Image src="/hero-general.png" alt="Product" fill className="object-cover opacity-80" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                 <div className="glass px-3 py-1 rounded-full w-max text-xs font-bold text-[#c8ff00] mb-2 border border-[#c8ff00]/30 backdrop-blur-md">HOT DROP</div>
                 <h3 className="text-white font-bold text-lg leading-tight mb-1">Oversized Premium Hoodie</h3>
                 <p className="text-[#c8ff00] font-black text-xl">₹1,299</p>
               </div>
            </div>

            {/* Floating badges */}
            <div className="absolute top-[20%] left-[calc(50%+130px)] glass px-4 py-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3 animate-float z-30 w-max" style={{ animationDelay: '1s' }}>
              <div className="w-10 h-10 rounded-full bg-[#00cfff]/20 flex items-center justify-center text-[#00cfff]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Secure Payment</p>
                <p className="text-gray-400 text-xs font-medium">100% Safe</p>
              </div>
            </div>

            <div className="absolute bottom-[25%] right-[calc(50%+130px)] glass px-4 py-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3 animate-float z-30 w-max" style={{ animationDelay: '2.5s' }}>
              <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center text-[#c8ff00]">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Premium Quality</p>
                <p className="text-gray-400 text-xs font-medium">Top Materials</p>
              </div>
            </div>
            
            {/* Background decorative circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full z-10 animate-[spin-slow_10s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full z-10 border-dashed animate-[spin-slow_15s_linear_infinite_reverse]"></div>
          </AnimateOnScroll>
        </div>
      </div>

      {/* Marquee Ticker at bottom of hero */}
      <div className="absolute bottom-0 left-0 w-full bg-[#c8ff00] text-black py-2.5 overflow-hidden z-20 border-y border-[#a8d600]">
        <div className="marquee-track flex gap-8 items-center font-bold text-sm uppercase tracking-widest whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <span>🔥 FREE SHIPPING OVER ₹499</span>
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span>⚡ FLASH SALE LIVE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span>💯 100% QUALITY GUARANTEED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
