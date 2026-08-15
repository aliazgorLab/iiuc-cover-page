import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Pencil, Archive, CheckCircle, Trash2, Eye, Layout } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { AdminModal } from '../components/AdminModal';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';

const TYPES = ['ASSIGNMENT', 'LAB_REPORT', 'LAB_INDEX', 'PROJECT'];
const DEPARTMENTS = [
  'All Departments',
  'Dept. of Computer Science & Engineering',
  'Dept. of Electrical & Electronic Engineering',
  'Dept. of Business Administration',
  'Dept. of Civil Engineering',
  'Dept. of English',
];
const BLANK_FORM = { name: '', slug: '', type: '', description: '', department: 'All Departments', university: 'IIUC', status: 'ACTIVE', isDefault: false };

const STATUS_BADGE = {
  ACTIVE:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRAFT:    'bg-amber-50 text-amber-700 border-amber-200',
  ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const TYPE_BADGE = {
  ASSIGNMENT: 'bg-blue-50 text-blue-700 border-blue-100',
  LAB_REPORT: 'bg-purple-50 text-purple-700 border-purple-100',
  LAB_INDEX:  'bg-amber-50 text-amber-700 border-amber-100',
  PROJECT:    'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export const TemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'delete' | 'preview'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('type', filterType);
      const res = await fetch(`${API}/admin/templates?${params}`, { headers });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setTemplates(json.data.templates);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch {
      toast.error('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterType]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { setPage(1); }, [search, filterStatus, filterType]);

  const openCreate = () => { setForm(BLANK_FORM); setSelected(null); setModalMode('create'); };
  const openEdit = (t) => { setForm({ name: t.name, slug: t.slug, type: t.type, description: t.description || '', department: t.department || 'All Departments', university: t.university || 'IIUC', status: t.status, isDefault: t.isDefault }); setSelected(t); setModalMode('edit'); };
  const openPreview = (t) => { setSelected(t); setModalMode('preview'); };
  const openDelete = (t) => { setSelected(t); setModalMode('delete'); };
  const closeModal = () => { setModalMode(null); setSelected(null); };

  const quickStatusChange = async (t, newStatus) => {
    try {
      const res = await fetch(`${API}/admin/templates/${t._id}`, {
        method: 'PUT', headers, body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Template ${newStatus === 'ARCHIVED' ? 'archived' : 'activated'}.`);
      if (selected && selected._id === t._id) {
        setSelected({ ...selected, status: newStatus });
      }
      fetchTemplates();
    } catch { toast.error('Failed to update template status.'); }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.type) { toast.error('Name and type are required.'); return; }
    setSaving(true);
    try {
      const url = modalMode === 'edit' ? `${API}/admin/templates/${selected._id}` : `${API}/admin/templates`;
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const body = { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      toast.success(modalMode === 'edit' ? 'Template updated.' : 'Template created.');
      closeModal(); fetchTemplates();
    } catch (e) { toast.error(e.message || 'Failed to save template.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/templates/${selected._id}`, { method: 'DELETE', headers });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      toast.success('Template deleted.');
      closeModal(); fetchTemplates();
    } catch (e) { toast.error(e.message || 'Failed to delete template.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900">Template Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{total} document templates</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E] text-white text-xs font-bold rounded-lg hover:bg-[#005540] transition-all cursor-pointer">
          <Plus className="h-4 w-4" />Add Template
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search template name…" className="flex-1 min-w-48" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none cursor-pointer">
            <option value="">All Types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none cursor-pointer">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Template</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Default</th>
                <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><div className="w-6 h-6 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : templates.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-xs text-slate-400 font-medium">No templates found.</td></tr>
              ) : (
                templates.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium font-mono">{t.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_BADGE[t.type] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{t.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 font-medium">{t.department || 'All Departments'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[t.status] || STATUS_BADGE.ACTIVE}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {t.isDefault && <span className="text-[10px] font-bold text-[#006A4E] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Default</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openPreview(t)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer" title="View Preview"><Eye className="h-3.5 w-3.5" /></button>
                        <button onClick={() => openEdit(t)} className="p-1.5 text-[#006A4E] hover:bg-emerald-50 rounded-lg transition-all cursor-pointer" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                        {t.status === 'ACTIVE' ? (
                          <button onClick={() => quickStatusChange(t, 'ARCHIVED')} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer" title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                        ) : (
                          <button onClick={() => quickStatusChange(t, 'ACTIVE')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer" title="Activate"><CheckCircle className="h-3.5 w-3.5" /></button>
                        )}
                        {!t.isDefault && (
                          <button onClick={() => openDelete(t)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Template Preview Modal */}
      <AdminModal
        title={selected ? `Template Specification: ${selected.name}` : 'Template Preview'}
        isOpen={modalMode === 'preview'}
        onClose={closeModal}
        size="md"
      >
        {selected && (
          <div className="space-y-5">
            {/* Spec Box */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-[#006A4E]" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{selected.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{selected.slug}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_BADGE[selected.status] || STATUS_BADGE.ACTIVE}`}>
                  {selected.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Document Type</div>
                  <div className="font-bold text-slate-800">{selected.type}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Department</div>
                  <div className="font-bold text-slate-800">{selected.department || 'All Departments'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Institution</div>
                  <div className="font-bold text-slate-800">{selected.university || 'IIUC'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Default Template</div>
                  <div className="font-bold text-slate-800">{selected.isDefault ? 'Yes (System Standard)' : 'No'}</div>
                </div>
              </div>

              {selected.description && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Description</div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{selected.description}</p>
                </div>
              )}
            </div>

            {/* Actions inside modal */}
            <div className="flex gap-2">
              <button
                onClick={() => { closeModal(); openEdit(selected); }}
                className="flex-1 py-2 px-3 bg-[#006A4E] text-white text-xs font-bold rounded-lg hover:bg-[#005540] transition-all cursor-pointer"
              >
                Edit Specification
              </button>
              {selected.status === 'ACTIVE' ? (
                <button
                  onClick={() => quickStatusChange(selected, 'ARCHIVED')}
                  className="flex-1 py-2 px-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-100 transition-all cursor-pointer"
                >
                  Archive Template
                </button>
              ) : (
                <button
                  onClick={() => quickStatusChange(selected, 'ACTIVE')}
                  className="flex-1 py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  Activate Template
                </button>
              )}
            </div>
          </div>
        )}
      </AdminModal>

      {/* Create / Edit Modal */}
      <AdminModal title={modalMode === 'edit' ? 'Edit Template' : 'Create Template'} isOpen={modalMode === 'create' || modalMode === 'edit'} onClose={closeModal} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Template Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Official IIUC Assignment Cover" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]" />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer">
              <option value="">Select type…</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer">
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Department</label>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] cursor-pointer">
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">University</label>
            <input type="text" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]" />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this template…" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] resize-none" />
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button onClick={closeModal} className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2 px-4 bg-[#006A4E] text-white rounded-lg text-sm font-bold hover:bg-[#005540] transition-all cursor-pointer disabled:opacity-60">
              {saving ? 'Saving…' : modalMode === 'edit' ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirm */}
      <AdminModal title="Delete Template" isOpen={modalMode === 'delete'} onClose={closeModal} size="sm">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 font-medium">Delete <span className="font-black text-slate-900">{selected.name}</span>? This cannot be undone.</p>
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

export default TemplateManagement;
