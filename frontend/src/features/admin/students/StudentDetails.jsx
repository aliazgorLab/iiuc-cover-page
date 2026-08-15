import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, ShieldCheck, ShieldAlert, FileText, Calendar,
  GraduationCap, Mail, RefreshCw, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { AdminModal } from '../components/AdminModal';

import { API_BASE_URL as API } from '../../../config/apiConfig';


const STATUS_BADGE = {
  ACTIVE:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUSPENDED: 'bg-amber-50 text-amber-700 border-amber-200',
  BLOCKED:   'bg-red-50 text-red-700 border-red-200',
};

export const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/students/${id}`, { headers });
      if (!res.ok) throw new Error('Student not found');
      const json = await res.json();
      setStudent(json.data);
    } catch {
      toast.error('Failed to load student intelligence profile.');
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchStudent(); }, [fetchStudent]);

  const updateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/admin/students/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ accountStatus: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Account status updated to ${newStatus}`);
      fetchStudent();
    } catch {
      toast.error('Failed to update student status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="space-y-6">
      {/* Back button & Page title */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#006A4E] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students Directory
        </Link>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_BADGE[student.accountStatus] || STATUS_BADGE.ACTIVE}`}>
          ● Account Status: {student.accountStatus || 'ACTIVE'}
        </span>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {student.avatar ? (
            <img src={student.avatar} alt={student.name} className="h-16 w-16 rounded-full object-cover ring-4 ring-emerald-50" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#1a1a50] text-white flex items-center justify-center text-2xl font-black">
              {student.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{student.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase">
                {student.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              {student.email}
            </p>
            <p className="text-xs font-mono font-bold text-[#006A4E] mt-1">
              Student ID: {student.studentId || 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {student.accountStatus === 'ACTIVE' ? (
            <button
              onClick={() => updateStatus('SUSPENDED')}
              disabled={actionLoading}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer disabled:opacity-60"
            >
              <ShieldAlert className="h-4 w-4" />
              Suspend Account
            </button>
          ) : (
            <button
              onClick={() => updateStatus('ACTIVE')}
              disabled={actionLoading}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              Activate Account
            </button>
          )}
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Academic Profile Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="h-4 w-4 text-[#006A4E]" />
            <h3 className="text-sm font-black text-slate-900">Academic Parameters</h3>
          </div>
          <div className="space-y-3 text-xs">
            {[
              ['Department', student.department || 'Dept. of CSE'],
              ['Batch', student.batch || 'Not Specified'],
              ['Semester', student.semester || 'Not Specified'],
              ['Section', student.section || 'Not Specified'],
              ['Email Verified', student.emailVerified ? 'Yes' : 'No'],
              ['Joined Platform', new Date(student.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-slate-50 pb-2 last:border-0">
                <span className="font-semibold text-slate-500">{label}</span>
                <span className="font-bold text-slate-800">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity & Usage Stats */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-4 w-4 text-[#1a1a50]" />
            <h3 className="text-sm font-black text-slate-900">Document Usage Telemetry</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-2xl font-black text-slate-900">{student.coverCount || 0}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Covers Created</div>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <div className="text-sm font-bold text-[#006A4E] truncate">{student.mostUsedTemplate || 'None'}</div>
              <div className="text-[10px] font-bold text-[#006A4E]/80 uppercase mt-0.5">Top Format</div>
            </div>
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div className="text-xs font-bold text-[#1a1a50]">
                {new Date(student.updatedAt || student.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </div>
              <div className="text-[10px] font-bold text-[#1a1a50]/80 uppercase mt-0.5">Last Activity</div>
            </div>
          </div>

          {/* Recent Covers Table */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Cover Submissions</h4>
            {!student.recentCovers || student.recentCovers.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">No covers generated by this student yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {student.recentCovers.map((c) => (
                  <div key={c._id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{c.coverType}</span>
                      <p className="text-[10px] text-slate-400">{c.coverData?.courseCode || '—'} · {c.coverData?.courseTitle || '—'}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(c.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDetails;
