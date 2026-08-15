import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShieldCheck, FileText, Sparkles, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { useCoverStore } from '../stores/useCoverStore';
import { useUserStore } from '../stores/useUserStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useStudentAcademicInfo } from '../hooks/useStudentAcademicInfo';
import AssignmentForm from '../features/cover-generator/assignment/AssignmentForm';
import AssignmentCover from '../features/cover-generator/assignment/AssignmentCover';
import AssignmentCoverV2 from '../features/cover-generator/assignment/AssignmentCoverV2';
import LabReportForm from '../features/cover-generator/lab-report/LabReportForm';
import LabReportCover from '../features/cover-generator/lab-report/LabReportCover';
import LabIndexForm from '../features/cover-generator/lab-index/LabIndexForm';
import LabIndexCover from '../features/cover-generator/lab-index/LabIndexCover';
import ProjectForm from '../features/cover-generator/project/ProjectForm';
import ProjectCover from '../components/covers/ProjectCover';
import DocumentSelector from '../components/create/DocumentSelector';
import PreviewPanel from '../components/create/PreviewPanel';
import StudentProfileCard from '../components/StudentProfileCard';
import { validateCoverForm } from '../utils/validators';
import { exportToPDF } from '../utils/pdfExporter';
import { exportToJPG } from '../utils/jpgExporter';
import { AdminModal } from '../features/admin/components/AdminModal';

import { API_BASE_URL as API } from '../config/apiConfig';


const Create = () => {
  const componentRef = useRef(null);
  const [searchParams] = useSearchParams();
  useStudentAcademicInfo();

  const {
    activeTab,
    setActiveTab,
    assignmentVersion,
    setAssignmentVersion,
    error,
    setError,
    autoSaved,
    setAutoSaved,
    hydrateProfile,
    getCurrentData,
    updateAssignmentField,
    updateLabReportField,
    updateLabIndexField,
    updateProjectField,
    assignmentData,
    labReportData,
    labIndexData,
    projectData,
    groupMembers,
    attachedPdf,
    setAttachedPdf,
    removeAttachedPdf,
  } = useCoverStore();

  const { studentName, studentId, departmentName, updateField } = useUserStore();
  const { isAuthenticated, isGuest } = useAuthStore();

  const [draftPrompt, setDraftPrompt] = useState(null);
  const [lastDraftSavedTime, setLastDraftSavedTime] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Handle URL query parameter auto-selection
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      const slugToTab = {
        'assignment': 'assignment',
        'lab-report': 'labReport',
        'lab-index': 'labIndex',
        'project': 'project',
      };
      if (slugToTab[typeParam]) {
        setActiveTab(slugToTab[typeParam]);
      }
    }
  }, [searchParams, setActiveTab]);

  // Check for unfinished drafts on mount
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/drafts`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data && json.data.length > 0) {
          setDraftPrompt(json.data[0]); // Pick latest draft
        }
      })
      .catch(() => {});
  }, []);

  // 30-Second Auto Save Draft Interval
  const currentData = getCurrentData();

  const autoSaveDraftToBackend = useCallback(async () => {
    if (!token) return;
    try {
      const mapType = {
        assignment: 'ASSIGNMENT',
        labReport: 'LAB_REPORT',
        labIndex: 'LAB_INDEX',
        project: 'PROJECT',
      };
      await fetch(`${API}/drafts/save`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          coverType: mapType[activeTab] || 'ASSIGNMENT',
          coverData: currentData,
        }),
      });
      setLastDraftSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2500);
    } catch {}
  }, [token, activeTab, currentData, setAutoSaved]);

  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveDraftToBackend();
    }, 30000); // 30 seconds auto-save
    return () => clearInterval(interval);
  }, [autoSaveDraftToBackend]);

  const handleRestoreDraft = () => {
    if (!draftPrompt) return;
    const { coverType, coverData } = draftPrompt;
    const typeToTab = {
      ASSIGNMENT: 'assignment',
      LAB_REPORT: 'labReport',
      LAB_INDEX: 'labIndex',
      PROJECT: 'project',
    };
    const tab = typeToTab[coverType] || 'assignment';
    setActiveTab(tab);

    if (coverData) {
      if (tab === 'assignment') {
        Object.entries(coverData).forEach(([k, v]) => updateAssignmentField(k, v));
      } else if (tab === 'labReport') {
        Object.entries(coverData).forEach(([k, v]) => updateLabReportField(k, v));
      } else if (tab === 'labIndex') {
        Object.entries(coverData).forEach(([k, v]) => updateLabIndexField(k, v));
      } else if (tab === 'project') {
        Object.entries(coverData).forEach(([k, v]) => updateProjectField(k, v));
      }
    }
    toast.success('Restored unfinished draft!');
    setDraftPrompt(null);
  };

  const handleDiscardDraft = async () => {
    if (!draftPrompt) return;
    try {
      await fetch(`${API}/drafts/${draftPrompt._id}`, { method: 'DELETE', headers });
      toast.info('Draft discarded.');
    } catch {}
    setDraftPrompt(null);
  };

  // Sync profile edits into user store (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    let name = assignmentData.studentName || labReportData.studentName || labIndexData.studentName || '';
    let id = assignmentData.studentId || labReportData.studentId || labIndexData.studentId || '';
    let dept = assignmentData.studentDept || labReportData.studentDept || projectData.departmentName || '';

    if (groupMembers && groupMembers.length > 0) {
      name = name || groupMembers[0].name || '';
      id = id || groupMembers[0].id || '';
    }

    if (name || id || dept) {
      updateField('studentName', name);
      updateField('studentId', id);
      updateField('departmentName', dept);
    }
  }, [
    isAuthenticated,
    assignmentData.studentName,
    assignmentData.studentId,
    assignmentData.studentDept,
    labReportData.studentName,
    labReportData.studentId,
    labReportData.studentDept,
    labIndexData.studentName,
    labIndexData.studentId,
    projectData.departmentName,
    groupMembers,
    updateField,
  ]);

  const getActiveLabel = () => {
    switch (activeTab) {
      case 'assignment': return 'Assignment Cover';
      case 'labReport': return 'Lab Report Cover';
      case 'labIndex': return 'Lab Index Matrix';
      case 'project': return 'Group Project Cover';
      default: return 'Cover Document';
    }
  };

  const [lastSavedHash, setLastSavedHash] = useState('');
  const [incompleteModal, setIncompleteModal] = useState(null); // { type: 'PDF' | 'JPG' | 'CLOUD', completed: 0, total: 0 }

  const getCoverHash = (tab, data, attach) => {
    try {
      const attachKey = attach ? `${attach.name}_${attach.size}_${attach.pages}` : 'none';
      return `${tab}_${JSON.stringify(data)}_${attachKey}`;
    } catch {
      return `${tab}_${Date.now()}`;
    }
  };

  const executeExport = async (exportType) => {
    const filePrefix =
      activeTab === 'assignment'
        ? 'Assignment'
        : activeTab === 'labReport'
        ? 'LabReport'
        : activeTab === 'project'
        ? 'ProjectReport'
        : 'LabIndex';

    const mapType = {
      assignment: 'ASSIGNMENT',
      labReport: 'LAB_REPORT',
      labIndex: 'LAB_INDEX',
      project: 'PROJECT',
    };

    const currentHash = getCoverHash(activeTab, currentData, attachedPdf);

    const payloadCoverData = {
      ...currentData,
      hasAttachment: Boolean(attachedPdf),
      attachment: attachedPdf
        ? {
            filename: attachedPdf.name,
            pages: attachedPdf.pages,
          }
        : null,
      exportType: exportType === 'PDF' && attachedPdf ? 'MERGED_PDF' : exportType,
    };

    // Auto Save to Cloud History for logged-in students before starting PDF/JPG download
    if (token && exportType !== 'CLOUD') {
      if (lastSavedHash !== currentHash) {
        try {
          toast.info('Saving cover to cloud history…', { autoClose: 1500 });
          const res = await fetch(`${API}/covers/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              coverType: mapType[activeTab] || 'ASSIGNMENT',
              coverData: payloadCoverData,
            }),
          });

          if (res.ok) {
            setLastSavedHash(currentHash);
            toast.success('✓ Cover saved to cloud history. Preparing download…', { autoClose: 2000 });
          } else {
            toast.warn('Unable to save history. Download will continue…', { autoClose: 2000 });
          }
        } catch {
          toast.warn('Unable to save history. Download will continue…', { autoClose: 2000 });
        }
      }
    } else if (token && exportType === 'CLOUD') {
      if (lastSavedHash === currentHash) {
        toast.info('Cover is already saved to cloud history.');
        return;
      }
      try {
        const res = await fetch(`${API}/covers/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            coverType: mapType[activeTab] || 'ASSIGNMENT',
            coverData: payloadCoverData,
          }),
        });

        if (res.ok) {
          setLastSavedHash(currentHash);
          toast.success('✓ Cover saved to cloud history successfully!');
        } else {
          toast.error('Could not save cover to cloud.');
        }
      } catch {
        toast.error('Error saving cover to cloud.');
      }
      return;
    }

    // Trigger PDF / JPG Download
    if (exportType === 'PDF') {
      exportToPDF(componentRef.current, filePrefix, currentData.studentId, attachedPdf);
    } else if (exportType === 'JPG') {
      exportToJPG(componentRef.current, filePrefix, currentData.studentId);
    }
  };

  const handleSaveCloud = async () => {
    const { isValid, message } = validateCoverForm(activeTab, currentData);
    if (!isValid) {
      setError(message);
      toast.error(message);
      return;
    }
    setError('');

    if (activeTab === 'labIndex') {
      const exps = currentData.experiments || [];
      const total = exps.length;
      const completed = exps.filter((e) => e.date && e.date.trim().length > 0).length;
      if (completed < total) {
        setIncompleteModal({ type: 'CLOUD', completed, total });
        return;
      }
    }

    executeExport('CLOUD');
  };

  const handlePDFDownload = () => {
    const { isValid, message } = validateCoverForm(activeTab, currentData);
    if (!isValid) {
      setError(message);
      toast.error(message);
      return;
    }
    setError('');

    if (activeTab === 'labIndex') {
      const exps = currentData.experiments || [];
      const total = exps.length;
      const completed = exps.filter((e) => e.date && e.date.trim().length > 0).length;
      if (completed < total) {
        setIncompleteModal({ type: 'PDF', completed, total });
        return;
      }
    }

    executeExport('PDF');
  };

  const handleJPGDownload = () => {
    const { isValid, message } = validateCoverForm(activeTab, currentData);
    if (!isValid) {
      setError(message);
      toast.error(message);
      return;
    }
    setError('');

    if (activeTab === 'labIndex') {
      const exps = currentData.experiments || [];
      const total = exps.length;
      const completed = exps.filter((e) => e.date && e.date.trim().length > 0).length;
      if (completed < total) {
        setIncompleteModal({ type: 'JPG', completed, total });
        return;
      }
    }

    executeExport('JPG');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 w-full overflow-x-hidden bg-slate-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Workspace Page Header */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#006A4E] uppercase tracking-wider mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>IIUC Academic Workspace</span>
                {lastDraftSavedTime && (
                  <span className="ml-2 text-[10px] text-slate-400 font-normal">
                    · Auto-saved at {lastDraftSavedTime}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Academic Document Workspace
              </h1>
            </div>

            <StudentProfileCard
              studentName={isAuthenticated ? studentName : ''}
              studentId={isAuthenticated ? studentId : ''}
              departmentName={isAuthenticated ? departmentName : ''}
              autoSaved={autoSaved}
              isGuest={!isAuthenticated || isGuest}
            />
          </div>

          {/* Format Selector Bar */}
          <DocumentSelector />
        </div>

        {/* 2-Column Professional Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Controls Workspace */}
          <div className="lg:col-span-6 space-y-6">
            {activeTab === 'assignment' && <AssignmentForm />}
            {activeTab === 'labReport' && <LabReportForm />}
            {activeTab === 'labIndex' && <LabIndexForm />}
            {activeTab === 'project' && <ProjectForm />}
          </div>

          {/* Right Column: Live A4 Document Preview Panel */}
          <div className="lg:col-span-6">
            {/* Assignment Template Version Switcher */}
            {activeTab === 'assignment' && (
              <div className="flex items-center justify-end gap-2 mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template:</span>
                <div className="flex items-center gap-1 bg-slate-100 rounded-full p-0.5">
                  <button
                    onClick={() => setAssignmentVersion('v1')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                      assignmentVersion === 'v1'
                        ? 'bg-white text-[#006A4E] shadow-sm border border-slate-200'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Classic V1
                  </button>
                  <button
                    onClick={() => setAssignmentVersion('v2')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                      assignmentVersion === 'v2'
                        ? 'bg-[#006A4E] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    Premium V2
                  </button>
                </div>
              </div>
            )}
            <PreviewPanel
              title="Live A4 Document Preview"
              badge={activeTab === 'assignment' && assignmentVersion === 'v2' ? 'Assignment Cover V2.0 ✦' : getActiveLabel()}
              error={error}
              onPDFDownload={handlePDFDownload}
              onJPGDownload={handleJPGDownload}
              onSaveCloud={handleSaveCloud}
              attachedPdf={attachedPdf}
              onAttachPdf={setAttachedPdf}
              onRemovePdf={removeAttachedPdf}
            >
              {activeTab === 'assignment' && assignmentVersion === 'v2' && <AssignmentCoverV2 data={currentData} />}
              {activeTab === 'assignment' && assignmentVersion !== 'v2' && <AssignmentCover data={currentData} />}
              {activeTab === 'labReport' && <LabReportCover data={currentData} />}
              {activeTab === 'labIndex' && <LabIndexCover data={currentData} />}
              {activeTab === 'project' && <ProjectCover {...currentData} />}
            </PreviewPanel>
          </div>
        </div>

      </div>

      {/* Restore Draft Prompt Modal */}
      <AdminModal
        title="Continue Unfinished Academic Cover?"
        isOpen={Boolean(draftPrompt)}
        onClose={handleDiscardDraft}
        size="md"
      >
        {draftPrompt && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#006A4E]" />
                <span className="text-xs font-black text-[#006A4E] uppercase">
                  Saved Draft: {draftPrompt.coverType}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Course: <span className="font-bold text-slate-800">{draftPrompt.coverData?.courseCode || 'Unspecified'} — {draftPrompt.coverData?.courseTitle || 'Untitled'}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Last edited: {new Date(draftPrompt.lastEdited || draftPrompt.updatedAt).toLocaleString('en-GB')}
              </p>
            </div>
            <p className="text-xs text-slate-500">Would you like to restore this draft or start a new cover?</p>
            <div className="flex gap-3">
              <button
                onClick={handleDiscardDraft}
                className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Discard & Start Fresh
              </button>
              <button
                onClick={handleRestoreDraft}
                className="flex-1 py-2 px-4 bg-[#006A4E] text-white rounded-lg text-xs font-bold hover:bg-[#005540] transition-all cursor-pointer"
              >
                Restore Draft
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Incomplete Lab Index Warning Modal */}
      <AdminModal
        title="⚠ Lab Index Incomplete"
        isOpen={Boolean(incompleteModal)}
        onClose={() => setIncompleteModal(null)}
        size="sm"
      >
        {incompleteModal && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-black uppercase">Partial Experiment Dates</span>
              </div>
              <p className="text-xs font-bold">
                You have completed {incompleteModal.completed} of {incompleteModal.total} experiments in this index.
              </p>
              <p className="text-[11px] font-medium text-amber-800">
                Generate or export Lab Index cover anyway?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIncompleteModal(null)}
                className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel & Fill Dates
              </button>
              <button
                onClick={() => {
                  const type = incompleteModal.type;
                  setIncompleteModal(null);
                  executeExport(type);
                }}
                className="flex-1 py-2 px-4 bg-[#006A4E] text-white rounded-xl text-xs font-bold hover:bg-[#005540] transition-all cursor-pointer shadow-sm"
              >
                Continue Generating
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Hidden Full-Scale Element for Off-Screen PDF/JPG Export */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={componentRef}>
          {activeTab === 'assignment' && assignmentVersion === 'v2' && <AssignmentCoverV2 data={currentData} />}
          {activeTab === 'assignment' && assignmentVersion !== 'v2' && <AssignmentCover data={currentData} />}
          {activeTab === 'labReport' && <LabReportCover data={currentData} />}
          {activeTab === 'labIndex' && <LabIndexCover data={currentData} />}
          {activeTab === 'project' && <ProjectCover {...currentData} />}
        </div>
      </div>
    </div>
  );
};

export default Create;
