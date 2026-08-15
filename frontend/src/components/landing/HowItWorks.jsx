import React from 'react';
import { Layers, Edit3, Download } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Choose a Template',
      description: 'Select Assignment Cover, Lab Report, Lab Index, or Group Project Report based on your coursework.',
      icon: Layers,
    },
    {
      number: '02',
      title: 'Enter Academic Information',
      description: 'Input course details and select your teacher. Profile fields auto-fill automatically for IIUC accounts.',
      icon: Edit3,
    },
    {
      number: '03',
      title: 'Preview and Download',
      description: 'Inspect the live A4 document preview and export pixel-perfect printable PDF or high-resolution JPG image.',
      icon: Download,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black text-[#006A4E] uppercase tracking-widest bg-[#006A4E]/10 px-3 py-1 rounded-full">
            Simplified Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Your Cover in Three Steps
          </h2>
          <p className="text-sm font-medium text-slate-600">
            A clean academic utility built for fast, error-free document preparation.
          </p>
        </div>

        {/* 3-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bento-card p-8 flex flex-col justify-between space-y-6 relative"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1a50] text-[#F3CF45] flex items-center justify-center font-black text-sm shadow-xs">
                    {step.number}
                  </div>
                  <Icon className="h-6 w-6 text-[#006A4E]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{step.title}</h3>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
