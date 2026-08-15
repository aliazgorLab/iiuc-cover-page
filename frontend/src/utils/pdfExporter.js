import html2pdf from 'html2pdf.js';
import { toast } from 'react-toastify';
import { mergeCoverWithDocument } from './pdfMerger';

/**
 * Generates and downloads the IIUC Cover Page PDF.
 * If an attached document is provided, merges cover as Page 1 and attached document as Page 2+.
 * 
 * @param {HTMLElement} element - The cover template container element
 * @param {string} filePrefix - Filename prefix (e.g. 'Assignment', 'LabReport')
 * @param {string} studentId - Student ID matrix
 * @param {Object|null} attachedPdf - Optional attached PDF metadata ({ file, name, size, pages })
 */
export const exportToPDF = async (element, filePrefix, studentId, attachedPdf = null) => {
  if (!element) {
    toast.error('Unable to locate template container. Please try again.');
    return;
  }

  const defaultFilename = attachedPdf
    ? `FINAL_ASSIGNMENT_SUBMISSION.pdf`
    : `${filePrefix}_${studentId || 'Cover'}.pdf`;

  const options = {
    margin: 0,
    filename: defaultFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  // Flow A: If document is attached, perform Smart Merge
  if (attachedPdf && attachedPdf.file) {
    toast.info('Preparing your submission PDF...');

    try {
      // 1. Generate Cover PDF as ArrayBuffer
      const coverArrayBuffer = await html2pdf()
        .set(options)
        .from(element)
        .outputPdf('arraybuffer');

      // 2. Merge Cover (Page 1) + Attached PDF (Page 2+)
      const mergedBlob = await mergeCoverWithDocument(coverArrayBuffer, attachedPdf.file);

      // 3. Trigger Browser Download
      const blobUrl = URL.createObjectURL(mergedBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success('✓ Cover page added successfully. Downloading PDF...');
    } catch (mergeError) {
      console.error('PDF Merge Fallback Triggered:', mergeError);
      toast.warn('Unable to merge documents. Downloading cover page only.');

      // Fallback: Download cover page alone so download never completely fails
      html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => toast.info('Cover page downloaded.'))
        .catch(() => toast.error('Failed to generate cover PDF.'));
    }
    return;
  }

  // Flow B: Standard single cover PDF download
  toast.info('Generating high-resolution PDF...');

  html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => {
      toast.success('PDF downloaded successfully!');
    })
    .catch((error) => {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    });
};
