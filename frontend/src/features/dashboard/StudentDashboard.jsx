import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, User, History, Layers, ShieldCheck, ArrowRight, Clock, Award, Calendar, Sparkles } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { StatsCard } from '../admin/components/StatsCard';

import { API_BASE_URL as API } from '../../config/apiConfig';


export const StudentDashboard = () => {
  const { studentName, studentId, departmentName } = useUserStore();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API}/users/dashboard-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) setStats(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayName = studentName || user?.name || 'IIUC Student';
  const displayId = studentId || user?.studentId || 'C233093';
  const displayDept = departmentName || user?.department || 'Dept. of Computer Science & Engineering';
  const displayBatch = user?.batch || '58th';
  const displaySemester = user?.semester || '5th';
  const displaySection = user?.section || 'A';

  const formatCoverTypeLabel = (type) => {
    if (!type) return 'Assignment Cover';
    const map = {
      'ASSIGNMENT': 'Assignment Cover',
      'LAB_REPORT': 'Lab Report Cover',
      'LAB_INDEX': 'Lab Index Matrix',
      'PROJECT': 'Group Project Cover',
    };
    return map[type] || type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const totalCovers = stats?.totalCovers ?? 0;
  const monthlyCovers = stats?.monthlyCovers ?? 0;
  const favoriteTemplate = formatCoverTypeLabel(stats?.favoriteTemplate);
  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Student Academic Center Header */}
      <div className="bg-gradient-to-r from-[#1a1a50] via-[#006A4E] to-[#1a1a50] text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-black text-[#F3CF45]">
            <ShieldCheck className="h-4 w-4" />
            <span>IIUC Student Academic Center</span>
          </div>

          <h1 className="text-3xl font-display font-extrabold tracking-tight">
            Welcome back, {displayName}! 👋
          </h1>

          {/* Academic Info Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-slate-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-md">ID: {displayId}</span>
            <span>•</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md">{displayDept}</span>
            <span>•</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md">Batch {displayBatch}</span>
            <span>•</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md">{displaySemester} Sem ({displaySection})</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <Link
          to="/create"
          className="btn-iiuc-gold text-sm shadow-lg !py-3.5 !px-6 flex items-center gap-2 shrink-0 relative z-10"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Create New Cover</span>
        </Link>
      </div>

      {/* Academic Statistics Telemetry */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Covers Created" value={totalCovers} icon={FileText} color="emerald" sub="Cloud generated covers" />
        <StatsCard label="Monthly Usage" value={monthlyCovers} icon={Calendar} color="navy" sub="Generated this month" />
        <StatsCard label="Top Format" value={favoriteTemplate} icon={Award} color="amber" sub="Most used template" />
        <StatsCard label="Account Status" value="ACTIVE" icon={ShieldCheck} color="emerald" sub="Verified IIUC student" />
      </div>

      {/* Recommended Templates Carousel / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#006A4E]" />
            <h3 className="text-base font-extrabold text-slate-900">Recommended Document Templates</h3>
          </div>
          <Link to="/templates" className="text-xs font-bold text-[#006A4E] hover:underline">
            Browse All Templates →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Assignment Cover', type: 'assignment', desc: 'Standard IIUC individual assignment format', color: 'border-l-4 border-l-blue-500' },
            { title: 'Lab Report Cover', type: 'lab-report', desc: 'Lab experiment & lab report submission format', color: 'border-l-4 border-l-purple-500' },
            { title: 'Lab Index Matrix', type: 'lab-index', desc: 'Experiment table of contents index matrix', color: 'border-l-4 border-l-amber-500' },
            { title: 'Group Project Cover', type: 'project', desc: 'Multi-member capstone and group project cover', color: 'border-l-4 border-l-[#006A4E]' },
          ].map((item) => (
            <Link
              key={item.type}
              to={`/create?type=${item.type}`}
              className={`institutional-card p-5 space-y-3 ${item.color} hover:shadow-md transition-all group`}
            >
              <div className="text-sm font-extrabold text-slate-900 group-hover:text-[#006A4E] transition-colors">
                {item.title}
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              <div className="flex items-center text-xs font-bold text-[#006A4E] pt-1">
                <span>Start Building</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Timeline Section */}
      <div className="institutional-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#006A4E]" />
            <h3 className="text-base font-extrabold text-slate-900">Recent Activity Timeline</h3>
          </div>
          <Link to="/dashboard/history" className="text-xs font-bold text-[#006A4E] hover:underline">
            View Full History →
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentActivity.map((cov) => (
              <div key={cov._id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-block mb-0.5">
                    {formatCoverTypeLabel(cov.coverType)}
                  </span>
                  <p className="text-[11px] font-medium text-slate-500">
                    {cov.coverData?.courseCode || 'IIUC Course'} — {cov.coverData?.assignmentTitle || cov.coverData?.experimentName || 'Academic Cover'}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 font-mono">
                  {new Date(cov.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium text-slate-500">
              No recent cover generations logged in cloud. Start creating to save cover records!
            </p>
            <Link to="/create" className="btn-iiuc-primary text-xs !py-2 !px-4 inline-flex">
              Create Your First Cover
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
