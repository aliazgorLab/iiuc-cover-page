import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Microscope, Table, Users } from 'lucide-react';
import { useCoverStore } from '../../stores/useCoverStore';

export const TemplateShowcase = () => {
  const setActiveTab = useCoverStore((state) => state.setActiveTab);

  const templates = [
    {
      id: 'assignment',
      title: 'Assignment Cover',
      description: 'Official single-assignment layout with course code, title, and faculty details.',
      icon: FileText,
      tag: 'Assignment',
    },
    {
      id: 'labReport',
      title: 'Lab Report Cover',
      description: 'Standard experiment report layout with experiment number and experiment title fields.',
      icon: Microscope,
      tag: 'Lab Report',
    },
    {
      id: 'labIndex',
      title: 'Lab Index Matrix',
      description: 'Multi-experiment index table with minimum 10 auto-padded rows for handwriting marks.',
      icon: Table,
      tag: 'Lab Index',
    },
    {
      id: 'project',
      title: 'Group Project Cover',
      description: 'Multi-student flexbox grid card layout for team projects supporting 1 to 4 members.',
      icon: Users,
      tag: 'Project',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black text-[#006A4E] uppercase tracking-widest bg-[#006A4E]/10 px-3 py-1 rounded-full">
            Standardized Formats
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Academic Cover Templates
          </h2>
          <p className="text-sm font-medium text-slate-600">
            Choose the document format you need and start creating instantly.
          </p>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                className="institutional-card p-6 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  {/* Card Visual Header */}
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-[#006A4E]/10 text-[#006A4E] rounded-xl group-hover:bg-[#006A4E] group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {tpl.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#006A4E] transition-colors">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">
                      {tpl.description}
                    </p>
                  </div>
                </div>

                {/* Direct Action Link */}
                <Link
                  to="/create"
                  onClick={() => setActiveTab(tpl.id)}
                  className="w-full btn-iiuc-primary text-xs !py-2.5 shadow-xs"
                >
                  <span>Create {tpl.tag}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TemplateShowcase;
