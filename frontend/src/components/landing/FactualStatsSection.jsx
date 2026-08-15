import React from 'react';
import { Layers, FileText, Image, ShieldCheck } from 'lucide-react';

export const FactualStatsSection = () => {
  const stats = [
    { number: '4', label: 'Cover Types', desc: 'Assignment, Lab Report, Lab Index, Project', icon: Layers },
    { number: 'A4', label: 'Standard Format', desc: 'Exact 210 × 296 mm print dimensions', icon: FileText },
    { number: 'PDF', label: 'Vector Output', desc: 'Crisp printable PDF document export', icon: ShieldCheck },
    { number: 'JPG', label: 'High-Res Image', desc: 'Canvas-based image snapshot export', icon: Image },
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.label} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                <div className="inline-flex p-3 bg-[#006A4E]/10 text-[#006A4E] rounded-xl mb-1">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">{st.number}</div>
                <div className="text-xs font-extrabold text-[#006A4E] uppercase tracking-wider">{st.label}</div>
                <p className="text-[11px] font-medium text-slate-500">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FactualStatsSection;
