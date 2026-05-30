import React from 'react';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';

const TrustBadges = () => {
  const badges = [
    {
      icon: <Truck className="text-[#c8ff00]" size={36} />,
      title: "Fast Shipping",
      description: "Express delivery across all pincodes in India.",
      delay: 100
    },
    {
      icon: <RotateCcw className="text-[#00cfff]" size={36} />,
      title: "Easy Returns",
      description: "Hassle-free 7-day return policy for peace of mind.",
      delay: 200
    },
    {
      icon: <ShieldCheck className="text-[#ff4d4d]" size={36} />,
      title: "Secure Payment",
      description: "100% encrypted checkout with UPI, Cards & Netbanking.",
      delay: 300
    }
  ];

  return (
    <section className="py-24 bg-[#0e0e0e] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#c8ff00]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimateOnScroll animation="fade-in-up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Why Choose <span className="text-[#c8ff00]">DropZone</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We don't just sell products, we deliver an experience. Here's what makes us different.</p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {badges.map((badge, idx) => (
            <AnimateOnScroll key={idx} animation="fade-in-up" delay={badge.delay}>
              <div className="flex flex-col items-center text-center p-8 bg-[#161616] rounded-[32px] border border-white/5 hover:border-white/20 transition-all duration-300 group h-full">
                <div className="mb-6 p-5 bg-[#0e0e0e] rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300 relative">
                  {/* Subtle glow behind icon */}
                  <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${idx === 0 ? 'bg-[#c8ff00]' : idx === 1 ? 'bg-[#00cfff]' : 'bg-[#ff4d4d]'}`}></div>
                  <div className="relative z-10">{badge.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-sans tracking-tight">{badge.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{badge.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
