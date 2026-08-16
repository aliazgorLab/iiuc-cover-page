import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Edit3, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useStudentProfile } from '../hooks/useStudentProfile';

export const AcademicInfoToggle = ({ onSyncToForm }) => {
  const { isAuthenticated } = useAuthStore();
  const {
    studentName,
    studentId,
    department,
    section,
    semester,
    batch,
    isSaved,
    isLoading,
    useSavedInfo,
    setUseSavedInfo,
  } = useStudentProfile();

  if (isLoading) {
    return (
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2 animate-pulse">
        <Loader2 className="h-4 w-4 text-[#006A4E] animate-spin" />
        <span>Loading academic profile...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#006A4E]" />
          <span>Log in to auto-fill your academic details in 1-click across all cover pages.</span>
        </div>
        <Link to="/login" className="text-[11px] font-extrabold text-[#006A4E] hover:underline shrink-0">
          Log In →
        </Link>
      </div>
    );
  }

  if (!isSaved) {
    return (
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Complete your student profile to enable automatic cover filling</span>
        </div>
        <Link
          to="/dashboard/profile"
          className="text-[11px] font-extrabold text-[#006A4E] hover:underline shrink-0 bg-white px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs"
        >
          Complete Profile →
        </Link>
      </div>
    );
  }

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setUseSavedInfo(checked);
    if (checked && onSyncToForm) {
      onSyncToForm({
        studentName,
        studentId,
        department,
        section,
        semester,
        batch,
      });
    }
  };

  return (
    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useSavedAcademicInfoCheckbox"
            checked={useSavedInfo}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-[#006A4E] rounded focus:ring-2 focus:ring-[#006A4E]/30 cursor-pointer"
          />
          <label
            htmlFor="useSavedAcademicInfoCheckbox"
            className="text-xs font-extrabold text-slate-800 cursor-pointer select-none flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4 text-[#006A4E]" />
            <span>Use my saved academic information</span>
          </label>
        </div>

        <Link
          to="/dashboard/profile"
          className="text-[11px] font-bold text-[#006A4E] hover:underline flex items-center gap-1 shrink-0"
          title="Edit saved profile credentials"
        >
          <Edit3 className="h-3 w-3" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {useSavedInfo ? (
        <div className="pl-6 text-[11px] font-bold text-emerald-900 flex flex-wrap items-center gap-1.5">
          <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
            {studentName || 'Name'}
          </span>
          <span>•</span>
          <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
            {studentId || 'ID'}
          </span>
          <span>•</span>
          <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
            {department || 'Dept'}
          </span>
          {semester && (
            <>
              <span>•</span>
              <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                {semester} Sem
              </span>
            </>
          )}
          {section && (
            <>
              <span>•</span>
              <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                Sec: {section}
              </span>
            </>
          )}
        </div>
      ) : (
        <p className="pl-6 text-[11px] text-slate-500 font-medium">
          Manual input mode active. Fields below can be customized without altering your saved profile.
        </p>
      )}
    </div>
  );
};

export default AcademicInfoToggle;
