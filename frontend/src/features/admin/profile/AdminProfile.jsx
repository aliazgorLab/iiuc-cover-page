import React, { useState, useEffect } from 'react';
import { Shield, Clock, Monitor, Smartphone, Key, Lock, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';


const ALL_PERMISSIONS = [
  { key: 'MANAGE_STUDENTS', label: 'Manage Students & Accounts' },
  { key: 'MANAGE_TEACHERS', label: 'Manage Faculty Directory' },
  { key: 'MANAGE_COURSES',  label: 'Manage Course Catalog' },
  { key: 'MANAGE_TEMPLATES',label: 'Manage Cover Templates' },
  { key: 'VIEW_ANALYTICS',  label: 'View Intelligence Analytics' },
  { key: 'EXPORT_DATA',     label: 'Export Reports & CSV' },
];

export const AdminProfile = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch(`${API}/admin/profile/sessions`, { headers });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setSessions(json.data || []);
    } catch {
      toast.error('Failed to fetch security login sessions.');
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const role = (user?.role || 'ADMIN').toUpperCase();
  const userPermissions = user?.permissions?.length
    ? user.permissions
    : role === 'SUPER_ADMIN'
    ? ALL_PERMISSIONS.map((p) => p.key)
    : role === 'ADMIN'
    ? ALL_PERMISSIONS.map((p) => p.key)
    : ['VIEW_ANALYTICS'];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-black text-slate-900">Admin Profile & Security Center</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Account identity, privileges matrix, and login security audit
        </p>
      </div>

      {/* Identity Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover ring-4 ring-[#F3CF45]/30" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#1a1a50] text-white flex items-center justify-center text-2xl font-black">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-black text-slate-900">{user?.name || 'Administrator'}</h2>
            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black px-2.5 py-0.5 bg-[#1a1a50] text-[#F3CF45] rounded uppercase">
                {role}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified OAuth Identity
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="h-4 w-4 text-[#006A4E]" />
          <h3 className="text-sm font-black text-slate-900">Granted Institutional Permissions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_PERMISSIONS.map(({ key, label }) => {
            const hasPerm = role === 'SUPER_ADMIN' || userPermissions.includes(key);
            return (
              <div
                key={key}
                className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  hasPerm
                    ? 'bg-emerald-50/50 border-emerald-200 text-[#006A4E]'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <CheckCircle className={`h-4 w-4 flex-shrink-0 ${hasPerm ? 'text-[#006A4E]' : 'text-slate-300'}`} />
                <div>
                  <div className="text-xs font-bold leading-tight">{label}</div>
                  <div className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">{key}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Login Sessions Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-700" />
            <h3 className="text-sm font-black text-slate-900">Recent Login Sessions & Security Audit</h3>
          </div>
          <button
            onClick={fetchSessions}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
            title="Refresh Sessions"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-2.5 text-[11px] font-black text-slate-500 uppercase">Login Timestamp</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-black text-slate-500 uppercase">IP Address</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-black text-slate-500 uppercase">Device</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-black text-slate-500 uppercase">Client Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {loadingSessions ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    <div className="w-5 h-5 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                    No active sessions logged yet.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {new Date(s.loginTime || s.createdAt).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{s.ip || '127.0.0.1'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                        {s.device === 'Mobile' ? <Smartphone className="h-3.5 w-3.5 text-indigo-600" /> : <Monitor className="h-3.5 w-3.5 text-[#006A4E]" />}
                        {s.device || 'Desktop'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10px] truncate max-w-xs">
                      {s.browser || 'Browser'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
