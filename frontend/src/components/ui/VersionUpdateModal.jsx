import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle2, ShieldCheck, FileText, Zap, UserCheck, ArrowRight, Calendar } from 'lucide-react';

export const VersionUpdateModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const VERSION_KEY = 'iiuc_release_notes_v2_1';

  useEffect(() => {
    // Listen for manual trigger from Navbar notification bell
    const handleManualOpen = () => setIsOpen(true);
    window.addEventListener('open-release-notes', handleManualOpen);

    // Check if the user has already dismissed this version release modal
    const hasSeenRelease = localStorage.getItem(VERSION_KEY);
    if (!hasSeenRelease) {
      // Auto-open on initial visit after 600ms for smooth entrance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('open-release-notes', handleManualOpen);
      };
    }

    return () => window.removeEventListener('open-release-notes', handleManualOpen);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(VERSION_KEY, 'true');
    }
    setIsOpen(false);
  };

  const handleGotIt = () => {
    localStorage.setItem(VERSION_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Decorative Banner */}
        <div className="relative bg-gradient-to-r from-[#006A4E] via-[#00523d] to-[#0d3b2e] text-white p-6 sm:p-8 overflow-hidden shrink-0">
          
          {/* Subtle Background Pattern & Glow */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-yellow-400/15 rounded-full blur-xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Version Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-xs font-bold text-emerald-100 mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
            <span>PLATFORM FEATURE UPDATE — V2.1</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Optional Date of Experiment Released
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1.5 font-medium max-w-lg">
            Enhanced academic customization for IIUC Laboratory Report Cover Pages.
          </p>
        </div>

        {/* Scrollable Features Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 font-sans text-slate-700 leading-relaxed text-sm">
          
          {/* Feature Spotlight Card */}
          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3.5">
            <div className="p-3 bg-[#006A4E] text-white rounded-xl shrink-0 shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                New: Optional Date of Experiment Feature
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You can now choose to add an official <span className="font-semibold text-[#006A4E]">Date of Experiment</span> to your Lab Report covers. When enabled, the date formats professionally directly above the Date of Submission. When disabled, it is cleanly omitted from preview and exports.
              </p>
            </div>
          </div>

          {/* Key Updates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Feature 1 */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-[#006A4E] text-white rounded-xl shrink-0 shadow-xs">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Optional Control</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Toggle date visibility on demand. The date field input appears only when selected.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-[#006A4E] text-white rounded-xl shrink-0 shadow-xs">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">PDF & JPG Export Sync</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  High-resolution vector PDF and JPG exports reflect your date setting accurately.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-[#006A4E] text-white rounded-xl shrink-0 shadow-xs">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Cloud History & Drafts</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Saved Lab Report covers preserve and restore your date selection seamlessly.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-[#006A4E] text-white rounded-xl shrink-0 shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Official IIUC Layout</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Designed strictly in compliance with IIUC laboratory submission standards.
                </p>
              </div>
            </div>

          </div>

          {/* Quick Highlight List */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">IIUC Academic Suite Features</h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#006A4E] shrink-0" />
                <span>Optional Date of Experiment for Lab Reports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#006A4E] shrink-0" />
                <span>Assignments, Lab Reports, Lab Index & Projects</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#006A4E] shrink-0" />
                <span>IIUC Google Auth & Automatic Profile Sync</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#006A4E] shrink-0" />
                <span>Instant Faculty & Course Auto-Suggest</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          
          {/* Checkbox preference */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-[#006A4E] rounded border-slate-300 focus:ring-[#006A4E]"
            />
            <span>Don't show this release update again</span>
          </label>

          {/* Action Button */}
          <button
            onClick={handleGotIt}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#006A4E] hover:bg-[#00523d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>Explore Feature</span>
            <ArrowRight className="h-4 w-4" />
          </button>

        </div>

      </div>
    </div>
  );
};

export default VersionUpdateModal;
