import { PDFDocument } from 'pdf-lib';

/**
 * Parses total page count and validates whether a PDF file is readable.
 * @param {File | Blob | ArrayBuffer} file
 * @returns {Promise<number>} Number of pages in the PDF document
 */
export const getPdfPageCount = async (file) => {
  try {
    const arrayBuffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    return pdfDoc.getPageCount();
  } catch (err) {
    if (err?.message && (err.message.toLowerCase().includes('encrypt') || err.message.toLowerCase().includes('password'))) {
      throw new Error('Password-protected PDFs are not supported. Please unlock the file and try again.');
    }
    throw new Error('This PDF cannot be processed. Please upload another file.');
  }
};

/**
 * Merges the IIUC cover page as Page 1 with an existing student document PDF as Page 2+.
 * Preserves text selection, original resolution, hyperlinks, fonts, and vector formatting.
 * 
 * @param {ArrayBuffer | Uint8Array | Blob} coverPdfData - Generated cover page PDF
 * @param {File | Blob | ArrayBuffer} uploadedPdfFile - Student existing assignment/report PDF
 * @returns {Promise<Blob>} Merged PDF Blob
 */
export const mergeCoverWithDocument = async (coverPdfData, uploadedPdfFile) => {
  try {
    let coverBuffer;
    if (coverPdfData instanceof Blob) {
      coverBuffer = await coverPdfData.arrayBuffer();
    } else if (coverPdfData instanceof ArrayBuffer || coverPdfData instanceof Uint8Array) {
      coverBuffer = coverPdfData;
    } else {
      throw new Error('Invalid cover PDF input data format.');
    }

    let uploadedBuffer;
    if (uploadedPdfFile instanceof ArrayBuffer || uploadedPdfFile instanceof Uint8Array) {
      uploadedBuffer = uploadedPdfFile;
    } else if (uploadedPdfFile instanceof Blob || uploadedPdfFile instanceof File) {
      uploadedBuffer = await uploadedPdfFile.arrayBuffer();
    } else {
      throw new Error('Invalid uploaded PDF file data format.');
    }

    // Load both PDF documents
    const coverPdfDoc = await PDFDocument.load(coverBuffer);
    const uploadedPdfDoc = await PDFDocument.load(uploadedBuffer);

    // Create target document
    const mergedPdf = await PDFDocument.create();

    // 1. Copy Cover Page (MUST ALWAYS REMAIN FIRST PAGE)
    const coverPageIndices = coverPdfDoc.getPageIndices();
    const copiedCoverPages = await mergedPdf.copyPages(coverPdfDoc, coverPageIndices);
    copiedCoverPages.forEach((page) => mergedPdf.addPage(page));

    // 2. Copy Student Existing Assignment PDF (Page 2+)
    const uploadedPageIndices = uploadedPdfDoc.getPageIndices();
    const copiedUploadedPages = await mergedPdf.copyPages(uploadedPdfDoc, uploadedPageIndices);
    copiedUploadedPages.forEach((page) => mergedPdf.addPage(page));

    // Serialize merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    return new Blob([mergedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('PDF Merge Service Error:', error);
    throw error;
  }
};
