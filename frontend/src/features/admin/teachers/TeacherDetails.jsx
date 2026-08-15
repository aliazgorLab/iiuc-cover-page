import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Mail, BookOpen, FileText, CheckCircle, ExternalLink, Globe, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';


export const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/teachers/${id}`, { headers });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data || json);
    } catch {
      toast.error('Failed to load faculty intelligence profile.');
      navigate('/admin/teachers');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const teacher = data;
  const avatar = teacher.avatar || teacher.profileImage;
  const assignedCourses = teacher.assignedCourses || [];
  const coverUsage = teacher.coverUsage || {};
  const source = teacher.source || {};

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/admin/teachers"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#006A4E] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Teacher Directory
      </Link>

      {/* Profile Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {avatar ? (
            <img src={avatar} alt={teacher.name} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-emerald-50 shadow-md" />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#006A4E] to-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-md">
              {teacher.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900">{teacher.name}</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-[#006A4E] uppercase tracking-wider">
                {teacher.faculty || 'FSE'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                teacher.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>{teacher.status || 'ACTIVE'}</span>
            </div>
            <p className="text-xs text-slate-600 font-bold mt-1">{teacher.designation} · {teacher.department}</p>
            {teacher.email && (
              <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {teacher.email}
              </p>
            )}
          </div>
        </div>

        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm"
          >
            <Globe className="h-4 w-4 text-[#F3CF45]" />
            <span>IIUC Faculty Page</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>
        )}
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Academic Information Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="h-4 w-4 text-[#006A4E]" />
            <h3 className="text-sm font-black text-slate-900">Academic Information</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Designation</span>
              <span className="font-bold text-slate-900">{teacher.designation}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Department</span>
              <span className="font-bold text-slate-900">{teacher.department}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Faculty</span>
              <span className="font-mono font-bold text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded">{teacher.faculty || 'FSE'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Account Status</span>
              <span className="font-bold text-emerald-700">{teacher.status || 'ACTIVE'}</span>
            </div>
          </div>
        </div>

        {/* Contact & Profile Meta Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mail className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900">Contact & Profile Data</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Official Email</span>
              <span className="font-mono font-bold text-slate-900">{teacher.email || 'Not Specified'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Profile Avatar Image</span>
              <span className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]">{avatar || 'Default Fallback'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Assigned Courses</span>
              <span className="font-bold text-[#006A4E]">{assignedCourses.length} Courses</span>
            </div>
          </div>
        </div>

        {/* Imported Data Source Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900">Imported Source Data</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Data Source</span>
              <span className="font-bold text-slate-900">{source.source || 'IIUC Official Website'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Last Synchronized</span>
              <span className="font-mono text-slate-700">
                {source.importedAt ? new Date(source.importedAt).toLocaleString('en-GB') : 'N/A'}
              </span>
            </div>
            {source.url && (
              <div className="pt-1">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#006A4E] font-bold hover:underline flex items-center gap-1 truncate"
                >
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{source.url}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Cover Activity Telemetry Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-black text-slate-900">Cover Activity Telemetry</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Covers Generated</span>
              <span className="font-black text-purple-600 text-sm">{coverUsage.totalGenerated || 0} covers</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-medium text-slate-500">Last Cover Generated</span>
              <span className="font-mono text-slate-700">
                {coverUsage.lastGenerated ? new Date(coverUsage.lastGenerated).toLocaleDateString('en-GB') : 'No generation activity yet'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Assigned Courses Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <BookOpen className="h-4 w-4 text-[#006A4E]" />
          <h3 className="text-sm font-black text-slate-900">Assigned Courses ({assignedCourses.length})</h3>
        </div>

        {assignedCourses.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-6 text-center">No courses currently linked to this faculty member.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assignedCourses.map((c) => (
              <div key={c._id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-black text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {c.code || c.courseCode}
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">{c.title || c.courseTitle}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{c.semester || 'N/A'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDetails;
