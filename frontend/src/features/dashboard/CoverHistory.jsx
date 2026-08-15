import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, FileText, Trash2, Edit3, Copy, Eye, PlusCircle, Search, Calendar, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCoverStore } from '../../stores/useCoverStore';
import { AdminModal } from '../admin/components/AdminModal';
import { Pagination } from '../admin/components/Pagination';

import { API_BASE_URL as API } from '../../config/apiConfig';


export const CoverHistory = () => {
  const [covers, setCovers] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | '7DAYS' | '30DAYS'
  const [sortOrder, setSortOrder] = useState('NEWEST'); // 'NEWEST' | 'OLDEST'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [previewCover, setPreviewCover] = useState(null);

  const navigate = useNavigate();
  const { setActiveTab, setAssignmentData, setLabReportData, setLabIndexData, setProjectData } = useCoverStore();

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API}/covers/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const json = await response.json();
        const list = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.covers)
          ? json.covers
          : [];
        setCovers(list);
      }
    } catch {
      toast.error('Failed to fetch cover history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved cover?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/covers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Cover page removed from history.');
        setCovers((prev) => (Array.isArray(prev) ? prev.filter((c) => c._id !== id) : []));
        if (previewCover && previewCover._id === id) setPreviewCover(null);
      } else {
        toast.error('Could not delete cover.');
      }
    } catch {
      toast.error('Error deleting cover.');
    }
  };

  const handleEdit = (cover) => {
    const type = cover.coverType;
    const data = cover.coverData || {};

    if (type === 'ASSIGNMENT') {
      setActiveTab('assignment');
      if (setAssignmentData) setAssignmentData(data);
    } else if (type === 'LAB_REPORT') {
      setActiveTab('labReport');
      if (setLabReportData) setLabReportData(data);
    } else if (type === 'LAB_INDEX') {
      setActiveTab('labIndex');
      if (setLabIndexData) setLabIndexData(data);
    } else if (type === 'PROJECT') {
      setActiveTab('project');
      if (setProjectData) setProjectData(data);
    }

    toast.info(`Restored ${cover.coverType} into workspace.`);
    navigate('/create');
  };

  const handleDuplicate = (cover) => {
    handleEdit(cover);
    toast.success('Cover payload cloned into active workspace!');
  };

  // Filter & Search Logic
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const safeCovers = Array.isArray(covers) ? covers : [];
  const filteredCovers = safeCovers
    .filter((c) => {
      if (!c) return false;
      if (filterType !== 'ALL' && c.coverType !== filterType) return false;
      const covDate = new Date(c.createdAt || Date.now());
      if (dateFilter === '7DAYS' && covDate < sevenDaysAgo) return false;
      if (dateFilter === '30DAYS' && covDate < thirtyDaysAgo) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const code = (c.coverData?.courseCode || c.coverData?.code || '').toLowerCase();
        const title = (c.coverData?.courseTitle || c.coverData?.title || '').toLowerCase();
        const assignTitle = (c.coverData?.assignmentTitle || c.coverData?.experimentName || c.coverData?.projectTitle || '').toLowerCase();
        const teacher = (c.coverData?.teacherName || c.coverData?.assignedTeacher || '').toLowerCase();
        return code.includes(q) || title.includes(q) || assignTitle.includes(q) || teacher.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.createdAt || Date.now());
      const db = new Date(b.createdAt || Date.now());
      return sortOrder === 'NEWEST' ? db - da : da - db;
    });

  // Pagination
  const pageSize = 8;
  const totalPages = Math.ceil(filteredCovers.length / pageSize) || 1;
  const paginatedCovers = filteredCovers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="institutional-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#006A4E]/10 text-[#006A4E] rounded-xl">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Cloud Cover History</h2>
            <p className="text-xs font-semibold text-slate-500">
              Restore, duplicate, search, and manage your saved IIUC document covers
            </p>
          </div>
        </div>

        <Link to="/create" className="btn-iiuc-primary text-xs !py-2.5 !px-5 inline-flex gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Create New Cover</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-48 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by course code, title, or teacher…"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30"
            />
          </div>

          {/* Document Type Filter */}
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Document Types</option>
            <option value="ASSIGNMENT">Assignment</option>
            <option value="LAB_REPORT">Lab Report</option>
            <option value="LAB_INDEX">Lab Index</option>
            <option value="PROJECT">Project</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Time</option>
            <option value="7DAYS">Last 7 Days</option>
            <option value="30DAYS">Last 30 Days</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-bold text-slate-700 cursor-pointer"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
          </select>
        </div>
      </div>

      {/* History Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500 font-bold text-xs">
          Loading saved cover history...
        </div>
      ) : paginatedCovers.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedCovers.map((cov) => (
              <div key={cov._id} className="institutional-card p-5 space-y-4 flex flex-col justify-between hover:border-[#006A4E]/40 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {cov.coverType}
                      </span>
                      {cov.coverData?.hasAttachment && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1" title={cov.coverData?.attachment?.filename || 'Attached PDF'}>
                          📎 Complete PDF ({cov.coverData?.attachment?.pages ? `${cov.coverData.attachment.pages + 1} pgs` : 'Merged'})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 font-mono">
                      {new Date(cov.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {cov.coverData?.courseCode || 'IIUC Course'} — {cov.coverData?.courseTitle || 'Academic Cover'}
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-1">
                      {cov.coverData?.assignmentTitle || cov.coverData?.experimentName || cov.coverData?.projectTitle || 'Document Submission'}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">
                      Teacher: {cov.coverData?.teacherName || 'Faculty Member'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(cov)}
                      className="px-3 py-1.5 bg-[#006A4E] text-white rounded-lg text-xs font-extrabold flex items-center gap-1 hover:bg-[#00523d] transition-all cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Reopen & Edit</span>
                    </button>

                    <button
                      onClick={() => setPreviewCover(cov)}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
                      title="Quick Preview Specs"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(cov)}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
                      title="Duplicate Payload"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(cov._id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="institutional-card p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No matching cover history</h3>
            <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
              No saved cover documents matched your search query or filter selection.
            </p>
          </div>
          <Link to="/create" className="btn-iiuc-primary text-xs !py-2.5 !px-5 inline-flex gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create Your First Cover</span>
          </Link>
        </div>
      )}

      {/* Quick Preview Modal */}
      <AdminModal
        title={previewCover ? `Saved Cover: ${previewCover.coverType}` : 'Cover Preview'}
        isOpen={Boolean(previewCover)}
        onClose={() => setPreviewCover(null)}
        size="md"
      >
        {previewCover && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Document Type</span>
                <span className="font-bold text-[#006A4E]">{previewCover.coverType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Course Code & Title</span>
                <span className="font-bold text-slate-800">{previewCover.coverData?.courseCode || '—'} — {previewCover.coverData?.courseTitle || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Teacher</span>
                <span className="font-bold text-slate-800">{previewCover.coverData?.teacherName || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Created Date</span>
                <span className="font-bold text-slate-800">{new Date(previewCover.createdAt).toLocaleString('en-GB')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { const c = previewCover; setPreviewCover(null); handleEdit(c); }}
                className="flex-1 py-2 px-3 bg-[#006A4E] text-white text-xs font-bold rounded-lg hover:bg-[#005540] transition-all cursor-pointer"
              >
                Reopen & Edit in Workspace
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default CoverHistory;
