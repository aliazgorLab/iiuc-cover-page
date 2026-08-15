import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Edit3, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useStudentAcademicInfo } from '../hooks/useStudentAcademicInfo';

export const AcademicInfoToggle = ({ onSyncToForm }) => {
  const { isAuthenticated } = useAuthStore();
  const {
    studentName,
    studentId,
    department,
    section,
    semester,
    isSaved,
    useSavedInfo,
    setUseSavedInfo,
  } = useStudentAcademicInfo();

  if (!isAuthenticated) {
    return (
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[#006A4E]" />
          <span>Log in to auto-fill your academic details in 1-click across all cover pages.</span>
        </div>
        <Link to="/login" className="text-[11px] font-extrabold text-[#006A4E] hover:underline shrink-0">
          Log In →
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

      {useSavedInfo && isSaved ? (
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
      ) : !useSavedInfo ? (
        <p className="pl-6 text-[11px] text-slate-500 font-medium">
          Manual input mode active. Fields below can be customized without altering your saved profile.
        </p>
      ) : null}
    </div>
  );
};

export default AcademicInfoToggle;
