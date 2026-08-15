import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Pencil, Trash2, User } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { AdminModal } from '../components/AdminModal';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';

const DEPARTMENTS = [
  'Dept. of Computer Science & Engineering',
  'Dept. of Electrical & Electronic Engineering',
  'Dept. of Business Administration',
  'Dept. of Civil Engineering',
  'Dept. of English',
  'Dept. of Law',
  'Dept. of Islamic Studies',
  'Dept. of Mathematics',
];
const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const BLANK_FORM = { courseCode: '', courseTitle: '', credit: 3, department: '', semester: '', assignedTeacher: '' };

export const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      const res = await fetch(`${API}/admin/courses?${params}`, { headers });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const rawCourses = json?.data?.courses || json?.courses || (Array.isArray(json) ? json : []);
      setCourses(rawCourses);
      setTotal(json?.data?.total || json?.total || rawCourses.length || 0);
      setTotalPages(json?.data?.totalPages || json?.totalPages || 1);
    } catch {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { setPage(1); }, [search]);

  // Fetch teacher list for assignedTeacher dropdown
  useEffect(() => {
    fetch(`${API}/admin/teachers?limit=100`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const list = json?.data?.teachers || json?.teachers || (Array.isArray(json) ? json : []);
        setTeachers(list);
      })
      .catch(() => {});
  }, []);

  const openCreate = () => { setForm(BLANK_FORM); setSelected(null); setModalMode('create'); };
  const openEdit = (c) => {
    setForm({
      courseCode: c.courseCode,
      courseTitle: c.courseTitle,
      credit: c.credit || 3,
      department: c.department || '',
      semester: c.semester || '',
      assignedTeacher: c.assignedTeacher || '',
    });
    setSelected(c);
    setModalMode('edit');
  };
  const openDelete = (c) => { setSelected(c); setModalMode('delete'); };
  const closeModal = () => { setModalMode(null); setSelected(null); };

  const handleSave = async () => {
    if (!form.courseCode.trim() || !form.courseTitle.trim()) {
      toast.error('Course code and title are required.'); return;
    }
    setSaving(true);
    try {
      const url = modalMode === 'edit' ? `${API}/admin/courses/${selected._id}` : `${API}/admin/courses`;
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success(modalMode === 'edit' ? 'Course updated.' : 'Course created.');
      closeModal();
      fetchCourses();
    } catch (e) {
      toast.error(e.message || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/courses/${selected._id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      toast.success('Course deleted.');
      closeModal();
      fetchCourses();
    } catch {
      toast.error('Failed to delete course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900">Course Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{total} academic courses</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E] text-white text-xs font-bold rounded-lg hover:bg-[#005540] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by course code or title…" className="max-w-sm" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Course Code</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Course Title</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Credit</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Departments</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Dept Count</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Semester</th>
                <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><div className="w-6 h-6 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-xs text-slate-400 font-medium">No courses found. Add your first course.</td></tr>
              ) : (
                courses.map((c) => {
                  const depts = c.departments && c.departments.length > 0 ? c.departments : [c.department || 'CSE'];
                  const deptCount = c.departmentCount || depts.length || 1;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-black text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{c.courseCode || c.code}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs font-bold text-slate-900">{c.courseTitle || c.title}</span></td>
                      <td className="px-4 py-3"><span className="text-xs font-mono font-bold text-slate-700">{c.credit || 3} Credit</span></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {depts.map((d, i) => (
                            <span key={i} className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {deptCount} {deptCount === 1 ? 'Department' : 'Departments'}
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs text-slate-500 font-medium">{c.semester || '—'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-[#006A4E] hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => openDelete(c)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AdminModal title={modalMode === 'edit' ? 'Edit Course' : 'Add Course'} isOpen={modalMode === 'create' || modalMode === 'edit'} onClose={closeModal}>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Course Code *</label>
            <input
              type="text"
              value={form.courseCode}
              onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
              placeholder="CSE3105"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Course Title *</label>
            <input
              type="text"
              value={form.courseTitle}
              onChange={(e) => setForm({ ...form, courseTitle: e.target.value })}
              placeholder="Data Structure"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Credit Hours</label>
            <input
              type="number"
              min={1}
              max={6}
              value={form.credit}
              onChange={(e) => setForm({ ...form, credit: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Department</label>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer">
              <option value="">Select department…</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Semester</label>
            <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer">
              <option value="">Select semester…</option>
              {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Assigned Teacher</label>
            <select value={form.assignedTeacher} onChange={(e) => setForm({ ...form, assignedTeacher: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer">
              <option value="">Select assigned teacher…</option>
              {teachers.map((t) => (
                <option key={t._id} value={t.name}>{t.name} ({t.designation})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={closeModal} className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2 px-4 bg-[#006A4E] text-white rounded-lg text-sm font-bold hover:bg-[#005540] transition-all cursor-pointer disabled:opacity-60">
              {saving ? 'Saving…' : modalMode === 'edit' ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirm */}
      <AdminModal title="Delete Course" isOpen={modalMode === 'delete'} onClose={closeModal} size="sm">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 font-medium">Delete <span className="font-black text-slate-900">{selected.courseCode} — {selected.courseTitle}</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all cursor-pointer disabled:opacity-60">
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default CourseManagement;
