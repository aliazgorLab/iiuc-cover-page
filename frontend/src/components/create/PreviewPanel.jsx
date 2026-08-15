import React, { useState } from 'react';
import { Eye, ShieldCheck, AlertCircle, ZoomIn, ZoomOut, RotateCcw, Maximize2, X } from 'lucide-react';
import A4Preview from '../A4Preview';
import ExportButton from '../ExportButton';
import PdfAttachmentUploader from '../PdfAttachmentUploader';

export const PreviewPanel = ({
  title,
  badge,
  error,
  children,
  onPDFDownload,
  onJPGDownload,
  onSaveCloud,
  attachedPdf = null,
  onAttachPdf,
  onRemovePdf,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="space-y-4 lg:sticky lg:top-20 h-fit">
      {/* Validation Error Alert Banner */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeInUp">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Controls Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-400 ml-1">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        <button
          onClick={() => setFullscreenOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>Fullscreen</span>
        </button>
      </div>

      {/* A4 Document Preview Frame */}
      <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
        <A4Preview title={title || 'Live Document Preview'} badge={badge || 'A4 Portrait'}>
          {children}
        </A4Preview>
      </div>

      {/* Smart PDF Attachment Uploader */}
      <PdfAttachmentUploader
        attachedPdf={attachedPdf}
        onAttach={onAttachPdf}
        onRemove={onRemovePdf}
      />

      {/* Export Action Controls */}
      <ExportButton
        onDownloadPDF={onPDFDownload}
        onDownloadJPG={onJPGDownload}
        onSaveCloud={onSaveCloud}
        attachedPdf={attachedPdf}
      />

      {/* Fullscreen Preview Modal */}
      {fullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl flex items-center justify-between text-white mb-3 px-2">
            <span className="text-sm font-black tracking-tight">{title} — Fullscreen Workspace</span>
            <button
              onClick={() => setFullscreenOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-100 rounded-2xl p-6 flex justify-center">
            <div className="transform scale-90 sm:scale-100 origin-top">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;
