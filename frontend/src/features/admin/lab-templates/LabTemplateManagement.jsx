import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Pencil, Trash2, Search, FileText, CheckCircle, Download, Upload, List, Eye } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { AdminModal } from '../components/AdminModal';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';


const BLANK_FORM = {
  courseCode: '',
  courseTitle: '',
  department: 'CSE',
  experiments: [{ number: '01', title: '' }],
};

export const LabTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'delete' | 'json'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [jsonInput, setJsonInput] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [deptFilter, setDeptFilter] = useState('ALL');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);

      const res = await fetch(`${API}/admin/lab-experiments?${params}`, { headers });
      if (!res.ok) throw new Error();
      const json = await res.json();
      let list = json?.data?.templates || [];
      if (deptFilter !== 'ALL') {
        list = list.filter((t) => (t.department || 'CSE').toUpperCase() === deptFilter.toUpperCase());
      }
      setTemplates(list);
      setTotal(list.length);
      setTotalPages(json?.data?.totalPages || 1);
    } catch {
      toast.error('Failed to load lab experiment templates.');
    } finally {
      setLoading(false);
    }
  }, [page, search, deptFilter]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { setPage(1); }, [search, deptFilter]);

  const openCreate = () => {
    setForm({
      courseCode: '',
      courseTitle: '',
      department: 'CSE',
      experiments: [
        { number: '01', title: '' },
        { number: '02', title: '' },
        { number: '03', title: '' },
      ],
    });
    setSelected(null);
    setModalMode('create');
  };

  const openEdit = (t) => {
    setForm({
      courseCode: t.courseCode,
      courseTitle: t.courseTitle,
      department: t.department || 'CSE',
      experiments: t.experiments?.length > 0 ? t.experiments : [{ number: '01', title: '' }],
    });
    setSelected(t);
    setModalMode('edit');
  };

  const openDelete = (t) => {
    setSelected(t);
    setModalMode('delete');
  };

  const openJsonModal = (t = null) => {
    setSelected(t);
    if (t) {
      setJsonInput(JSON.stringify(t, null, 2));
    } else {
      setJsonInput(JSON.stringify(BLANK_FORM, null, 2));
    }
    setModalMode('json');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  const handleFormExpChange = (index, field, value) => {
    const nextExps = form.experiments.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    setForm({ ...form, experiments: nextExps });
  };

  const addExpRow = () => {
    const nextNum = String(form.experiments.length + 1).padStart(2, '0');
    setForm({
      ...form,
      experiments: [...form.experiments, { number: nextNum, title: '' }],
    });
  };

  const removeExpRow = (index) => {
    if (form.experiments.length <= 1) return;
    setForm({
      ...form,
      experiments: form.experiments.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!form.courseCode.trim() || !form.courseTitle.trim()) {
      toast.error('Course code and course title are required.');
      return;
    }

    setSaving(true);
    try {
      const url = modalMode === 'edit' ? `${API}/admin/lab-experiments/${selected._id}` : `${API}/admin/lab-experiments`;
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const cleanExps = form.experiments
        .filter((e) => e.title.trim())
        .map((e, idx) => ({
          number: e.number || String(idx + 1).padStart(2, '0'),
          title: e.title.trim(),
        }));

      const payload = {
        ...form,
        courseCode: form.courseCode.toUpperCase().trim(),
        experiments: cleanExps,
      };

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to save lab template');
      }

      toast.success(modalMode === 'edit' ? 'Lab template updated.' : 'Lab template created.');
      closeModal();
      fetchTemplates();
    } catch (err) {
      toast.error(err.message || 'Failed to save lab template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/lab-experiments/${selected._id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      toast.success('Lab template deleted.');
      closeModal();
      fetchTemplates();
    } catch {
      toast.error('Failed to delete lab template.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveJson = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        // Bulk Array JSON Import
        setSaving(true);
        let successCount = 0;
        for (const item of parsed) {
          if (item.courseCode && item.courseTitle) {
            const cleanExps = Array.isArray(item.experiments)
              ? item.experiments.map((e, idx) => ({
                  number: e.number || String(idx + 1).padStart(2, '0'),
                  title: e.title || '',
                }))
              : [];
            const payload = {
              courseCode: item.courseCode.toUpperCase().trim(),
              courseTitle: item.courseTitle.trim(),
              department: item.department || 'CSE',
              experiments: cleanExps,
            };
            const res = await fetch(`${API}/admin/lab-experiments`, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            });
            if (res.ok) successCount++;
          }
        }
        toast.success(`✓ Bulk imported ${successCount} lab template(s)!`);
        setSaving(false);
        closeModal();
        fetchTemplates();
        return;
      }

      if (!parsed.courseCode || !parsed.courseTitle) {
        toast.error('JSON must contain courseCode and courseTitle');
        return;
      }

      setForm(parsed);
      setModalMode(selected ? 'edit' : 'create');
      toast.info('JSON loaded into form editor. Click Save to confirm.');
    } catch (err) {
      toast.error('Invalid JSON format.');
    }
  };

  // Department Statistics breakdown
  const cseCount = templates.filter((t) => (t.department || '').toUpperCase() === 'CSE').length;
  const eeeCount = templates.filter((t) => (t.department || '').toUpperCase() === 'EEE').length;
  const phyCount = templates.filter((t) => (t.department || '').toUpperCase() === 'PHYSICS').length;
  const chemCount = templates.filter((t) => (t.department || '').toUpperCase() === 'CHEMISTRY').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900">Lab Experiment Templates</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage official IIUC lab course templates and experiment lists for student Lab Index generation
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openJsonModal(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="h-3.5 w-3.5 text-[#F3CF45]" />
            <span>Bulk JSON Import</span>
          </button>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E] text-white text-xs font-bold rounded-xl hover:bg-[#005540] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Lab Template
          </button>
        </div>
      </div>

      {/* Template Statistics Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#172554] to-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl text-[#F3CF45]">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-black text-[#F3CF45] uppercase tracking-wider block">Template Statistics</span>
            <span className="text-sm font-extrabold text-white">{total} Official Lab Course Templates</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
          <span className="px-2.5 py-1 bg-white/10 rounded-md">CSE: {cseCount}</span>
          <span className="px-2.5 py-1 bg-white/10 rounded-md">EEE: {eeeCount}</span>
          <span className="px-2.5 py-1 bg-white/10 rounded-md">Physics: {phyCount}</span>
          <span className="px-2.5 py-1 bg-white/10 rounded-md">Chemistry: {chemCount}</span>
        </div>
      </div>

      {/* Filter Control */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by course code, title, or department…" className="w-full sm:max-w-md" />
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Department:</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="PHYSICS">Physics</option>
            <option value="CHEMISTRY">Chemistry</option>
            <option value="BBA">BBA</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Course Code</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Course Title</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Total Experiments</th>
                <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400 font-medium">
                    No lab experiment templates found. Add your first lab course template.
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-black text-[#006A4E] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {t.courseCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-900">{t.courseTitle}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {t.department || 'CSE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <List className="h-3 w-3 text-[#006A4E]" />
                        {t.totalExperiments || t.experiments?.length || 0} Experiments
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewTemplate(t)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          title="Preview Template Experiments"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openJsonModal(t)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          title="Export JSON"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 text-[#006A4E] hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                          title="Edit Template"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDelete(t)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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

      {/* Create / Edit Template Modal */}
      <AdminModal
        title={modalMode === 'edit' ? `Edit Lab Template: ${form.courseCode}` : 'Create Lab Experiment Template'}
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={closeModal}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Course Code *</label>
              <input
                type="text"
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value.toUpperCase() })}
                placeholder="EEE-1122"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 font-mono font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Course Title *</label>
              <input
                type="text"
                value={form.courseTitle}
                onChange={(e) => setForm({ ...form, courseTitle: e.target.value })}
                placeholder="Electrical Circuit Lab"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Experiment List ({form.experiments.length})
              </label>
              <button
                type="button"
                onClick={addExpRow}
                className="text-xs font-bold text-[#006A4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Experiment
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
              {form.experiments.map((exp, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <input
                    type="text"
                    value={exp.number}
                    onChange={(e) => handleFormExpChange(idx, 'number', e.target.value)}
                    placeholder="01"
                    className="w-16 px-2 py-1 text-xs font-mono font-bold text-center border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#006A4E]"
                  />
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => handleFormExpChange(idx, 'title', e.target.value)}
                    placeholder="Verification of Ohm's Law"
                    className="flex-1 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#006A4E]"
                  />
                  {form.experiments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpRow(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={closeModal}
              className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 px-4 bg-[#006A4E] text-white rounded-xl text-xs font-bold hover:bg-[#005540] transition-all cursor-pointer disabled:opacity-60 shadow-sm"
            >
              {saving ? 'Saving…' : modalMode === 'edit' ? 'Update Lab Template' : 'Create Lab Template'}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* JSON Import/Export Modal */}
      <AdminModal title="Lab Template JSON Spec" isOpen={modalMode === 'json'} onClose={closeModal} size="lg">
        <div className="space-y-4">
          <p className="text-xs text-slate-600 font-medium">
            Paste or copy raw JSON template definitions below for rapid bulk creation:
          </p>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={12}
            className="w-full font-mono text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 bg-slate-900 text-emerald-400"
          />
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSaveJson} className="flex-1 py-2 px-4 bg-[#006A4E] text-white rounded-xl text-xs font-bold hover:bg-[#005540] transition-all cursor-pointer shadow-sm">
              Load JSON into Form Editor
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal title="Delete Lab Template" isOpen={modalMode === 'delete'} onClose={closeModal} size="sm">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 font-medium">
              Are you sure you want to delete the lab template for <span className="font-black text-slate-900">{selected.courseCode} — {selected.courseTitle}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2 px-4 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all cursor-pointer disabled:opacity-60 shadow-sm">
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
      <AdminModal
        title={previewTemplate ? `Template Preview: ${previewTemplate.courseCode}` : 'Template Preview'}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        size="md"
      >
        {previewTemplate && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <span className="font-mono text-xs font-black text-[#006A4E] block">
                {previewTemplate.courseCode} — {previewTemplate.courseTitle}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold block">
                Department: {previewTemplate.department} | Total Experiments: {previewTemplate.totalExperiments || previewTemplate.experiments?.length}
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-3 bg-white">
              {previewTemplate.experiments?.map((exp, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-slate-100 last:border-none">
                  <span className="font-mono font-bold text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    Exp {exp.number}
                  </span>
                  <span className="font-medium text-slate-800">{exp.title}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { const t = previewTemplate; setPreviewTemplate(null); openEdit(t); }}
                className="flex-1 py-2 px-3 bg-[#006A4E] text-white font-bold rounded-lg hover:bg-[#005540] transition-all cursor-pointer text-center"
              >
                Edit Template
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default LabTemplateManagement;
