import React from 'react';
import { FileText, Microscope, Table, Users, CheckCircle, FileCheck } from 'lucide-react';

export const CapabilitiesStrip = () => {
  const capabilities = [
    { label: 'Assignment Cover', icon: FileText, desc: 'Single topic & teacher box' },
    { label: 'Lab Report Cover', icon: Microscope, desc: 'Experiment no & title' },
    { label: 'Lab Index Matrix', icon: Table, desc: 'Min 10 rows auto-padding' },
    { label: 'Group Project Cover', icon: Users, desc: '1 to 4 member grid' },
  ];

  const specs = [
    'A4-Ready (210×296mm)',
    'Vector PDF Export',
    'High-Res JPG Export',
    'IIUC Academic Profiles',
  ];

  return (
    <section className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Capability Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.label}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 transition-colors hover:border-[#006A4E]/40"
              >
                <div className="p-2.5 bg-[#006A4E]/10 text-[#006A4E] rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">{cap.label}</h4>
                  <p className="text-[11px] font-medium text-slate-500">{cap.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Restrained Technical Specification Badges */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-600">
          {specs.map((spec) => (
            <div key={spec} className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#006A4E]" />
              <span>{spec}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesStrip;
