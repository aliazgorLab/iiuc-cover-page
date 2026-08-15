import React, { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { AdminModal } from '../components/AdminModal';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';

const BLANK_FORM = { name: '', code: '', faculty: 'Faculty of Science & Engineering', status: 'ACTIVE' };

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/departments`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setDepartments(json.data || []);
    } catch {
      toast.error('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openCreate = () => { setForm(BLANK_FORM); setSelected(null); setModalMode('create'); };
  const openEdit = (d) => { setForm({ name: d.name, code: d.code, faculty: d.faculty || '', status: d.status || 'ACTIVE' }); setSelected(d); setModalMode('edit'); };
  const openDelete = (d) => { setSelected(d); setModalMode('delete'); };
  const closeModal = () => { setModalMode(null); setSelected(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Department name and code are required.'); return;
    }
    setSaving(true);
    try {
      const url = modalMode === 'edit' ? `${API}/departments/${selected._id}` : `${API}/departments`;
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success(modalMode === 'edit' ? 'Department updated.' : 'Department created.');
      closeModal();
      fetchDepartments();
    } catch (e) {
      toast.error(e.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/departments/${selected._id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      toast.success('Department deleted.');
      closeModal();
      fetchDepartments();
    } catch {
      toast.error('Failed to delete department.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = departments.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900">Department Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{departments.length} IIUC academic departments</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E] text-white text-xs font-bold rounded-lg hover:bg-[#005540] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search department name or code…" className="max-w-sm" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Code</th>
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Department Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Faculty</th>
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center"><div className="w-6 h-6 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-xs text-slate-400 font-medium">No departments found.</td></tr>
            ) : (
              filtered.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-black text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{d.code}</span>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs font-bold text-slate-900">{d.name}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-slate-500 font-medium">{d.faculty}</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      d.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(d)} className="p-1.5 text-[#006A4E] hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => openDelete(d)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      <AdminModal title={modalMode === 'edit' ? 'Edit Department' : 'Add Department'} isOpen={modalMode === 'create' || modalMode === 'edit'} onClose={closeModal}>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Department Code *</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CSE" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]" />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Department Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dept. of Computer Science & Engineering" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]" />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Faculty</label>
            <input type="text" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="Faculty of Science & Engineering" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]" />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none cursor-pointer">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={closeModal} className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2 px-4 bg-[#006A4E] text-white rounded-lg text-sm font-bold hover:bg-[#005540] transition-all cursor-pointer disabled:opacity-60">
              {saving ? 'Saving…' : modalMode === 'edit' ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirm */}
      <AdminModal title="Delete Department" isOpen={modalMode === 'delete'} onClose={closeModal} size="sm">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 font-medium">Delete <span className="font-black text-slate-900">{selected.name} ({selected.code})</span>? This cannot be undone.</p>
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

export default DepartmentManagement;
