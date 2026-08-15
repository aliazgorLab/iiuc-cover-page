import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, FileText, Trash2, Edit3, PlusCircle, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCoverStore } from '../../stores/useCoverStore';
import { getAllUserLabIndexRecords, deleteLabIndex } from '../../services/labIndexRecordService';

export const StudentLabIndexHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { setActiveTab, setExperiments, updateLabIndex } = useCoverStore();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const list = await getAllUserLabIndexRecords();
      setRecords(list);
    } catch {
      toast.error('Failed to load saved lab index records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleDelete = async (id, courseCode) => {
    if (!window.confirm(`Are you sure you want to delete the saved Lab Index for ${courseCode}?`)) return;
    try {
      await deleteLabIndex(id);
      toast.success('Lab Index record deleted.');
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error('Could not delete lab index record.');
    }
  };

  const handleOpenEdit = (rec) => {
    setActiveTab('labIndex');
    if (rec.courseCode) updateLabIndex('courseCode', rec.courseCode);
    if (rec.courseTitle) updateLabIndex('courseTitle', rec.courseTitle);
    if (rec.studentName) updateLabIndex('studentName', rec.studentName);
    if (rec.studentId) updateLabIndex('studentId', rec.studentId);
    if (rec.section) updateLabIndex('section', rec.section);

    if (rec.experiments && rec.experiments.length > 0) {
      const formatted = rec.experiments.map((e, idx) => ({
        no: e.number || String(idx + 1).padStart(2, '0'),
        date: e.date || '',
        name: e.title || '',
      }));
      setExperiments(formatted);
    }

    toast.info(`Restored ${rec.courseCode} Lab Index into workspace.`);
    navigate('/create');
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="institutional-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#006A4E]/10 text-[#006A4E] rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">My Lab Index Records</h2>
            <p className="text-xs font-semibold text-slate-500">
              Manage, resume editing, and generate covers from your saved semester lab indexes
            </p>
          </div>
        </div>

        <Link to="/create" className="btn-iiuc-primary text-xs !py-2.5 !px-5 inline-flex gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Create New Lab Index</span>
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-bold text-xs">
          Loading saved lab index records...
        </div>
      ) : records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((rec) => {
            const completed = rec.completedExperiments || 0;
            const total = rec.totalExperiments || rec.experiments?.length || 0;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isComplete = completed === total && total > 0;

            return (
              <div key={rec._id} className="institutional-card p-5 space-y-4 flex flex-col justify-between hover:border-[#006A4E]/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#006A4E] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {rec.courseCode}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 font-mono">
                      {new Date(rec.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">{rec.courseTitle}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      Student: {rec.studentName || 'IIUC Student'} ({rec.studentId || 'C233093'})
                    </p>
                  </div>

                  {/* Progress Telemetry */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-600">Completion Progress</span>
                      <span className={isComplete ? 'text-[#006A4E]' : 'text-amber-600'}>
                        {completed} / {total} Experiments ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-[#006A4E] to-emerald-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEdit(rec)}
                    className="px-3.5 py-2 bg-[#006A4E] text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 hover:bg-[#00523d] transition-all cursor-pointer shadow-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Open & Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(rec._id, rec.courseCode)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="institutional-card p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No saved lab index records found</h3>
            <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
              Start creating your Lab Index covers to save experiment progress automatically.
            </p>
          </div>
          <Link to="/create" className="btn-iiuc-primary text-xs !py-2.5 !px-5 inline-flex gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create Your First Lab Index</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentLabIndexHistory;
