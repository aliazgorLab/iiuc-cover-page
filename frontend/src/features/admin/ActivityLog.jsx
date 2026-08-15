import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock } from 'lucide-react';
import { Pagination } from './components/Pagination';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../config/apiConfig';


const MODULE_BADGE = {
  STUDENTS:  'bg-indigo-50 text-indigo-700 border-indigo-100',
  TEACHERS:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  COURSES:   'bg-amber-50 text-amber-700 border-amber-100',
  TEMPLATES: 'bg-blue-50 text-blue-700 border-blue-100',
  SYSTEM:    'bg-slate-100 text-slate-600 border-slate-200',
  AUTH:      'bg-purple-50 text-purple-700 border-purple-100',
};

const MODULES = ['STUDENTS', 'TEACHERS', 'COURSES', 'TEMPLATES', 'SYSTEM', 'AUTH'];

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filterModule, setFilterModule] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterModule) params.append('module', filterModule);
      const res = await fetch(`${API}/admin/activity-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setLogs(json.data.logs);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch {
      toast.error('Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  }, [page, filterModule]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [filterModule]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900">Activity Log</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Institutional governance audit trail — {total} recorded events
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a50] text-white rounded-lg text-xs font-bold">
          <Activity className="h-3.5 w-3.5" />
          <span>{total} Events</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500">Filter by module:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterModule('')}
            className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all cursor-pointer ${!filterModule ? 'bg-[#006A4E] text-white border-[#006A4E]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            All
          </button>
          {MODULES.map((m) => (
            <button
              key={m}
              onClick={() => setFilterModule(m)}
              className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all cursor-pointer ${filterModule === m ? 'bg-[#006A4E] text-white border-[#006A4E]' : `${MODULE_BADGE[m]} hover:opacity-80`}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Admin</th>
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Module</th>
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center"><div className="w-6 h-6 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Clock className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No activity recorded yet.</p>
                  <p className="text-[10px] text-slate-300 font-medium mt-0.5">Admin actions will appear here automatically.</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[10px] text-slate-400 font-medium font-mono">{formatDateTime(log.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#1a1a50] text-white flex items-center justify-center text-[9px] font-black">
                        {log.adminName?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{log.adminName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${MODULE_BADGE[log.module] || MODULE_BADGE.SYSTEM}`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-700 font-medium">{log.description}</span>
                    {log.targetName && (
                      <span className="ml-1 text-[10px] text-slate-400">— {log.targetName}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
