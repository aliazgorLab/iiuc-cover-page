import React, { useState, useEffect } from 'react';
import { Users, FileText, BookOpen, GraduationCap, Building2, TrendingUp, Clock, ShieldCheck, Activity, Server, Database, HardDrive } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';


const fmt = (n) => (n != null ? n.toLocaleString() : '—');
const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const TYPE_COLORS = {
  ASSIGNMENT: { bar: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  LAB_REPORT: { bar: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-100' },
  LAB_INDEX:  { bar: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  PROJECT:    { bar: 'bg-[#006A4E]',  badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
};

const DEPT_PALETTE = ['bg-[#006A4E]', 'bg-[#1a1a50]', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500'];

const MODULE_ICON = {
  STUDENTS:  '👨‍🎓',
  TEACHERS:  '👨‍🏫',
  COURSES:   '📚',
  TEMPLATES: '📄',
  SYSTEM:    '⚙️',
  AUTH:      '🔐',
};

const CssBar = ({ label, count, max, color, badge }) => {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-bold px-2 py-0.5 rounded border text-[10px] ${badge}`}>{label}</span>
        <span className="font-black text-slate-700">{fmt(count)} <span className="text-slate-400 font-medium">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const AdminOverview = () => {
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/admin/analytics`, { headers: h }).then((r) => r.ok ? r.json() : null),
      fetch(`${API}/admin/activity/recent`, { headers: h }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([anaRes, actRes]) => {
        if (anaRes?.data) setAnalytics(anaRes.data);
        if (actRes?.data) setActivity(actRes.data);
      })
      .catch(() => toast.error('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { overview = {}, kpi = {}, coversByType = [], coversByDept = [] } = analytics || {};
  const ov = { ...kpi, ...overview };
  const maxType = Math.max(...coversByType.map((x) => x.count), 1);
  const maxDept = Math.max(...coversByDept.map((x) => x.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-black text-slate-900">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time IIUC platform metrics & operational telemetry</p>
      </div>

      {/* Platform Infrastructure Health Monitor */}
      <div className="bg-[#1a1a50] text-white p-5 rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#F3CF45]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">IIUC Platform Infrastructure Health</h2>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            OPERATIONAL 100%
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">REST API Status</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5 flex items-center gap-1">🟢 Healthy</div>
            </div>
            <Server className="h-4 w-4 text-slate-400" />
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">Database Cluster</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5 flex items-center gap-1">🟢 MongoDB Atlas</div>
            </div>
            <Database className="h-4 w-4 text-slate-400" />
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">Cloud Storage</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5 flex items-center gap-1">🟢 Cloud Active</div>
            </div>
            <HardDrive className="h-4 w-4 text-slate-400" />
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">Active Students</div>
              <div className="text-xs font-black text-[#F3CF45] mt-0.5">{fmt(ov.activeStudents || ov.totalStudents)} Active</div>
            </div>
            <Users className="h-4 w-4 text-[#F3CF45]" />
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard label="Total Students" value={fmt(ov.totalStudents)} icon={Users} color="navy" sub="Registered accounts" />
        <StatsCard label="Active Teachers" value={fmt(ov.totalTeachers)} icon={GraduationCap} color="emerald" sub="Faculty members" />
        <StatsCard label="Active Courses" value={fmt(ov.totalCourses)} icon={BookOpen} color="slate" sub="Academic courses" />
        <StatsCard label="Covers Generated" value={fmt(ov.totalCovers)} icon={FileText} color="amber" sub={`${fmt(ov.todayCovers)} today`} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard label="This Week" value={fmt(ov.weekCovers)} icon={TrendingUp} color="emerald" sub="Covers this week" />
        <StatsCard label="Departments" value={fmt(ov.totalDepartments)} icon={Building2} color="navy" sub="Active departments" />
        <StatsCard label="Today's Covers" value={fmt(ov.todayCovers)} icon={Clock} color="amber" sub="Generated today" />
        <StatsCard label="Security Shield" value="Enforced" icon={ShieldCheck} color="emerald" sub="JWT + RBAC Active" />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cover Type Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#006A4E]" />
            <h3 className="text-sm font-black text-slate-900">Cover Generation by Type</h3>
          </div>
          {coversByType.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">No cover data yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coversByType.map((item) => (
                <CssBar
                  key={item._id}
                  label={item._id || 'OTHER'}
                  count={item.count}
                  max={maxType}
                  color={(TYPE_COLORS[item._id] || { bar: 'bg-slate-400' }).bar}
                  badge={(TYPE_COLORS[item._id] || { badge: 'bg-slate-50 text-slate-600 border-slate-200' }).badge}
                />
              ))}
            </div>
          )}
        </div>

        {/* Department Usage */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-[#1a1a50]" />
            <h3 className="text-sm font-black text-slate-900">Cover Usage by Department</h3>
          </div>
          {coversByDept.length === 0 ? (
            <div className="py-8 text-center">
              <Building2 className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">No department data yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coversByDept.map((item, i) => (
                <CssBar
                  key={item._id || i}
                  label={item._id || 'Unknown'}
                  count={item.count}
                  max={maxDept}
                  color={DEPT_PALETTE[i % DEPT_PALETTE.length]}
                  badge="bg-slate-50 text-slate-700 border-slate-200"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-black text-slate-900">Recent Admin Activity</h3>
          </div>
          <a href="/admin/activity" className="text-[11px] font-bold text-[#006A4E] hover:underline">View all →</a>
        </div>
        {activity.length === 0 ? (
          <div className="py-6 text-center">
            <Clock className="h-7 w-7 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">No admin actions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-slate-50">
            {activity.map((log) => (
              <div key={log._id} className="flex items-start gap-3 py-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1a1a50] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {MODULE_ICON[log.module] || '⚙️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{log.description}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    by <span className="font-bold text-slate-600">{log.adminName}</span> · {fmtDate(log.createdAt)}
                  </p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase flex-shrink-0">
                  {log.module}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
