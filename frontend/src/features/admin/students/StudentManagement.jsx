import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, ShieldAlert, ShieldCheck, Download, CheckSquare, Square } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { AdminModal } from '../components/AdminModal';
import { toast } from 'react-toastify';

import { API_BASE_URL as API } from '../../../config/apiConfig';


const STATUS_BADGE = {
  ACTIVE:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUSPENDED: 'bg-amber-50 text-amber-700 border-amber-200',
  BLOCKED:   'bg-red-50 text-red-700 border-red-200',
};

const ROLE_BADGE = {
  STUDENT:     'bg-slate-100 text-slate-600',
  ADMIN:       'bg-indigo-100 text-indigo-700',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  MODERATOR:   'bg-sky-100 text-sky-700',
};

export const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (department) params.append('department', department);
      if (accountStatus) params.append('accountStatus', accountStatus);

      const res = await fetch(`${API}/admin/students?${params}`, { headers });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setStudents(json.data.users);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [page, search, department, accountStatus]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { setPage(1); setSelectedIds([]); }, [search, department, accountStatus]);

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(`${API}/admin/students/bulk-status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ids: selectedIds, accountStatus: status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Bulk updated ${selectedIds.length} student accounts to ${status}`);
      setSelectedIds([]);
      fetchStudents();
    } catch {
      toast.error('Failed to perform bulk status update.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API}/admin/export/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IIUC_Students_Report_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Downloaded Students CSV Report');
    } catch {
      toast.error('Failed to export CSV report.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900">Student Directory & Intelligence</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {total} registered IIUC academic accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#1a1a50] text-white rounded-xl p-3.5 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckSquare className="h-4 w-4 text-[#F3CF45]" />
            <span>{selectedIds.length} Students Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('ACTIVE')}
              className="px-3 py-1.5 bg-[#006A4E] hover:bg-[#005540] text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Activate Selected
            </button>
            <button
              onClick={() => handleBulkStatus('SUSPENDED')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Suspend Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, or Student ID…"
            className="flex-1 min-w-48"
          />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="BBA">BBA</option>
            <option value="Civil">Civil Engineering</option>
            <option value="English">English</option>
          </select>
          <select
            value={accountStatus}
            onChange={(e) => setAccountStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={students.length > 0 && selectedIds.length === students.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#006A4E] focus:ring-[#006A4E] cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Student ID</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-400 font-medium">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const isSelected = selectedIds.includes(s._id);
                  return (
                    <tr
                      key={s._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(s._id)}
                          className="rounded border-slate-300 text-[#006A4E] focus:ring-[#006A4E] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.avatar ? (
                            <img src={s.avatar} alt={s.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[#1a1a50] text-white flex items-center justify-center text-[11px] font-black">
                              {s.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-slate-900">{s.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-slate-700 font-mono">{s.studentId || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600 font-medium">{s.department || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[s.role] || 'bg-slate-100 text-slate-600'}`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.accountStatus] || STATUS_BADGE.ACTIVE}`}>
                          {s.accountStatus || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/admin/students/${s._id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#006A4E] bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Profile
                        </button>
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
    </div>
  );
};

export default StudentManagement;
