import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

export const DevAuthDiagnostic = () => {
  // Only render in development mode
  if (!import.meta.env.DEV) return null;

  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const role = user?.role ? user.role.toUpperCase() : 'GUEST';
  const isAdminAllowed = ['ADMIN', 'SUPER_ADMIN'].includes(role);

  return (
    <div className="fixed bottom-3 left-3 z-50 bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 p-2.5 rounded-xl shadow-2xl text-[11px] font-mono flex items-center gap-3">
      <div className="flex items-center gap-1.5 font-bold">
        {isAdminAllowed ? (
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
        ) : (
          <ShieldAlert className="h-4 w-4 text-amber-400" />
        )}
        <span className="text-slate-400">DEV AUTH:</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-300 font-semibold">{user?.email || 'Guest'}</span>
        <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
          role === 'SUPER_ADMIN' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
          role === 'ADMIN' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' :
          'bg-slate-700 text-slate-300'
        }`}>
          {role}
        </span>
      </div>

      <button
        type="button"
        onClick={checkAuth}
        title="Sync role with MongoDB"
        className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-emerald-400 cursor-pointer"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default DevAuthDiagnostic;
