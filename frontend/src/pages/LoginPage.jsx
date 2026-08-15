import React from 'react';
import { ShieldCheck, GraduationCap } from 'lucide-react';
import LoginForm from '../features/authentication/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-gradient-to-br from-emerald-50/40 via-white to-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Decorative Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#006A4E]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-gradient-to-br from-[#006A4E] to-[#00805d] text-white rounded-2xl shadow-lg shadow-[#006A4E]/20">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              IIUC Student Portal
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-1 flex items-center justify-center gap-1">
              <ShieldCheck className="h-4 w-4 text-[#006A4E]" />
              Official IIUC Academic Identity Verification
            </p>
          </div>
        </div>

        {/* Login Form with Primary Google OAuth Button */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
