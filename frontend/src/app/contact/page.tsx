"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import Toast from '@/components/Toast';

export default function ContactPage() {
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    // Add real API call here if needed
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#0e0e0e] text-white">
      <Navbar />
      
      {/* Header Banner */}
      <div className="pt-24 pb-12 bg-[#161616] border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-[#c8ff00]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <AnimateOnScroll animation="fade-in-up">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">
              Hit Us <span className="text-[#c8ff00]">Up</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Got a question or collab idea? Drop us a line below.</p>
          </AnimateOnScroll>
        </div>
      </div>

      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Contact Info */}
          <div className="space-y-12">
            <AnimateOnScroll animation="fade-in-up">
              <h2 className="text-3xl font-black text-white mb-8">Get in Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="p-4 bg-[#161616] border border-white/10 rounded-2xl text-gray-400 group-hover:text-[#c8ff00] group-hover:border-[#c8ff00]/50 transition-all duration-300">
                    <Mail size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Email</h4>
                    <p className="text-gray-400">support@dropzone.in</p>
                    <a href="mailto:support@dropzone.in" className="text-sm font-bold text-[#c8ff00] mt-2 inline-block hover:underline underline-offset-4">Shoot us an email &rarr;</a>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="p-4 bg-[#161616] border border-white/10 rounded-2xl text-gray-400 group-hover:text-[#00cfff] group-hover:border-[#00cfff]/50 transition-all duration-300">
                    <Phone size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Phone</h4>
                    <p className="text-gray-400">+91 98765 43210</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Mon-Fri, 10 AM - 6 PM (IST)</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="p-4 bg-[#161616] border border-white/10 rounded-2xl text-gray-400 group-hover:text-[#ff4d4d] group-hover:border-[#ff4d4d]/50 transition-all duration-300">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">HQ Location</h4>
                    <p className="text-gray-400">New Delhi, India</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Online only. No offline store available.</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Contact Form */}
          <div>
            <AnimateOnScroll animation="fade-in-up" delay={200}>
              <form onSubmit={handleSubmit} className="bg-[#161616] p-8 md:p-10 rounded-[32px] shadow-2xl border border-white/5 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#c8ff00]/30 to-transparent"></div>
                
                <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>

                <div className="group relative">
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all peer"
                    placeholder="Full Name"
                  />
                  <label htmlFor="name" className="absolute left-5 top-4 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#c8ff00] peer-focus:bg-[#161616] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#161616] peer-valid:px-1">
                    Your Name
                  </label>
                </div>
                
                <div className="group relative">
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all peer"
                    placeholder="Email Address"
                  />
                  <label htmlFor="email" className="absolute left-5 top-4 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#c8ff00] peer-focus:bg-[#161616] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#161616] peer-valid:px-1">
                    Email Address
                  </label>
                </div>
                
                <div className="group relative">
                  <textarea
                    id="message"
                    required
                    rows={5}
                    className="w-full px-5 py-4 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-[#c8ff00] focus:ring-1 focus:ring-[#c8ff00] transition-all peer custom-scrollbar resize-none"
                    placeholder="Message"
                  ></textarea>
                  <label htmlFor="message" className="absolute left-5 top-4 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#c8ff00] peer-focus:bg-[#161616] peer-focus:px-1 peer-valid:-top-2 peer-valid:text-xs peer-valid:bg-[#161616] peer-valid:px-1">
                    Your Message
                  </label>
                </div>
                
                <button type="submit" className="w-full btn-accent py-4 text-lg shadow-[0_0_20px_rgba(200,255,0,0.15)] flex justify-center items-center gap-2 mt-4">
                  Send Message
                  <Send size={18} />
                </button>
              </form>
            </AnimateOnScroll>
          </div>
        </div>
      </div>

      <Footer />

      <Toast 
        message="Message sent successfully! We'll get back to you soon." 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </main>
  );
}
