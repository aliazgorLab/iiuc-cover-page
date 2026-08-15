import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Plus, Pencil, Trash2, Mail, Globe, RefreshCw, CheckCircle, Database, Download, Eye, Filter } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { AdminModal } from '../components/AdminModal';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';


const DEPARTMENTS = [
  { label: 'All Departments', value: 'ALL' },
  { label: 'CSE (Computer Science & Eng.)', value: 'Dept. of CSE, IIUC' },
  { label: 'CCE (Computer & Comm. Eng.)', value: 'Dept. of CCE, IIUC' },
  { label: 'EEE (Electrical & Electronic Eng.)', value: 'Dept. of EEE, IIUC' },
  { label: 'ETE (Electronics & Telecom. Eng.)', value: 'Dept. of ETE, IIUC' },
  { label: 'CE (Civil Engineering)', value: 'Dept. of CE, IIUC' },
  { label: 'BBA (Business Administration)', value: 'Dept. of Business Administration, IIUC' },
  { label: 'Finance (Finance and Banking)', value: 'Dept. of Finance and Banking, IIUC' },
  { label: 'LAW (Law)', value: 'Dept. of Law, IIUC' },
  { label: 'ELL (English Language & Lit.)', value: 'Dept. of ELL, IIUC' },
  { label: 'ALL (Arabic Language & Lit.)', value: 'Dept. of Arabic Language and Literature, IIUC' },
  { label: 'QSIS (Quranic Sciences & IS)', value: 'Dept. of QSIS, IIUC' },
  { label: 'DIS (Dawah and Islamic Studies)', value: 'Dept. of DIS, IIUC' },
  { label: 'SHIS (Hadith & Islamic Studies)', value: 'Dept. of SHIS, IIUC' },
  { label: 'EB (Economics and Banking)', value: 'Dept. of Economics and Banking, IIUC' },
];

const FACULTIES = [
  { label: 'All Faculties', value: 'ALL' },
  { label: 'FSE (Science & Engineering)', value: 'FSE' },
  { label: 'FBS (Business Studies)', value: 'FBS' },
  { label: 'FAE (Arts & Essential Studies)', value: 'FAE' },
  { label: 'FSIS (Shariah & Islamic Studies)', value: 'FSIS' },
  { label: 'FLAW (Faculty of Law)', value: 'FLAW' },
  { label: 'FSS (Social Sciences)', value: 'FSS' },
];

const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Senior Lecturer'];
const BLANK_FORM = { name: '', designation: '', department: '', faculty: 'FSE', email: '', profileImage: '', status: 'ACTIVE' };

export const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [faculty, setFaculty] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'delete' | 'report'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (department !== 'ALL') params.append('department', department);
      if (faculty !== 'ALL') params.append('faculty', faculty);
      if (status !== 'ALL') params.append('status', status);

      const res = await fetch(`${API}/admin/teachers?${params}`, { headers });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setTeachers(json?.data?.teachers || json?.teachers || (Array.isArray(json) ? json : []));
      setTotal(json?.data?.total ?? json?.total ?? 0);
      setTotalPages(json?.data?.totalPages ?? json?.pages ?? 1);
    } catch {
      toast.error('Failed to load teachers.');
    } finally {
      setLoading(false);
    }
  }, [page, search, department, faculty, status]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);
  useEffect(() => { setPage(1); }, [search, department, faculty, status]);

  const handleSyncIIUCFaculty = async () => {
    setSyncing(true);
    toast.info('Synchronizing IIUC official faculty database across 14 departments...');
    try {
      const res = await fetch(`${API}/admin/teachers/import-iiuc`, { method: 'POST', headers });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setImportReport(json);
      setModalMode('report');
      toast.success(`Sync complete: ${json.imported || 0} new, ${json.updated || 0} updated.`);
      fetchTeachers();
    } catch (err) {
      toast.error('Failed to sync faculty data from IIUC website.');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API}/admin/export/teachers`, { headers });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IIUC_Faculty_Teachers_Report_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Teacher CSV report exported successfully.');
    } catch (err) {
      toast.error('Failed to export CSV report.');
    } finally {
      setExporting(false);
    }
  };

  const openCreate = () => { setForm(BLANK_FORM); setSelected(null); setModalMode('create'); };
  const openEdit = (t) => {
    setForm({
      name: t.name,
      designation: t.designation,
      department: t.department,
      faculty: t.faculty || 'FSE',
      email: t.email || '',
      profileImage: t.profileImage || t.avatar || '',
      status: t.status || 'ACTIVE',
    });
    setSelected(t);
    setModalMode('edit');
  };
  const openDelete = (t) => { setSelected(t); setModalMode('delete'); };
  const closeModal = () => { setModalMode(null); setSelected(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.designation || !form.department) {
      toast.error('Name, designation, and department are required.');
      return;
    }
    setSaving(true);
    try {
      const url = modalMode === 'edit' ? `${API}/admin/teachers/${selected._id}` : `${API}/admin/teachers`;
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success(modalMode === 'edit' ? 'Teacher updated.' : 'Teacher created.');
      closeModal();
      fetchTeachers();
    } catch {
      toast.error('Failed to save teacher.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/teachers/${selected._id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      toast.success('Teacher deleted.');
      closeModal();
      fetchTeachers();
    } catch {
      toast.error('Failed to delete teacher.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900">Teacher Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{total} faculty members synchronized in intelligence database</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSyncIIUCFaculty}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
          >
            <Globe className={`h-3.5 w-3.5 text-[#F3CF45] ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing IIUC Data...' : 'Sync IIUC Faculty Data'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E] text-white text-xs font-bold rounded-xl hover:bg-[#005540] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" className="w-full" />
          
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] bg-white cursor-pointer"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          <select
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] bg-white cursor-pointer"
          >
            {FACULTIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] bg-white cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Avatar</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Faculty Member</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Faculty</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><div className="w-6 h-6 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-xs text-slate-400 font-medium">No faculty members match your filter criteria.</td></tr>
              ) : (
                teachers.map((t) => {
                  const avatar = t.avatar || t.profileImage;
                  return (
                    <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={t.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        ) : null}
                        <div
                          style={{ display: avatar ? 'none' : 'flex' }}
                          className="h-8 w-8 rounded-full bg-[#006A4E] text-white items-center justify-center text-[11px] font-black"
                        >
                          {t.name?.[0]?.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-slate-900 block">{t.name}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs text-slate-600 font-medium">{t.designation}</span></td>
                      <td className="px-4 py-3"><span className="text-xs text-slate-600 font-medium">{t.department}</span></td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#006A4E] uppercase tracking-wider">
                          {t.faculty || 'FSE'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600 font-mono">
                          {t.email ? (
                            <span className="inline-flex items-center gap-1 text-slate-700">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {t.email}
                            </span>
                          ) : (
                            <span className="text-slate-300">N/A</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          t.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>{t.status || 'ACTIVE'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/teachers/${t._id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Profile"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button onClick={() => openEdit(t)} className="p-1.5 text-[#006A4E] hover:bg-emerald-50 rounded-lg transition-all cursor-pointer" title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => openDelete(t)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
      <AdminModal
        title={modalMode === 'edit' ? 'Edit Teacher' : 'Add Teacher'}
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={closeModal}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. Mohammad Ali"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Academic Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="m.ali@iiuc.ac.bd"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Designation *</label>
            <select
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer"
            >
              <option value="">Select designation…</option>
              {form.designation && !DESIGNATIONS.includes(form.designation) && (
                <option value={form.designation}>{form.designation}</option>
              )}
              {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Department *</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer"
            >
              <option value="">Select department…</option>
              {form.department && !DEPARTMENTS.some((d) => d.value === form.department || d.label === form.department) && (
                <option value={form.department}>{form.department}</option>
              )}
              {DEPARTMENTS.filter((d) => d.value !== 'ALL').map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Faculty</label>
            <select
              value={form.faculty}
              onChange={(e) => setForm({ ...form, faculty: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer"
            >
              {FACULTIES.filter((f) => f.value !== 'ALL').map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Profile Image URL</label>
            <input
              type="text"
              value={form.profileImage}
              onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={closeModal} className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 px-4 bg-[#006A4E] text-white rounded-lg text-sm font-bold hover:bg-[#005540] transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Saving…' : modalMode === 'edit' ? 'Save Changes' : 'Create Teacher'}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirm Modal */}
      <AdminModal title="Delete Teacher" isOpen={modalMode === 'delete'} onClose={closeModal} size="sm">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 font-medium">
              Are you sure you want to delete <span className="font-black text-slate-900">{selected.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all cursor-pointer disabled:opacity-60">
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* IIUC Faculty Data Synchronization Report Modal */}
      <AdminModal title="IIUC Faculty Synchronization Report" isOpen={modalMode === 'report'} onClose={closeModal} size="lg">
        {importReport && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              <CheckCircle className="h-5 w-5 text-[#006A4E] flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#006A4E]">Sync Completed Successfully</h4>
                <p className="text-xs font-medium text-emerald-800 mt-0.5">
                  Official IIUC web scraping executed across 14 academic departments.
                </p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">New Imported</span>
                <span className="text-xl font-black text-emerald-600">{importReport.imported ?? 0}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Updated</span>
                <span className="text-xl font-black text-blue-600">{importReport.updated ?? 0}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Preserved</span>
                <span className="text-xl font-black text-slate-600">{importReport.skipped ?? 0}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Failed</span>
                <span className="text-xl font-black text-rose-600">{importReport.failed ?? 0}</span>
              </div>
            </div>

            {/* Department Breakdown */}
            {importReport.details && importReport.details.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">Departmental Breakdown</h5>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                  {importReport.details.map((d, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{d.department}</span>
                        <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase">({d.faculty})</span>
                      </div>
                      <span className="font-mono font-bold text-[#006A4E]">{d.count} teachers</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-[#006A4E] text-white text-xs font-bold rounded-xl hover:bg-[#005540] transition-all cursor-pointer shadow-sm"
              >
                Close Report
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default TeacherManagement;
