import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, LogIn, Sparkles, Database } from 'lucide-react';

export const StudentCTA = () => {
  const benefits = [
    'Automatic student information auto-fill',
    'Faster 1-click cover generation',
    'Saved cover submission history',
    'Cloud access across desktop & mobile',
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#1a1a50] via-[#006A4E] to-[#1a1a50] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-full text-xs font-black text-[#F3CF45]">
            <ShieldCheck className="h-4 w-4" />
            <span className="uppercase tracking-widest">IIUC Academic Accounts</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Your Academic Profile, Always Ready.
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto">
            Sign in with your IIUC academic account (@ugrad.iiuc.ac.bd) once and keep your student information ready for every assignment, lab report, and project cover page.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto pt-2 text-xs font-bold text-slate-100">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-[#F3CF45] shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link to="/login" className="btn-iiuc-gold text-sm shadow-md">
              <LogIn className="h-4 w-4" />
              <span>Continue with IIUC Account</span>
            </Link>

            <Link to="/create" className="btn-iiuc-outline text-sm !bg-transparent !text-white !border-white/30 hover:!bg-white/10">
              <span>Generate as Guest</span>
            </Link>
          </div>

          {/* Guest Clarification */}
          <p className="text-[11px] font-semibold text-slate-300 pt-2">
            🔒 Guest mode remains 100% free and functional without login.
          </p>
        </div>
      </div>
    </section>
  );
};

export default StudentCTA;
