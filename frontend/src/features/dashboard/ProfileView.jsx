import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ShieldCheck, Lock, CheckCircle2, GraduationCap, Save } from 'lucide-react';
import FormInput from '../../components/FormInput';
import { useUserStore } from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCoverStore } from '../../stores/useCoverStore';
import { API_BASE_URL } from '../../config/apiConfig';

export const ProfileView = () => {
  const { studentName, studentId, departmentName, setStudentProfile } = useUserStore();
  const { user, updateUser } = useAuthStore();
  const hydrateProfile = useCoverStore((state) => state.hydrateProfile);

  const profile = user?.academicProfile || user?.academicInfo || {};
  const [name, setName] = useState(profile.studentName || profile.name || studentName || user?.name || '');
  const [id, setId] = useState(profile.studentId || studentId || user?.studentId || '');
  const [dept, setDept] = useState(profile.department || departmentName || user?.department || 'CSE');
  const [batch, setBatch] = useState(profile.batch || user?.batch || '58th');
  const [semester, setSemester] = useState(profile.semester || user?.semester || '5th');
  const [section, setSection] = useState(profile.section || user?.section || 'A');
  const [isSaving, setIsSaving] = useState(false);

  const DEPARTMENT_OPTIONS = [
    'CSE',
    'EEE',
    'CE',
    'ETE',
    'ELL',
    'LAW',
    'Pharmacy',
    'BBA',
    'Finance and Banking',
    'Economics and Banking',
    'QSIS',
    'DIS',
    'SHIS',
    'ALL',
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !id.trim() || !dept.trim() || !batch.trim() || !semester.trim() || !section.trim()) {
      toast.error('Please fill in all required academic profile fields.');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            studentId: id.trim(),
            department: dept.trim(),
            batch: batch.trim(),
            semester: semester.trim(),
            section: section.trim(),
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to update academic profile.');
        }
      }

      setStudentProfile(name.trim(), id.trim(), dept.trim());
      updateUser({
        name: name.trim(),
        studentId: id.trim(),
        department: dept.trim(),
        batch: batch.trim(),
        semester: semester.trim(),
        section: section.trim(),
        academicProfile: {
          studentName: name.trim(),
          studentId: id.trim(),
          department: dept.trim(),
          batch: batch.trim(),
          semester: semester.trim(),
          section: section.trim(),
        },
      });

      hydrateProfile({
        name: name.trim(),
        studentName: name.trim(),
        studentId: id.trim(),
        department: dept.trim(),
        departmentName: dept.trim(),
        section: section.trim(),
        semester: semester.trim(),
      });

      toast.success('Academic Profile updated & saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Profile update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const avatarUrl = user?.avatar || 'https://lh3.googleusercontent.com/a/default-user';
  const email = user?.email || 'c233093@ugrad.iiuc.ac.bd';

  return (
    <div className="max-w-3xl space-y-6 animate-fadeInUp">
      {/* Page Title / Header Card */}
      <div className="institutional-card p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar Profile Photo */}
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={name}
            className="w-20 h-20 rounded-2xl border-2 border-[#006A4E] object-cover shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 p-1 bg-[#006A4E] text-white rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-[#006A4E] rounded-md text-[11px] font-bold border border-emerald-200/60">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#006A4E]" />
            <span>Google Academic Verified Account</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">{name || 'Student Profile'}</h2>
          <p className="text-xs font-semibold text-slate-500">{email}</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="institutional-card p-8">
        <form onSubmit={handleSave} className="space-y-6">

          {/* Read-Only Google Identity Fields */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Google Academic Identity (Read Only)
              </span>
              <span className="text-[10px] font-bold text-[#006A4E] bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified OAuth
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Academic Email</label>
                <input
                  type="text"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Authentication Provider</label>
                <input
                  type="text"
                  disabled
                  value="Google OAuth (IIUC Academic Domain)"
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Editable Academic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <GraduationCap className="h-4 w-4 text-[#006A4E]" />
              Academic Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Student Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ALI AZGOR"
              />

              <FormInput
                label="Student ID Matrix"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. C233093"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Department
              </label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/20 transition-all outline-none"
              >
                {DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. 58th"
              />
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/20 transition-all outline-none"
                >
                  {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <FormInput
                label="Section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full btn-iiuc-primary text-sm shadow-md !py-3.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving Academic Profile...' : 'Save Academic Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileView;
