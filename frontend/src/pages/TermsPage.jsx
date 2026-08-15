import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <FileText className="h-6 w-6 text-[#1a1a50]" />
          <div>
            <h1 className="text-xl font-black text-slate-900">Terms of Service</h1>
            <p className="text-xs text-slate-500 font-medium">IIUC Document Workspace Guidelines</p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900">1. Acceptable Use</h2>
          <p>
            This platform is designated exclusively for generating official academic document covers (Assignments, Lab Reports, Lab Indexes, Capstone Projects) for IIUC course submissions.
          </p>

          <h2 className="text-sm font-bold text-slate-900">2. Academic Integrity</h2>
          <p>
            Users are responsible for ensuring all course codes, teacher designations, student IDs, and assignment titles accurately represent their academic work.
          </p>

          <h2 className="text-sm font-bold text-slate-900">3. System Availability</h2>
          <p>
            While the platform maintains 99.9% uptime, students are encouraged to generate and download their PDF/JPG covers ahead of submission deadlines.
          </p>

          <p className="text-[10px] text-slate-400 font-mono pt-4 border-t border-slate-100">
            Last Updated: August 2026 · International Islamic University Chittagong
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
