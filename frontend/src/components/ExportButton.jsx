import React from 'react';
import { Download, Save, Paperclip } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export const ExportButton = ({
  onDownloadPDF,
  onDownloadJPG,
  onSaveCloud,
  attachedPdf = null,
  disabled = false,
}) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="space-y-2 pt-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDownloadPDF}
          disabled={disabled}
          className={`flex-1 btn-iiuc-primary !py-3 shadow-md text-xs cursor-pointer disabled:opacity-50 transition-all ${
            attachedPdf ? '!bg-[#006A4E] hover:!bg-[#005540] ring-2 ring-emerald-500/30' : ''
          }`}
        >
          {attachedPdf ? <Paperclip className="h-4 w-4 shrink-0 text-emerald-300" /> : <Download className="h-4 w-4 shrink-0" />}
          <span className="truncate">
            {attachedPdf ? 'Download Complete Submission PDF' : 'Download PDF'}
          </span>
          {attachedPdf && (
            <span className="text-[10px] bg-emerald-800/60 text-emerald-100 font-mono font-bold px-1.5 py-0.5 rounded ml-1 shrink-0">
              {attachedPdf.pages + 1} pgs
            </span>
          )}
        </button>
        <button
          onClick={onDownloadJPG}
          disabled={disabled}
          className="sm:w-auto px-4 btn-iiuc-outline !py-3 text-xs cursor-pointer disabled:opacity-50"
        >
          <Download className="h-4 w-4 shrink-0" />
          <span>Download JPG</span>
        </button>
      </div>

      {isAuthenticated && onSaveCloud && (
        <button
          onClick={onSaveCloud}
          disabled={disabled}
          className="w-full btn-iiuc-gold !py-2.5 text-xs shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          <span>Save to Cloud History</span>
        </button>
      )}
    </div>
  );
};

export default ExportButton;
