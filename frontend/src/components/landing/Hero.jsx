import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, LogIn, CheckCircle2, FileCheck2, Download, Sparkles } from 'lucide-react';
import campusBg from '../../Image/hero.png';
import coverImage from '../../Design page/hero image.png';

export const Hero = () => {
  return (
    <section className="relative w-full pt-28 pb-16 md:pt-36 md:pb-24 border-b border-slate-200/80 overflow-hidden">
      
      {/* 1. Full-Width IIUC Campus Aerial Background with Soft Focus & White Gradient Overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src={campusBg}
          alt="IIUC Campus Aerial View"
          className="w-full h-full object-cover object-center filter blur-[2px] scale-[1.02]"
        />
        {/* Soft Left-to-Right Academic White Gradient Overlay for Maximum Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 via-70% to-white/40" />
      </div>

      {/* Embedded Animation Styles */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatBadge1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatBadge2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .animate-float-card {
          animation: floatCard 4s infinite ease-in-out;
        }
        .animate-float-badge-1 {
          animation: floatBadge1 4s infinite ease-in-out;
        }
        .animate-float-badge-2 {
          animation: floatBadge2 4s infinite ease-in-out 1s;
        }
        .animate-pulse-glow {
          animation: pulseGlow 2.5s infinite ease-in-out;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 50/50 Balanced Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Academic Copy & Action CTAs */}
          <div className="space-y-6 text-left animate-fadeInUp">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#006A4E]/10 border border-[#006A4E]/25 rounded-full text-xs font-bold text-[#006A4E] backdrop-blur-md shadow-xs">
              <ShieldCheck className="h-4 w-4" />
              <span className="uppercase tracking-widest text-[11px]">IIUC Academic Document Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Professional Academic Covers, <br />
              <span className="text-[#006A4E]">Made for IIUC Students.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
              Create clean, standardized A4 covers for assignments, lab reports, lab indexes, and project reports in seconds. Vector PDF & high-resolution JPG export ready.
            </p>

            {/* Capability Bullets */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-semibold text-slate-800 max-w-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#006A4E] shrink-0" />
                <span>Exact A4 Print Specs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#006A4E] shrink-0" />
                <span>Faculty Directory Auto-Suggest</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#006A4E] shrink-0" />
                <span>Vector PDF & JPG Export</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#006A4E] shrink-0" />
                <span>Academic Profile Auto-Fill</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link to="/create" className="btn-iiuc-primary text-xs sm:text-sm shadow-md">
                <span>Create a Cover</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link to="/templates" className="btn-iiuc-outline text-xs sm:text-sm bg-white/80 backdrop-blur-xs">
                <span>Explore Templates</span>
              </Link>

              <Link to="/login" className="btn-iiuc-gold text-xs sm:text-sm shadow-xs">
                <LogIn className="h-4 w-4" />
                <span>IIUC Account</span>
              </Link>
            </div>

            {/* Guest Mode Note */}
            <div className="text-[11px] font-semibold text-slate-600 pt-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#006A4E]" />
              <span>Guest mode supported. No account required to generate and export.</span>
            </div>
          </div>

          {/* Right Column: Floating Glassmorphism Cover Preview Card */}
          <div className="flex justify-center relative items-center h-fit pt-4 lg:pt-0">
            
            {/* Premium 410x508 Glass Container with Smooth Floating Animation */}
            <div className="w-[330px] h-[410px] sm:w-[410px] sm:h-[508px] bg-white/45 backdrop-blur-md border border-white/60 rounded-3xl p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative z-10 animate-float-card transition-all hover:scale-[1.02]">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-white/60 border border-slate-100/80 flex items-center justify-center p-1">
                <img
                  src={coverImage}
                  alt="IIUC Assignment Cover Preview"
                  className="w-full h-full object-contain rounded-xl transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
