import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Users, FileText, Building2, TrendingUp, RefreshCw, ShieldAlert, Award, Calendar } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';

const fmt = (n) => (n != null ? n.toLocaleString() : '—');

const PIE_COLORS = ['#006A4E', '#1a1a50', '#F3CF45', '#3B82F6', '#8B5CF6', '#EC4899'];

export const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    fetch(`${API}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.data) setData(res.data);
      })
      .catch(() => toast.error('Failed to load institutional analytics telemetry.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAnalytics(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpi = {}, dailyTrend = [], coversByType = [], coversByDept = [] } = data || {};

  const typePieData = coversByType.map((item) => ({
    name: item._id || 'Other',
    value: item.count,
  }));

  const deptBarData = coversByDept.map((item) => ({
    name: item._id?.replace('Dept. of ', '') || 'Other',
    Covers: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900">Institutional Intelligence & Analytics</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time IIUC document generation trend, department telemetry, and user metrics
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Registered Students" value={fmt(kpi.totalStudents)} icon={Users} color="navy" sub="IIUC academic accounts" />
        <StatsCard label="Active Students" value={fmt(kpi.activeStudents)} icon={Users} color="emerald" sub="Operational status" />
        <StatsCard label="Suspended Accounts" value={fmt(kpi.suspendedStudents)} icon={ShieldAlert} color="red" sub="Restricted access" />
        <StatsCard label="Total Covers Generated" value={fmt(kpi.totalCovers)} icon={FileText} color="amber" sub="All time submissions" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Generated This Month" value={fmt(kpi.monthCovers)} icon={Calendar} color="emerald" sub="Current calendar month" />
        <StatsCard label="Today's Generation" value={fmt(kpi.todayCovers)} icon={TrendingUp} color="navy" sub="Logged today" />
        <StatsCard label="Most Used Format" value={kpi.mostUsedTemplate} icon={Award} color="amber" sub="Popularity leader" />
        <StatsCard label="Most Active Faculty" value={kpi.mostActiveDept} icon={Building2} color="slate" sub="Usage leader" />
      </div>

      {/* 30-Day Generation Trend LineChart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#006A4E]" />
            <h3 className="text-sm font-black text-slate-900">30-Day Cover Generation Volume</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-[#006A4E] border border-emerald-200 rounded-full">
            Daily Output
          </span>
        </div>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a50', borderRadius: '8px', border: 'none', color: '#fff' }}
                labelStyle={{ color: '#F3CF45', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="covers" name="Covers Generated" stroke="#006A4E" strokeWidth={3} dot={{ r: 3, fill: '#006A4E' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Usage & Document Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Department Usage BarChart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="h-4 w-4 text-[#1a1a50]" />
            <h3 className="text-sm font-black text-slate-900">Department Usage Comparison</h3>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a50', borderRadius: '8px', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#F3CF45', fontWeight: 'bold' }}
                />
                <Bar dataKey="Covers" fill="#1a1a50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Type Distribution PieChart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-black text-slate-900">Document Type Distribution</h3>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {typePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a50', borderRadius: '8px', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#F3CF45', fontWeight: 'bold' }}
                />
                <Legend tick={{ fontSize: 11, fill: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Faculty Intelligence Statistics Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <Building2 className="h-5 w-5 text-[#006A4E]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Faculty Intelligence Statistics</h3>
              <p className="text-xs text-slate-500 font-medium">Departmental distribution across 277 synchronized IIUC faculty members</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-[#006A4E] text-xs font-black rounded-full">
            {fmt(kpi.totalTeachers || 277)} Faculty Members
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(data?.teachersByDept || []).map(item => ({
                  name: item._id?.replace('Dept. of ', '')?.replace('Computer Science and Engineering', 'CSE') || 'Other',
                  Faculty: item.count
                }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a50', borderRadius: '8px', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#F3CF45', fontWeight: 'bold' }}
                />
                <Bar dataKey="Faculty" fill="#006A4E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Faculty Distribution Metrics</h4>
            <div className="space-y-2 border border-slate-200/80 rounded-xl p-3 bg-slate-50">
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200">
                <span className="font-medium text-slate-600">Total Faculty Members</span>
                <span className="font-black text-[#006A4E]">{fmt(kpi.totalTeachers || 277)}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200">
                <span className="font-medium text-slate-600">Most Active Department</span>
                <span className="font-bold text-slate-900">{kpi.mostActiveDept || 'Dept. of CSE'}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5">
                <span className="font-medium text-slate-600">Departments Synchronized</span>
                <span className="font-bold text-blue-600">14 Departments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
