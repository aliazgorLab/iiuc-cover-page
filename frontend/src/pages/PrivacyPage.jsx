import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Shield className="h-6 w-6 text-[#006A4E]" />
          <div>
            <h1 className="text-xl font-black text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500 font-medium">International Islamic University Chittagong Platform Governance</p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900">1. Data Collection</h2>
          <p>
            We collect basic academic profile information (Name, Email, Student ID, Department) provided via official Google OAuth verification to hydrate academic cover documents.
          </p>

          <h2 className="text-sm font-bold text-slate-900">2. Document Security</h2>
          <p>
            Cover metadata saved in your cloud history is encrypted and associated strictly with your authenticated user account. We never sell or distribute student academic data.
          </p>

          <h2 className="text-sm font-bold text-slate-900">3. Authentication Tokens</h2>
          <p>
            JWT access tokens are stored in secure browser local storage with 15-minute expiration windows and encrypted refresh tokens.
          </p>

          <p className="text-[10px] text-slate-400 font-mono pt-4 border-t border-slate-100">
            Last Updated: August 2026 · IIUC Administration Office
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
