import React from 'react';
import { Sparkles, Zap, Code, Layout, ArrowRight, User } from 'lucide-react';

const Presentation = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-yellow-500/30">
      
      {/* ================= BACKGROUND LAYERS ================= */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-30 grayscale scale-105" 
        />
        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#006A4E]/20 via-transparent to-transparent"></div>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
        
        {/* --- LEFT SIDE: PROJECT INFO --- */}
        <div className="space-y-10 animate-fadeInLeft">
          
          {/* Top Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="text-gray-300 text-xs font-bold tracking-[0.2em] uppercase">Project Presentation</span>
          </div>

          {/* Huge Title */}
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-4">
              IIUC <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006A4E] via-green-400 to-yellow-400">
                Cover Page
              </span>
            </h1>
            <p className="text-3xl font-light text-gray-400 tracking-wide">
              Generator <span className="text-yellow-500">.</span>
            </p>
          </div>

          {/* Slogan / Problem Solver */}
          <div className="border-l-4 border-yellow-500 pl-6 py-2">
            <p className="text-xl md:text-2xl text-white font-medium italic">
              "Stop Formatting. Start Submitting."
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              The automated solution for standardizing academic submissions.
            </p>
          </div>

          {/* Presenter Info Box */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl max-w-md backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-xl">
              <User />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest">Presented By</p>
              <h3 className="text-white font-bold text-lg">Md Ali Azgor</h3>
              <p className="text-gray-500 text-xs">Frontend Developer & UI/UX Designer</p>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="flex gap-4 pt-4 opacity-60">
            <TechBadge icon={<Code size={14} />} text="React" />
            <TechBadge icon={<Layout size={14} />} text="Tailwind" />
            <TechBadge icon={<Zap size={14} />} text="Vite" />
          </div>

        </div>

        {/* --- RIGHT SIDE: LIVE DEMO (IFRAME) --- */}
        <div className="relative flex justify-center items-center h-full perspective-1000">
          
          {/* 3D Container */}
          <div className="w-[420px] h-[600px] relative transform rotate-y-[-15deg] rotate-x-[10deg] animate-float z-20 transition-all duration-500 hover:rotate-y-0 hover:rotate-x-0 group">
             
             {/* LIVE DEMO BADGE */}
             <div className="absolute -top-6 right-0 z-30">
               <span className="bg-green-500 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-green-400 animate-pulse">
                 ● LIVE RENDER
               </span>
             </div>

             {/* THE IFRAME (SCALED DOWN) */}
             <div className="absolute inset-0 bg-white rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-gray-200">
                {/* Calculations for Perfect Fit:
                    - Real A4 Width: 794px
                    - Container Width: 420px
                    - Scale Needed: 420 / 794 = 0.53
                */}
                <iframe 
                  src="/src/Design page/assignment.html" 
                  title="Live Preview"
                  className="absolute top-0 left-0 w-[794px] h-[1123px] border-none bg-white origin-top-left pointer-events-none select-none"
                  style={{ transform: 'scale(0.528)' }} 
                />
                
                {/* Interaction Overlay (Optional: Click to Open Full) */}
                <a href="/src/Design page/assignment.html" target="_blank" className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors cursor-zoom-in flex items-center justify-center opacity-0 group-hover:opacity-100">
                   <div className="bg-white/90 backdrop-blur text-black px-4 py-2 rounded-full text-xs font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                      Click to View Full Size ↗
                   </div>
                </a>
             </div>

          </div>

          {/* Background Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#006A4E]/20 blur-[100px] -z-10 rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-yellow-400/10 blur-[80px] -z-10 rounded-full"></div>

        </div>

      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="absolute bottom-0 w-full h-16 border-t border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 z-20">
        <p className="text-gray-500 text-xs tracking-widest uppercase">Confidential • For Academic Purpose Only</p>
        <a href="https://iiuccoverpage.vercel.app/" className="flex items-center gap-2 text-white/50 hover:text-yellow-400 transition-colors text-sm font-bold group">
          START <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
        </a>
      </div>

    </div>
  );
};

// Helper Component for Tech Stack
const TechBadge = ({ icon, text }) => (
  <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-white/10 bg-white/5 text-gray-400 text-xs font-medium">
    {icon}
    <span>{text}</span>
  </div>
);

export default Presentation;
