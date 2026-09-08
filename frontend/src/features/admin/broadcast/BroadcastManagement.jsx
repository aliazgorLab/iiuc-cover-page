import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Send, Sparkles, AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  Users, Building2, UserCheck, Eye, ShieldCheck, Clock, History, ExternalLink, Play
} from 'lucide-react';
import { toast } from 'react-toastify';
import { AdminModal } from '../components/AdminModal';
import { API_BASE_URL as API } from '../../../config/apiConfig';

const DEPARTMENTS = ['CSE', 'EEE', 'CCE', 'CIVIL', 'PHARMACY', 'LAW', 'ENGLISH', 'BBA'];

export const BroadcastManagement = () => {
  // Form State
  const [subject, setSubject] = useState('IIUC Academic Portal Upgrade: Optional Date of Experiment Feature Released');
  const [title, setTitle] = useState('Optional Date of Experiment for Lab Reports');
  const [badgeText, setBadgeText] = useState('PLATFORM FEATURE RELEASE — V2.1');
  const [announcementBody, setAnnouncementBody] = useState(
    `Dear IIUC Student,\n\nWe are pleased to announce an official platform feature update to the IIUC Academic Cover Page Generator.\n\nYou can now include an optional "Date of Experiment" on your Lab Report covers. When enabled, the date formats professionally directly above the Date of Submission. When disabled, it is cleanly omitted from your live preview, PDF exports, and JPG downloads.\n\nSign in to your student account to explore the upgraded workspace.`
  );
  const [ctaUrl, setCtaUrl] = useState('https://iiuccoverpage.vercel.app');
  const [ctaText, setCtaText] = useState('Explore New Feature');

  // Target Audience State
  const [targetType, setTargetType] = useState('ALL'); // 'ALL' | 'DEPARTMENT' | 'SELECTIVE'
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [recipientCount, setRecipientCount] = useState(0);
  const [isCalculatingCount, setIsCalculatingCount] = useState(false);

  // Selective Student List Picker State
  const [studentList, setStudentList] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Tab & Preview State
  const [activeTab, setActiveTab] = useState('PREVIEW'); // 'PREVIEW' | 'HISTORY'

  // Modals & Progress
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(null); // { broadcastId, total, current, success, failed }
  const [deliveryReport, setDeliveryReport] = useState(null);

  // Broadcast History Logs
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Fetch student list for selective picker
  const fetchStudentList = useCallback(async () => {
    if (!token) return;
    setIsLoadingStudents(true);
    try {
      const res = await fetch(`${API}/admin/students?limit=100&search=${encodeURIComponent(studentSearch)}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setStudentList(json.data?.students || []);
      }
    } catch {
      toast.error('Could not load student list for selection.');
    } finally {
      setIsLoadingStudents(false);
    }
  }, [token, studentSearch]);

  useEffect(() => {
    if (targetType === 'SELECTIVE') {
      fetchStudentList();
    }
  }, [targetType, fetchStudentList]);

  // Fetch Recipient Count from Backend (Source of Truth)
  const calculateRecipientCount = useCallback(async () => {
    if (!token) return;
    setIsCalculatingCount(true);
    try {
      const res = await fetch(`${API}/admin/announcement/count`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          targetType,
          department: selectedDept,
          selectedUserIds,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setRecipientCount(json.data?.recipientCount || 0);
      }
    } catch {
      console.warn('Failed to calculate recipient count');
    } finally {
      setIsCalculatingCount(false);
    }
  }, [token, targetType, selectedDept, selectedUserIds]);

  useEffect(() => {
    calculateRecipientCount();
  }, [calculateRecipientCount]);

  // Fetch Broadcast History Logs
  const fetchBroadcastLogs = useCallback(async () => {
    if (!token) return;
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`${API}/admin/announcement/history`, { headers });
      if (res.ok) {
        const json = await res.json();
        setBroadcastLogs(json.data || []);
      }
    } catch {
      toast.error('Could not load broadcast history.');
    } finally {
      setIsLoadingLogs(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchBroadcastLogs();
    }
  }, [activeTab, fetchBroadcastLogs]);

  // Toggle student selection for selective list
  const toggleStudentSelection = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.trim()) {
      toast.error('Please enter a valid test recipient email address.');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch(`${API}/admin/announcement/test-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          subject,
          title,
          badgeText,
          announcementBody,
          ctaUrl,
          ctaText,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`✓ Test email sent successfully to ${testEmail}`);
        setIsTestModalOpen(false);
      } else {
        toast.error(json.message || 'Failed to send test email.');
      }
    } catch {
      toast.error('Network error sending test email.');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Handle Execute Real Broadcast
  const handleExecuteBroadcast = async () => {
    setIsConfirmModalOpen(false);
    setIsSendingBroadcast(true);

    const safeBroadcastId = `bcast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setSendingProgress({
      broadcastId: safeBroadcastId,
      total: recipientCount,
      current: 0,
      success: 0,
      failed: 0,
    });

    try {
      const res = await fetch(`${API}/admin/announcement/send-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          broadcastId: safeBroadcastId,
          targetType,
          department: selectedDept,
          selectedUserIds,
          subject,
          title,
          badgeText,
          announcementBody,
          ctaUrl,
          ctaText,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const report = json.data;
        setDeliveryReport(report);
        toast.success(`✓ Broadcast complete: ${report.successful} sent successfully!`);
        fetchBroadcastLogs();
      } else {
        toast.error(json.message || 'Broadcast failed.');
      }
    } catch (err) {
      toast.error(`Broadcast execution error: ${err.message}`);
    } finally {
      setIsSendingBroadcast(false);
      setSendingProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#006A4E] text-xs font-black rounded-full border border-emerald-200 mb-2">
            <Mail className="h-3.5 w-3.5" />
            <span>INSTITUTIONAL EMAIL BROADCAST SUITE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            System Update & Announcement Broadcast
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Broadcast branded academic announcements & system feature updates to IIUC students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-slate-200 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-slate-500" />
            <span>Send Test Email</span>
          </button>
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={recipientCount === 0 || isSendingBroadcast}
            className="px-5 py-2 bg-[#006A4E] hover:bg-[#00523d] disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span>Broadcast Announcement ({recipientCount})</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form & Target Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Target Audience Bento Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#006A4E]" />
                <h3 className="font-extrabold text-slate-900 text-sm">1. Target Audience Selection</h3>
              </div>
              <span className="text-xs font-black px-2.5 py-1 bg-emerald-50 text-[#006A4E] rounded-full border border-emerald-200">
                {isCalculatingCount ? 'Calculating...' : `${recipientCount} Active Recipients`}
              </span>
            </div>

            {/* Target Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Option: ALL */}
              <label
                onClick={() => setTargetType('ALL')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  targetType === 'ALL'
                    ? 'border-[#006A4E] bg-emerald-50/50 text-[#006A4E] shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <UserCheck className="h-5 w-5 text-[#006A4E]" />
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'ALL'}
                    onChange={() => setTargetType('ALL')}
                    className="accent-[#006A4E]"
                  />
                </div>
                <div className="mt-3">
                  <h4 className="font-extrabold text-xs">All Students</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Broadcast to all active accounts</p>
                </div>
              </label>

              {/* Option: DEPARTMENT */}
              <label
                onClick={() => setTargetType('DEPARTMENT')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  targetType === 'DEPARTMENT'
                    ? 'border-[#006A4E] bg-emerald-50/50 text-[#006A4E] shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className="h-5 w-5 text-[#006A4E]" />
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'DEPARTMENT'}
                    onChange={() => setTargetType('DEPARTMENT')}
                    className="accent-[#006A4E]"
                  />
                </div>
                <div className="mt-3">
                  <h4 className="font-extrabold text-xs">By Department</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Target specific engineering dept</p>
                </div>
              </label>

              {/* Option: SELECTIVE */}
              <label
                onClick={() => setTargetType('SELECTIVE')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  targetType === 'SELECTIVE'
                    ? 'border-[#006A4E] bg-emerald-50/50 text-[#006A4E] shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <UserCheck className="h-5 w-5 text-[#006A4E]" />
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'SELECTIVE'}
                    onChange={() => setTargetType('SELECTIVE')}
                    className="accent-[#006A4E]"
                  />
                </div>
                <div className="mt-3">
                  <h4 className="font-extrabold text-xs">Selective List</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Choose specific students</p>
                </div>
              </label>

            </div>

            {/* Department Dropdown Selector */}
            {targetType === 'DEPARTMENT' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fadeIn">
                <label className="text-xs font-bold text-slate-700">Select Target Department:</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#006A4E]"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      Dept. of {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selective Student Picker */}
            {targetType === 'SELECTIVE' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Select Target Students ({selectedUserIds.length} selected):</label>
                  <button
                    onClick={() => setSelectedUserIds([])}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search students by name, ID, or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#006A4E]"
                />

                <div className="max-h-48 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded-lg p-2">
                  {isLoadingStudents ? (
                    <p className="text-xs text-slate-400 p-2 text-center">Loading students...</p>
                  ) : studentList.length === 0 ? (
                    <p className="text-xs text-slate-400 p-2 text-center">No students found.</p>
                  ) : (
                    studentList.map((st) => (
                      <label
                        key={st._id}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md text-xs cursor-pointer border-b border-slate-100 last:border-none"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(st._id)}
                            onChange={() => toggleStudentSelection(st._id)}
                            className="accent-[#006A4E] rounded"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="text-[10px] text-slate-500">{st.email} · ID: {st.studentId || 'N/A'}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {st.department || 'CSE'}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Announcement Form Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#006A4E]" />
                <h3 className="font-extrabold text-slate-900 text-sm">2. Announcement Content</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">Sanitized & Safe HTML</span>
            </div>

            {/* Email Subject Line */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <label>Email Subject Line *</label>
                <span className="text-[10px] text-slate-400">{subject.length}/150</span>
              </div>
              <input
                type="text"
                maxLength={150}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., IIUC Platform Update: Optional Date of Experiment Feature"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#006A4E]"
              />
            </div>

            {/* Title & Badge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label>Announcement Title *</label>
                  <span className="text-[10px] text-slate-400">{title.length}/150</span>
                </div>
                <input
                  type="text"
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title inside email banner"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#006A4E]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <label>Header Badge Text</label>
                  <span className="text-[10px] text-slate-400">{badgeText.length}/60</span>
                </div>
                <input
                  type="text"
                  maxLength={60}
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g., PLATFORM FEATURE RELEASE"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#006A4E]"
                />
              </div>
            </div>

            {/* Announcement Message Body */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <label>Announcement Message Body *</label>
                <span className="text-[10px] text-slate-400">{announcementBody.length}/5000</span>
              </div>
              <textarea
                rows={7}
                maxLength={5000}
                value={announcementBody}
                onChange={(e) => setAnnouncementBody(e.target.value)}
                placeholder="Write message content here..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#006A4E]"
              />
            </div>

            {/* CTA Button Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Call-to-Action URL</label>
                <input
                  type="url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://iiuccoverpage.vercel.app"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006A4E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Button Label</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Explore New Feature"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#006A4E]"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Live Preview & Broadcast History Tabs */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Tab Header */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1">
              <button
                onClick={() => setActiveTab('PREVIEW')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'PREVIEW'
                    ? 'bg-white text-[#006A4E] shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>Live Email Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'HISTORY'
                    ? 'bg-white text-[#006A4E] shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Broadcast Logs</span>
              </button>
            </div>

            {/* TAB 1: Live Email HTML Preview */}
            {activeTab === 'PREVIEW' && (
              <div className="p-6 space-y-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Actual Email HTML Output</span>
                  <span className="text-emerald-700 font-mono">IIUC Branded (#006A4E)</span>
                </div>

                {/* Email Mock Container */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-slate-50 font-sans">
                  
                  {/* Top Email Header */}
                  <div className="bg-[#006A4E] p-6 text-center text-white">
                    <div className="inline-block bg-white/15 border border-white/25 px-3 py-0.5 rounded-full text-[10px] font-extrabold text-emerald-100 uppercase tracking-widest mb-2">
                      {badgeText || 'IIUC ANNOUNCEMENT'}
                    </div>
                    <h2 className="text-lg font-black text-white leading-tight">
                      {title || 'Announcement Title'}
                    </h2>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 bg-white space-y-4 text-xs text-slate-700 leading-relaxed">
                    <div className="p-4 bg-slate-50 border-l-4 border-[#006A4E] rounded-md font-sans whitespace-pre-wrap">
                      {announcementBody || 'Announcement text preview will appear here...'}
                    </div>

                    {ctaUrl && (
                      <div className="text-center pt-3 pb-1">
                        <span className="inline-block px-5 py-2.5 bg-[#006A4E] text-white text-xs font-bold rounded-xl shadow-xs">
                          {ctaText || 'Explore Upgrade'} &rarr;
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-700">International Islamic University Chittagong (IIUC)</p>
                    <p>Academic Document Workspace & Student Portal</p>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: Broadcast History Logs */}
            {activeTab === 'HISTORY' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">Recent Broadcast Records</span>
                  <button
                    onClick={fetchBroadcastLogs}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isLoadingLogs ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Loading logs...</p>
                ) : broadcastLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No broadcast history recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {broadcastLogs.map((log) => (
                      <div key={log._id || log.broadcastId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="truncate max-w-[200px]">{log.title}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            log.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Target: <strong className="text-slate-700">{log.targetType} {log.department ? `(${log.department})` : ''}</strong></span>
                          <span>{new Date(log.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-200/60">
                          <span>Recipients: {log.recipientCount}</span>
                          <span className="text-emerald-700">✓ {log.successCount}</span>
                          {log.failedCount > 0 && <span className="text-red-600">✕ {log.failedCount}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* MODAL 1: Send Test Email */}
      <AdminModal
        title="Send Test Email Announcement"
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Send the exact configured HTML email announcement to a test address before broadcasting.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Test Recipient Email Address *</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="e.g., admin@iiuc.ac.bd"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#006A4E]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setIsTestModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="px-5 py-2 bg-[#006A4E] text-white text-xs font-bold rounded-xl hover:bg-[#00523d] transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSendingTest ? 'Sending Test Email...' : 'Send Test Now'}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* MODAL 2: Broadcast Confirmation Dialog */}
      <AdminModal
        title="Review & Confirm Bulk Email Broadcast"
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          {targetType === 'ALL' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Broadcasting to ALL Registered Students</span>
              </div>
              <p className="text-xs font-medium">
                This announcement will be delivered to <strong>{recipientCount} active IIUC student accounts</strong>.
              </p>
            </div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Subject:</span>
              <span className="font-bold text-slate-900 truncate max-w-[280px]">{subject}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Target Audience:</span>
              <span className="font-bold text-[#006A4E]">{targetType} {selectedDept ? `(${selectedDept})` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Recipients:</span>
              <span className="font-extrabold text-slate-900">{recipientCount} Active Students</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Controlled batch sending (25/batch with rate-limiting) will begin. Confirm broadcast?
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteBroadcast}
              className="px-5 py-2 bg-[#006A4E] hover:bg-[#00523d] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              Confirm & Send Broadcast
            </button>
          </div>
        </div>
      </AdminModal>

      {/* MODAL 3: Live Broadcast Progress / Delivery Report */}
      <AdminModal
        title={isSendingBroadcast ? 'Broadcasting Announcement...' : 'Broadcast Delivery Summary'}
        isOpen={Boolean(isSendingBroadcast || deliveryReport)}
        onClose={() => {
          if (!isSendingBroadcast) setDeliveryReport(null);
        }}
        size="md"
      >
        <div className="space-y-4">
          {isSendingBroadcast && (
            <div className="space-y-3 py-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Sending in Controlled Batches (25/sec)...</span>
                <span className="text-[#006A4E]">Active</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div className="bg-[#006A4E] h-full rounded-full transition-all duration-300 animate-pulse w-full" />
              </div>
              <p className="text-xs text-slate-500 text-center font-medium">
                Please keep this window open while processing batch deliveries...
              </p>
            </div>
          )}

          {deliveryReport && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase">
                  <CheckCircle2 className="h-4 w-4 text-[#006A4E]" />
                  <span>Broadcast Execution Complete</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <div className="text-xs text-slate-500 font-bold">Total</div>
                    <div className="text-sm font-black text-slate-900">{deliveryReport.total}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <div className="text-xs text-emerald-600 font-bold">Successful</div>
                    <div className="text-sm font-black text-emerald-700">{deliveryReport.successful}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <div className="text-xs text-red-500 font-bold">Failed</div>
                    <div className="text-sm font-black text-red-700">{deliveryReport.failed}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setDeliveryReport(null)}
                  className="px-5 py-2 bg-[#006A4E] text-white text-xs font-bold rounded-xl hover:bg-[#00523d] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
};

export default BroadcastManagement;
