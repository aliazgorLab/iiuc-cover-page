import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, Shield, Layers, FileDown, RefreshCw, ArrowRight } from 'lucide-react';

export const FeaturesPage = () => {
  const features = [
    { title: 'Official IIUC Academic Format', desc: 'Pre-configured margins, official university logo, border frame, and typography rules.' },
    { title: 'Google OAuth Domain Guard', desc: 'Secure single sign-on restricted strictly to official IIUC student & faculty email addresses.' },
    { title: '30-Second Auto Save Drafts', desc: 'Never lose assignment data. Your document workspace auto-saves to your cloud account.' },
    { title: 'Cloud History & Reopening', desc: 'All generated covers are saved in cloud history so you can edit or duplicate past submissions.' },
    { title: 'Vector PDF & High-Res JPG Export', desc: 'One-click export directly to crisp vector PDF or 300 DPI JPG image format.' },
    { title: 'Multi-Member Group Projects', desc: 'Support for capstone projects with up to 6 team members and supervisor details.' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#006A4E]/10 border border-[#006A4E]/20 rounded-full text-xs font-black text-[#006A4E]">
            <Sparkles className="h-4 w-4" />
            <span>Product Capabilities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Why IIUC Students Use Our Platform
          </h1>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            Designed to save hours of manual formatting while producing institutional-grade cover pages.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2.5 shadow-sm hover:border-[#006A4E]/50 transition-all">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#006A4E] shrink-0" />
                <h3 className="text-base font-black text-slate-900">{f.title}</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed pl-7.5">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link to="/create" className="btn-iiuc-primary text-xs !py-3.5 !px-8 inline-flex items-center gap-2">
            <span>Explore Cover Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
