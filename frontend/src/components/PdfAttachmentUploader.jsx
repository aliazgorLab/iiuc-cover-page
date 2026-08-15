import React, { useRef, useState } from 'react';
import { Paperclip, UploadCloud, FileText, CheckCircle2, Trash2, RefreshCw, Layers, FileCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { getPdfPageCount } from '../utils/pdfMerger';

export const PdfAttachmentUploader = ({ attachedPdf, onAttach, onRemove }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = async (file) => {
    if (!file) return;

    // Validation 1: File type check
    const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfType) {
      toast.error('Only PDF files are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validation 2: Maximum size check (20MB)
    const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('PDF file size exceeds maximum limit of 20MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsParsing(true);

    try {
      // Parse page count & validate readability using pdf-lib
      const pageCount = await getPdfPageCount(file);

      const pdfData = {
        file,
        name: file.name,
        size: file.size,
        pages: pageCount,
      };

      onAttach(pdfData);
      toast.success(`✓ Attached document (${pageCount} ${pageCount === 1 ? 'page' : 'pages'}) successfully!`);
    } catch (err) {
      console.error('File parsing error:', err);
      toast.error(err.message || 'This PDF cannot be processed. Please upload another file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-[#006A4E] rounded-lg">
              <Paperclip className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Attach Existing Document <span className="text-slate-400 font-semibold lowercase">(optional)</span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed pl-7">
            Upload your assignment/report PDF. The cover page will automatically become the first page of your final submission.
          </p>
        </div>
      </div>

      {/* State A: Upload Dropzone (No PDF attached) */}
      {!attachedPdf && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-[#006A4E] bg-emerald-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-[#006A4E] hover:bg-slate-50/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          {isParsing ? (
            <div className="py-2 flex flex-col items-center gap-2 text-[#006A4E]">
              <RefreshCw className="h-7 w-7 animate-spin" />
              <span className="text-xs font-bold">Analyzing PDF document structure...</span>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-[#006A4E] transition-all">
                <UploadCloud className="h-5 w-5 text-[#006A4E]" />
              </div>

              <div>
                <p className="text-xs font-extrabold text-slate-800">
                  <span className="text-[#006A4E] underline underline-offset-2">Upload PDF</span> or Drag & Drop File
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Click anywhere inside to select from your device
                </p>
              </div>

              {/* Supported Badge Rules */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 font-bold bg-slate-100/70 px-3 py-1 rounded-full border border-slate-200/60 mt-1">
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> PDF only
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <CheckCircle2 className="h-3 w-3 text-slate-400" /> Maximum 20MB
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* State B: Document Attached View */}
      {attachedPdf && (
        <div className="space-y-3">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-white text-[#006A4E] rounded-xl shadow-xs shrink-0 border border-emerald-100">
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-[#006A4E] tracking-wider bg-emerald-100/80 px-2 py-0.5 rounded">
                    Attached Document
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {formatFileSize(attachedPdf.size)}
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 truncate" title={attachedPdf.name}>
                  📄 {attachedPdf.name}
                </h4>
                <p className="text-[11px] font-bold text-emerald-800">
                  Pages: {attachedPdf.pages} {attachedPdf.pages === 1 ? 'page' : 'pages'}
                </p>
              </div>
            </div>

            {/* Replace & Remove Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                title="Replace PDF File"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-lg transition-all cursor-pointer shadow-2xs"
                title="Remove Attached PDF"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,application/pdf"
                className="hidden"
              />
            </div>
          </div>

          {/* Document Preview Order Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
              <Layers className="h-3.5 w-3.5 text-[#006A4E]" />
              <span>Document Preview Order:</span>
            </div>
            <div className="space-y-1.5 pl-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                <span className="w-5 h-5 bg-[#006A4E] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                  1
                </span>
                <span className="truncate">Cover Page (Generated)</span>
                <span className="ml-auto text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  PAGE 1
                </span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                <span className="w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                  2
                </span>
                <span className="truncate">📄 {attachedPdf.name}</span>
                <span className="ml-auto text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  PAGE 2–{attachedPdf.pages + 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfAttachmentUploader;
