import React from 'react';
import logoImg from '../../../Image/logo.png';
import footerImg from '../../../Image/footer.png';

/**
 * Assignment Cover V2.0
 * Modern Premium IIUC Academic Document Cover
 * Design: Card-based layout · Clean Swiss typography · IIUC Brand Identity
 */
export const AssignmentCoverV2 = ({ data }) => {
  const fmt = (val, fallback) => (val && val.trim?.() ? val : fallback);

  const submissionDate = data?.submissionDate
    ? new Date(data.submissionDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="preview-wrapper-v2">
      <style>{`
        /* ── Reset & Base ── */
        .preview-wrapper-v2 * { margin: 0; padding: 0; box-sizing: border-box; }
        .preview-wrapper-v2 {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          line-height: 1.4;
        }

        /* ── Page Canvas ── */
        .preview-wrapper-v2 .av2-page {
          width: 210mm;
          height: 296mm;
          min-height: 296mm;
          max-height: 296mm;
          background: #ffffff;
          position: relative;
          margin: 0 auto;
          overflow: hidden;
          page-break-after: avoid;
          display: flex;
          flex-direction: column;
        }

        /* ── Watermark ── */
        .preview-wrapper-v2 .av2-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 420px;
          height: 420px;
          object-fit: contain;
          opacity: 0.045;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Geometric BG Accents ── */
        .preview-wrapper-v2 .av2-geo-top {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 8mm;
          background: linear-gradient(90deg, #006B54 0%, #00543f 40%, #132238 100%);
          z-index: 1;
        }
        .preview-wrapper-v2 .av2-geo-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }
        .preview-wrapper-v2 .av2-geo-stripe {
          height: 3.5mm;
          background: linear-gradient(90deg, #D4AF37 0%, #c9a120 60%, #D4AF37 100%);
        }
        .preview-wrapper-v2 .av2-footer-bar {
          background: linear-gradient(90deg, #006B54 0%, #132238 100%);
          padding: 6px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .preview-wrapper-v2 .av2-footer-text {
          color: rgba(255,255,255,0.65);
          font-size: 8px;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.5px;
        }
        .preview-wrapper-v2 .av2-footer-url {
          color: #D4AF37;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.4px;
          font-family: 'Inter', sans-serif;
        }

        /* ── Left Accent Bar ── */
        .preview-wrapper-v2 .av2-left-bar {
          position: absolute;
          left: 10mm;
          top: 10mm;
          bottom: 22mm;
          width: 2.5px;
          background: linear-gradient(180deg, #006B54 0%, #D4AF37 50%, #132238 100%);
          border-radius: 4px;
          z-index: 1;
        }

        /* ── Main Content ── */
        .preview-wrapper-v2 .av2-content {
          position: relative;
          z-index: 2;
          padding: 10mm 14mm 4mm 17mm;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Header Section ── */
        .preview-wrapper-v2 .av2-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 7mm;
          padding-bottom: 5mm;
          border-bottom: 1px solid #e2e8f0;
          position: relative;
        }
        .preview-wrapper-v2 .av2-logo {
          width: 58px;
          height: auto;
          margin-bottom: 7px;
          filter: drop-shadow(0 2px 6px rgba(0,107,84,0.15));
        }
        .preview-wrapper-v2 .av2-univ-en {
          font-size: 11px;
          font-weight: 800;
          color: #132238;
          text-align: center;
          letter-spacing: 0.3px;
          line-height: 1.3;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        .preview-wrapper-v2 .av2-univ-bn {
          font-size: 9.5px;
          font-weight: 500;
          color: #475569;
          text-align: center;
          margin-top: 2px;
          font-family: 'SolaimanLipi', 'Vrinda', serif;
        }
        .preview-wrapper-v2 .av2-header-accent {
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2.5px;
          background: linear-gradient(90deg, #006B54, #D4AF37);
          border-radius: 99px;
        }

        /* ── Document Type Badge ── */
        .preview-wrapper-v2 .av2-badge-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 6mm;
        }
        .preview-wrapper-v2 .av2-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1.5px solid #006B54;
          border-radius: 8px;
          padding: 6px 28px;
          background: linear-gradient(135deg, #f0fdf8 0%, #e8f5f2 100%);
          position: relative;
          overflow: hidden;
        }
        .preview-wrapper-v2 .av2-badge::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #006B54, #D4AF37, #006B54);
        }
        .preview-wrapper-v2 .av2-badge-title {
          font-size: 16px;
          font-weight: 900;
          color: #006B54;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }
        .preview-wrapper-v2 .av2-badge-sub {
          font-size: 7.5px;
          color: #64748b;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 1px;
        }

        /* ── Topic Banner ── */
        .preview-wrapper-v2 .av2-topic-card {
          background: linear-gradient(135deg, #132238 0%, #1a2f4a 100%);
          border-radius: 6px;
          padding: 8px 16px;
          margin-bottom: 5mm;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .preview-wrapper-v2 .av2-topic-icon {
          width: 26px;
          height: 26px;
          background: rgba(212,175,55,0.18);
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 12px;
          margin-top: 1px;
        }
        .preview-wrapper-v2 .av2-topic-inner { flex: 1; }
        .preview-wrapper-v2 .av2-topic-label {
          font-size: 7px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #D4AF37;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .preview-wrapper-v2 .av2-topic-value {
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.35;
        }

        /* ── Course Info Card ── */
        .preview-wrapper-v2 .av2-course-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 4.5mm;
          background: #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .preview-wrapper-v2 .av2-card-header {
          background: linear-gradient(90deg, #006B54 0%, #005a46 100%);
          padding: 5px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .preview-wrapper-v2 .av2-card-header-dot {
          width: 5px;
          height: 5px;
          background: #D4AF37;
          border-radius: 50%;
        }
        .preview-wrapper-v2 .av2-card-header-title {
          font-size: 7.5px;
          font-weight: 800;
          color: rgba(255,255,255,0.9);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .preview-wrapper-v2 .av2-card-body {
          padding: 9px 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 14px;
        }
        .preview-wrapper-v2 .av2-field {
          display: flex;
          flex-direction: column;
          gap: 1.5px;
        }
        .preview-wrapper-v2 .av2-field-label {
          font-size: 7px;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .preview-wrapper-v2 .av2-field-value {
          font-size: 11px;
          font-weight: 700;
          color: #132238;
          line-height: 1.3;
          border-bottom: 1px dashed #e2e8f0;
          padding-bottom: 3px;
        }
        .preview-wrapper-v2 .av2-field-value.full-width {
          grid-column: span 2;
        }

        /* ── Submitted To Card ── */
        .preview-wrapper-v2 .av2-faculty-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 4.5mm;
          background: #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .preview-wrapper-v2 .av2-faculty-body {
          padding: 9px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .preview-wrapper-v2 .av2-faculty-avatar {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #006B54, #132238);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
          font-family: serif;
          font-weight: 700;
        }
        .preview-wrapper-v2 .av2-faculty-name {
          font-size: 12px;
          font-weight: 800;
          color: #132238;
          line-height: 1.25;
          font-family: 'Georgia', serif;
        }
        .preview-wrapper-v2 .av2-faculty-meta {
          font-size: 9px;
          color: #475569;
          font-weight: 500;
          margin-top: 1.5px;
          line-height: 1.5;
        }
        .preview-wrapper-v2 .av2-faculty-tag {
          display: inline-block;
          font-size: 7px;
          font-weight: 700;
          color: #006B54;
          background: #e8f5f2;
          border: 1px solid #c6e8de;
          border-radius: 3px;
          padding: 1px 6px;
          margin-top: 3px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* ── Student Info Card ── */
        .preview-wrapper-v2 .av2-student-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          margin-bottom: 4mm;
        }
        .preview-wrapper-v2 .av2-student-grid {
          padding: 9px 14px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px 10px;
        }

        /* ── Footer Info Row ── */
        .preview-wrapper-v2 .av2-doc-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 4mm;
        }
        .preview-wrapper-v2 .av2-meta-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }
        .preview-wrapper-v2 .av2-meta-label {
          font-size: 6.5px;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }
        .preview-wrapper-v2 .av2-meta-value {
          font-size: 9px;
          color: #132238;
          font-weight: 700;
        }
        .preview-wrapper-v2 .av2-meta-divider {
          width: 1px;
          height: 24px;
          background: #e2e8f0;
        }

        /* ── Remark Box ── */
        .preview-wrapper-v2 .av2-remark-row {
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          gap: 8px;
          margin-top: auto;
          margin-bottom: 3mm;
        }
        .preview-wrapper-v2 .av2-remark-box {
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          padding: 5px 16px;
          min-width: 130px;
          height: 36px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .preview-wrapper-v2 .av2-remark-label {
          font-size: 7px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* ── Campus Footer Image ── */
        .preview-wrapper-v2 .av2-campus-img {
          width: 100%;
          height: 18mm;
          object-fit: cover;
          object-position: center 60%;
          display: block;
          border-radius: 4px;
          margin-bottom: 3mm;
        }

        /* ── Print Overrides ── */
        @media print {
          .preview-wrapper-v2 .av2-page {
            width: 210mm !important;
            height: 296mm !important;
            max-height: 296mm !important;
            min-height: 296mm !important;
            margin: 0 !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            overflow: hidden !important;
          }
          .preview-wrapper-v2 .av2-geo-top,
          .preview-wrapper-v2 .av2-badge,
          .preview-wrapper-v2 .av2-faculty-avatar,
          .preview-wrapper-v2 .av2-topic-card,
          .preview-wrapper-v2 .av2-card-header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="av2-page">
        {/* Watermark */}
        <img src={logoImg} alt="" className="av2-watermark" />

        {/* Top accent bar */}
        <div className="av2-geo-top" />

        {/* Left accent bar */}
        <div className="av2-left-bar" />

        {/* Main Content */}
        <div className="av2-content">

          {/* ── Header ── */}
          <div className="av2-header">
            <img src={logoImg} alt="IIUC Logo" className="av2-logo" />
            <div className="av2-univ-en">International Islamic University Chittagong</div>
            <div className="av2-univ-bn">আন্তর্জাতিক ইসলামী বিশ্ববিদ্যালয় চট্টগ্রাম</div>
            <div className="av2-header-accent" />
          </div>

          {/* ── Document Type Badge ── */}
          <div className="av2-badge-wrap">
            <div className="av2-badge">
              <div className="av2-badge-title">Assignment</div>
              <div className="av2-badge-sub">Academic Submission · IIUC</div>
            </div>
          </div>

          {/* ── Topic Banner ── */}
          <div className="av2-topic-card">
            <div className="av2-topic-icon">✍️</div>
            <div className="av2-topic-inner">
              <div className="av2-topic-label">Topic / Assignment Title</div>
              <div className="av2-topic-value">
                {fmt(data?.assignmentTitle, 'Assignment Title')}
              </div>
            </div>
          </div>

          {/* ── Course Info Card ── */}
          <div className="av2-course-card">
            <div className="av2-card-header">
              <div className="av2-card-header-dot" />
              <div className="av2-card-header-title">Course Information</div>
            </div>
            <div className="av2-card-body">
              <div className="av2-field">
                <div className="av2-field-label">Course Code</div>
                <div className="av2-field-value">{fmt(data?.courseCode, '——')}</div>
              </div>
              <div className="av2-field">
                <div className="av2-field-label">Course Title</div>
                <div className="av2-field-value">{fmt(data?.courseTitle, '——')}</div>
              </div>
            </div>
          </div>

          {/* ── Submitted To ── */}
          <div className="av2-faculty-card">
            <div className="av2-card-header" style={{ background: 'linear-gradient(90deg, #132238 0%, #1a2f4a 100%)' }}>
              <div className="av2-card-header-dot" style={{ background: '#D4AF37' }} />
              <div className="av2-card-header-title">Submitted To</div>
            </div>
            <div className="av2-faculty-body">
              <div className="av2-faculty-avatar">
                {(data?.teacherName || 'T')[0].toUpperCase()}
              </div>
              <div>
                <div className="av2-faculty-name">{fmt(data?.teacherName, 'Teacher Name')}</div>
                <div className="av2-faculty-meta">
                  {fmt(data?.teacherDesignation, 'Designation')}
                  {data?.teacherDept ? ` · ${data.teacherDept}` : ''}
                </div>
                <div className="av2-faculty-tag">IIUC Faculty</div>
              </div>
            </div>
          </div>

          {/* ── Submitted By ── */}
          <div className="av2-student-card">
            <div className="av2-card-header" style={{ background: 'linear-gradient(90deg, #006B54 0%, #004d3b 100%)' }}>
              <div className="av2-card-header-dot" />
              <div className="av2-card-header-title">Submitted By</div>
            </div>
            <div className="av2-student-grid">
              <div className="av2-field" style={{ gridColumn: 'span 2' }}>
                <div className="av2-field-label">Student Name</div>
                <div className="av2-field-value">{fmt(data?.studentName, '——')}</div>
              </div>
              <div className="av2-field">
                <div className="av2-field-label">Student ID</div>
                <div className="av2-field-value">{fmt(data?.studentId, '——')}</div>
              </div>
              <div className="av2-field">
                <div className="av2-field-label">Semester</div>
                <div className="av2-field-value">{fmt(data?.semester, '——')}</div>
              </div>
              <div className="av2-field">
                <div className="av2-field-label">Section</div>
                <div className="av2-field-value">{fmt(data?.section, '——')}</div>
              </div>
              <div className="av2-field" style={{ gridColumn: 'span 3' }}>
                <div className="av2-field-label">Department</div>
                <div className="av2-field-value">{fmt(data?.studentDept, '——')}</div>
              </div>
            </div>
          </div>

          {/* ── Document Meta Row ── */}
          <div className="av2-doc-meta">
            <div className="av2-meta-item">
              <div className="av2-meta-label">Date of Submission</div>
              <div className="av2-meta-value">{submissionDate}</div>
            </div>
            <div className="av2-meta-divider" />
            <div className="av2-meta-item">
              <div className="av2-meta-label">Document Type</div>
              <div className="av2-meta-value">Assignment</div>
            </div>
            <div className="av2-meta-divider" />
            <div className="av2-meta-item">
              <div className="av2-meta-label">Template Version</div>
              <div className="av2-meta-value">V2.0 · 2026</div>
            </div>
            <div className="av2-meta-divider" />
            <div className="av2-meta-item">
              <div className="av2-meta-label">Remark</div>
              <div className="av2-meta-value" style={{ borderBottom: '1.5px solid #cbd5e1', minWidth: '80px' }}>&nbsp;</div>
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* ── Campus Image ── */}
          <img src={footerImg} alt="IIUC Campus" className="av2-campus-img" />

        </div>

        {/* ── Bottom Footer Bar ── */}
        <div className="av2-geo-bottom">
          <div className="av2-geo-stripe" />
          <div className="av2-footer-bar">
            <div className="av2-footer-text">International Islamic University Chittagong · Academic Document Platform</div>
            <div className="av2-footer-url">iiuccoverpage.vercel.app</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCoverV2;
