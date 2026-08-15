import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, GraduationCap, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useUserStore } from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import FormInput from '../../components/FormInput';
import { API_BASE_URL } from '../../config/apiConfig';

export const CompleteProfileView = () => {
  const navigate = useNavigate();
  const { studentName, studentID, departmentName, setStudentProfile } = useUserStore();
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(studentName || user?.name || '');
  const [id, setId] = useState(studentID || user?.studentId || '');
  const [dept, setDept] = useState(departmentName || user?.department || 'CSE');

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
  const [batch, setBatch] = useState(user?.batch || '58th');
  const [semester, setSemester] = useState(user?.semester || '5th');
  const [section, setSection] = useState(user?.section || 'A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !id || !dept || !batch || !semester || !section) {
      toast.error('Please complete all academic profile fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            studentId: id,
            department: dept,
            batch,
            semester,
            section,
          }),
        }).catch(() => {});
      }

      // Update Zustand stores & localStorage
      setStudentProfile(name, id, dept);
      updateUser({
        name,
        studentId: id,
        department: dept,
        batch,
        semester,
        section,
      });

      toast.success('Academic profile setup completed! Cover generator fields will auto-fill.');
      setIsSubmitting(false);
      navigate('/create');
    } catch (error) {
      toast.error('Profile update failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeInUp">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#006A4E] to-[#1a1a50] text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-5 w-5 text-[#F3CF45]" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#F3CF45]">
              First Time Setup
            </span>
          </div>
          <h1 className="text-2xl font-black">Complete Academic Profile</h1>
          <p className="text-xs text-gray-200 mt-1">
            Set your batch, semester, and section for 1-click automatic cover generation.
          </p>
        </div>
      </div>

      {/* Profile Setup Form */}
      <div className="bento-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Student Name"
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
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
              Academic Department
            </label>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/20 transition-all outline-none"
            >
              {DEPARTMENT_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormInput
                label="Batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. 58th"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/20 transition-all outline-none"
              >
                {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
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
            disabled={isSubmitting}
            className="w-full py-4 bg-[#006A4E] text-white font-extrabold rounded-2xl hover:bg-[#00805d] shadow-lg shadow-[#006A4E]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="h-5 w-5 text-[#F3CF45]" />
            <span>{isSubmitting ? 'Saving Academic Profile...' : 'Save & Continue to Generator'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileView;
