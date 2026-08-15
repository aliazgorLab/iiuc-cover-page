import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, RefreshCw, Sparkles, CheckCircle2, FileText, BookOpen, Layers, Save, Check, Clock, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import FormInput from '../../../components/FormInput';
import CourseSelector from '../../../components/CourseSelector';
import AcademicInfoToggle from '../../../components/AcademicInfoToggle';
import { useCoverStore } from '../../../stores/useCoverStore';
import { importPreviousLabData, fetchOfficialLabTemplate } from '../../../services/labIndexService';
import { getLabIndex, saveLabIndex } from '../../../services/labIndexRecordService';
import { AdminModal } from '../../admin/components/AdminModal';

export const LabIndexForm = () => {
  const {
    labIndexData,
    updateLabIndex,
    updateExperiment,
    addExperiment,
    deleteExperiment,
    setExperiments,
    mergeExperiments,
  } = useCoverStore();

  const handleSyncProfileToForm = (info) => {
    if (info.studentName !== undefined) updateLabIndex('studentName', info.studentName);
    if (info.studentId !== undefined) updateLabIndex('studentId', info.studentId);
    if (info.section !== undefined) updateLabIndex('section', info.section);
    if (info.semester !== undefined) updateLabIndex('semester', info.semester);
  };

  const [isImporting, setIsImporting] = useState(false);
  const [importedItems, setImportedItems] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Official Template detection state
  const [officialTemplate, setOfficialTemplate] = useState(null);
  const [savedRecord, setSavedRecord] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const autoSaveTimerRef = useRef(null);

  // Check official lab template & saved student record whenever courseCode changes
  useEffect(() => {
    const code = labIndexData.courseCode?.trim();
    if (!code) {
      setOfficialTemplate(null);
      setSavedRecord(null);
      return;
    }

    let isMounted = true;

    // Fetch official template
    fetchOfficialLabTemplate(code)
      .then((tpl) => { if (isMounted) setOfficialTemplate(tpl); })
      .catch(() => { if (isMounted) setOfficialTemplate(null); });

    // Fetch student's saved lab index record
    getLabIndex(code)
      .then((rec) => { if (isMounted) setSavedRecord(rec); })
      .catch(() => { if (isMounted) setSavedRecord(null); });

    return () => { isMounted = false; };
  }, [labIndexData.courseCode]);

  // Debounced 2-Second Auto-Save Telemetry
  useEffect(() => {
    const code = labIndexData.courseCode?.trim();
    const token = localStorage.getItem('token');
    if (!code || !token || !labIndexData.experiments || labIndexData.experiments.length === 0) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const payload = {
          courseCode: labIndexData.courseCode,
          courseTitle: labIndexData.courseTitle || 'Lab Course',
          studentName: labIndexData.studentName || '',
          studentId: labIndexData.studentId || '',
          section: labIndexData.section || '',
          experiments: labIndexData.experiments,
          source: officialTemplate ? 'OFFICIAL_TEMPLATE' : 'SAVED_RECORD',
        };

        const res = await saveLabIndex(payload);
        if (res?.success) {
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 3000);
        }
      } catch (err) {
        setAutoSaveStatus('idle');
      }
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [labIndexData, officialTemplate]);

  // Actions
  const handleLoadOfficialTemplate = () => {
    if (!officialTemplate || !officialTemplate.experiments) return;
    const formatted = officialTemplate.experiments.map((exp, idx) => ({
      no: exp.number || String(idx + 1).padStart(2, '0'),
      date: exp.defaultDate || '',
      name: exp.title || exp.name || '',
    }));

    setExperiments(formatted);
    if (!labIndexData.courseTitle && officialTemplate.courseTitle) {
      updateLabIndex('courseTitle', officialTemplate.courseTitle);
    }
    toast.success(`✓ ${formatted.length} official lab experiments loaded for ${officialTemplate.courseCode}!`);
  };

  const handleLoadSavedRecord = () => {
    if (!savedRecord || !savedRecord.experiments) return;
    const formatted = savedRecord.experiments.map((exp, idx) => ({
      no: exp.number || String(idx + 1).padStart(2, '0'),
      date: exp.date || '',
      name: exp.title || exp.name || '',
    }));

    setExperiments(formatted);
    if (savedRecord.courseTitle) updateLabIndex('courseTitle', savedRecord.courseTitle);
    if (savedRecord.studentName) updateLabIndex('studentName', savedRecord.studentName);
    if (savedRecord.studentId) updateLabIndex('studentId', savedRecord.studentId);
    if (savedRecord.section) updateLabIndex('section', savedRecord.section);

    toast.success(`✓ Restored saved lab record for ${savedRecord.courseCode} (${savedRecord.completedExperiments}/${savedRecord.totalExperiments} completed)!`);
  };

  const handleFetchPreviousLabData = async () => {
    const courseCode = labIndexData.courseCode?.trim();
    if (!courseCode) {
      toast.warn('Please select or enter a Course Code (e.g. EEE-1122) first.');
      return;
    }

    setIsImporting(true);
    try {
      const items = await importPreviousLabData(courseCode);
      if (!items || items.length === 0) {
        toast.info(`No previous lab reports found for ${courseCode}. You can manually add experiments.`);
      } else {
        setImportedItems(items);
        setSelectedIndices(items.map((_, i) => i));
        setShowPreviewModal(true);
        toast.success(`Found ${items.length} previous lab experiment(s) for ${courseCode}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch previous lab reports.');
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSelectIndex = (idx) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleConfirmImport = () => {
    const selectedList = importedItems.filter((_, i) => selectedIndices.includes(i));
    if (selectedList.length === 0) {
      toast.warn('Please select at least one experiment to import.');
      return;
    }

    mergeExperiments(selectedList);
    toast.success(`Imported ${selectedList.length} lab experiment(s) into index!`);
    setShowPreviewModal(false);
  };

  // Date Validation Helper
  const getDateWarning = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid date format';
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (d > today) return 'Future date notice';
    return null;
  };

  // Progress Calculations
  const totalExperiments = labIndexData.experiments?.length || 0;
  const completedExperiments = labIndexData.experiments?.filter((e) => e.date && e.date.trim().length > 0).length || 0;
  const progressPercent = totalExperiments > 0 ? Math.round((completedExperiments / totalExperiments) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Course Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">📚</span>
          <h3 className="text-lg font-bold text-gray-900">Course Details</h3>
        </div>
        <CourseSelector
          courseCode={labIndexData.courseCode}
          courseTitle={labIndexData.courseTitle}
          onUpdateField={updateLabIndex}
        />
      </div>

      {/* Multi-Source Detection Cards: Previous Saved Record & Official Template */}
      {savedRecord && (
        <div className="bento-card p-6 bg-gradient-to-r from-blue-900 via-[#172554] to-indigo-950 text-white border-none shadow-xl relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-cyan-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
                <Clock className="h-3.5 w-3.5" />
                <span>Previous Saved Lab Record Found</span>
              </div>
              <h4 className="text-lg font-black tracking-tight text-white">
                {savedRecord.courseCode} — {savedRecord.courseTitle}
              </h4>
              <p className="text-xs text-slate-200 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>
                  {savedRecord.completedExperiments} / {savedRecord.totalExperiments} Experiments Completed • Last Updated:{' '}
                  {new Date(savedRecord.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadSavedRecord}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs shadow-lg py-3 px-5 rounded-xl flex items-center justify-center gap-2 shrink-0 font-extrabold cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Continue Editing Saved Record</span>
            </button>
          </div>
        </div>
      )}



      {/* Student Details */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <span className="text-2xl">🎓</span>
          <h3 className="text-lg font-bold text-gray-900">Student Details</h3>
        </div>

        <AcademicInfoToggle onSyncToForm={handleSyncProfileToForm} />
        <div className="space-y-4">
          <FormInput
            label="Student Name"
            value={labIndexData.studentName}
            onChange={(e) => updateLabIndex('studentName', e.target.value)}
            placeholder="Your Full Name"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="Student ID"
              value={labIndexData.studentId}
              onChange={(e) => updateLabIndex('studentId', e.target.value)}
              placeholder="C123456"
            />
            <FormInput
              label="Section"
              value={labIndexData.section}
              onChange={(e) => updateLabIndex('section', e.target.value)}
              placeholder="A"
            />
          </div>
        </div>
      </div>

      {/* Experiments List & Telemetry Section */}
      <div className="bento-card p-6 space-y-4">
        {/* Progress Telemetry & Auto Save Bar */}
        <div className="space-y-3 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Experiments List</h3>
                <p className="text-xs font-semibold text-slate-500">
                  {labIndexData.courseCode ? `${labIndexData.courseCode} Progress:` : 'Progress:'}{' '}
                  <span className="text-[#006A4E] font-black">{completedExperiments} / {totalExperiments} Experiments Dated</span> ({progressPercent}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto Save Indicator */}
              {autoSaveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  <RefreshCw className="h-3 w-3 animate-spin text-[#006A4E]" />
                  Auto-saving…
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="h-3.5 w-3.5 text-[#006A4E]" />
                  Saved automatically
                </span>
              )}

              {/* Official Template Load Button */}
              {officialTemplate && (
                <button
                  type="button"
                  onClick={handleLoadOfficialTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006A4E] text-white text-xs font-bold rounded-xl hover:bg-[#00523d] transition-all cursor-pointer shadow-xs"
                  title="Load official IIUC lab template experiments"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#F3CF45]" />
                  <span>Load Template ({officialTemplate.totalExperiments || officialTemplate.experiments?.length})</span>
                </button>
              )}

              {/* History Import Button */}
              <button
                type="button"
                onClick={handleFetchPreviousLabData}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-60"
                title="Import from previous cover history"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isImporting ? 'animate-spin' : ''}`} />
                <span>History Import</span>
              </button>
            </div>
          </div>

          {/* Visual Progress Bar */}
          {totalExperiments > 0 && (
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-[#006A4E] to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Experiment Rows */}
        <div className="space-y-4">
          {labIndexData.experiments.map((exp, index) => {
            const dateWarn = getDateWarning(exp.date);
            const isCompleted = exp.date && exp.date.trim().length > 0;

            return (
              <div key={index} className={`border rounded-2xl p-4 transition-all relative ${isCompleted ? 'bg-emerald-50/40 border-emerald-200/80' : 'bg-gray-50/80 border-gray-200'}`}>
                <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#006A4E] bg-white px-2.5 py-1 rounded-md border border-gray-200">
                      Exp {exp.no || String(index + 1).padStart(2, '0')}
                    </span>
                    
                    {/* Status Badge */}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-[#006A4E]" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  {labIndexData.experiments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteExperiment(index)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete experiment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <FormInput
                        label="Experiment Name"
                        value={exp.name}
                        onChange={(e) => updateExperiment(index, 'name', e.target.value)}
                        placeholder="Enter experiment title"
                        small
                      />
                    </div>
                    <div>
                      <FormInput
                        label="Date (DD-MM-YYYY)"
                        type="date"
                        value={exp.date}
                        onChange={(e) => updateExperiment(index, 'date', e.target.value)}
                        small
                      />
                      {dateWarn && (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {dateWarn}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addExperiment}
            className="w-full py-3 border-2 border-dashed border-[#006A4E] text-[#006A4E] rounded-xl hover:bg-[#006A4E]/5 transition-all flex items-center justify-center gap-2 font-semibold cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Add Experiment Row
          </button>
        </div>
      </div>

      {/* History Import Preview Modal */}
      <AdminModal
        title="Previous Lab Data Found"
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-center gap-3 text-xs text-emerald-900">
            <Sparkles className="h-5 w-5 text-[#006A4E] shrink-0" />
            <div>
              <span className="font-extrabold block">
                Course: {labIndexData.courseCode} — {labIndexData.courseTitle || 'Lab Course'}
              </span>
              <span className="text-[11px] font-medium text-emerald-700">
                Select the experiments you want to import into your editable Lab Index table:
              </span>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50">
            {importedItems.map((item, idx) => {
              const isSelected = selectedIndices.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleSelectIndex(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white border-[#006A4E] shadow-xs'
                      : 'bg-white/60 border-slate-200 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 accent-[#006A4E] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Experiment {item.number}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 font-semibold">
                        {item.date}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 mt-1 truncate">{item.name}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-[#006A4E] text-white rounded-xl text-xs font-bold hover:bg-[#00523d] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Import Selected ({selectedIndices.length})</span>
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default LabIndexForm;
