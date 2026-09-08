import React from 'react';
import logoImg from '../../../Image/logo.png';
import varsityNameImg from '../../../Image/varsitityName.png';
import footerImg from '../../../Image/footer.png';

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    const d = new Date(year, parseInt(month, 10) - 1, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  return dateStr;
};

export const LabReportCover = ({ data }) => {
  return (
    <div className="preview-wrapper">
      <style>
        {`
          .preview-wrapper * { margin: 0; padding: 0; box-sizing: border-box; }
          .preview-wrapper { font-family: 'Times New Roman', Times, serif; }
          .preview-wrapper .page { width: 210mm; height: 296mm; min-height: 296mm; max-height: 296mm; background: white; padding: 10mm; position: relative; margin: 0 auto; overflow: hidden; page-break-after: avoid; margin-bottom: 0; }
          .preview-wrapper .border-frame { border: 2px solid #1a1a50; height: 274mm; max-height: 274mm; padding: 15px 30px; position: relative; display: flex; flex-direction: column; overflow: hidden; }
          .preview-wrapper .watermark { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); width: 350px; opacity: 0.15; pointer-events: none; z-index: 0; }
          .preview-wrapper .site-watermark { position: absolute; bottom: 8px; left: 0; width: 100%; text-align: center; color: #9ca3af; font-size: 10px; font-family: sans-serif; z-index: 100; }
          .preview-wrapper .content { z-index: 1; position: relative; display: flex; flex-direction: column; height: 100%; }
          .preview-wrapper .header { text-align: center; margin-bottom: 15px; }
          .preview-wrapper .logo { width: 70px; height: auto; margin: 0 auto 10px auto; display: block; }
          .preview-wrapper .varsity-name-img { max-width: 60%; height: auto; display: block; margin: 0 auto; }
          .preview-wrapper .assignment-title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 10px; margin-bottom: 30px; text-align: center; }
          .preview-wrapper .course-info-box { padding: 15px 20px; margin-bottom: 25px; width: 100%; max-width: 550px; margin-left: auto; margin-right: auto; border-radius: 4px; display: flex; flex-direction: column; }
          .preview-wrapper .submitted-by { width: 100%; max-width: 550px; margin: 0 auto 20px auto; padding: 0 20px; }
          .preview-wrapper .submitted-by .section-label { text-align: left; font-weight: bold; text-decoration: underline; margin-bottom: 10px; font-size: 16px; }
          .preview-wrapper .info-row, .preview-wrapper .student-row { display: flex; margin-bottom: 8px; font-size: 17px; font-weight: bold; align-items: flex-start; }
          .preview-wrapper .info-row:last-child { margin-bottom: 0; }
          .preview-wrapper .student-row:last-child { margin-bottom: 0; }
          .preview-wrapper .label, .preview-wrapper .student-label { width: 200px; flex-shrink: 0; }
          .preview-wrapper .val { flex: 1; }
          .preview-wrapper .submitted-to { text-align: center; margin-bottom: 30px; }
          .preview-wrapper .section-label-center { font-weight: bold; text-decoration: underline; margin-bottom: 10px; font-size: 16px; text-align: center; }
          .preview-wrapper .teacher-box { border: 1px solid black; display: inline-block; padding: 10px 40px; min-width: 300px; background: white; position: relative; z-index: 10; }
          .preview-wrapper .teacher-name { font-size: 18px; font-weight: bold; color: black !important; position: relative; z-index: 20; }
          .preview-wrapper .teacher-desig { font-size: 14px; margin-top: 2px; color: black !important; position: relative; z-index: 20; }
          .preview-wrapper .footer-details { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; margin-bottom: 15px; font-weight: bold; font-size: 14px; }
          .preview-wrapper .remark-box { border: 1px solid black; width: 200px; height: 60px; position: relative; }
          .preview-wrapper .remark-text { position: absolute; top: 5px; left: 5px; font-size: 12px; }
          .preview-wrapper .campus-img { width: 100%; height: 100px; object-fit: cover; border-radius: 2px; display: block; }
          
          @media print {
            .preview-wrapper .page { 
              width: 210mm; 
              height: 296mm !important; 
              max-height: 296mm !important;
              min-height: 296mm !important;
              margin: 0 !important; 
              padding: 10mm !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
              overflow: hidden !important;
            }
            .preview-wrapper .teacher-box {
              background-color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .preview-wrapper .teacher-name,
            .preview-wrapper .teacher-desig {
              z-index: 50 !important;
            }
          }
        `}
      </style>
      <div className="page">
        <div className="border-frame">
          <img src={logoImg} alt="Watermark" className="watermark" />
          <div className="content">
            <div className="header">
              <img src={logoImg} alt="IIUC Logo" className="logo" />
              <img src={varsityNameImg} alt="University Name" className="varsity-name-img" />
            </div>
            <div className="assignment-title">LAB REPORT</div>
            
            <div className="course-info-box">
              <div className="info-row">
                <div className="label">EXPERIMENT NO</div>
                <div className="val">: {data?.experimentNo || '[EXPERIMENT_NO]'}</div>
              </div>
              <div className="info-row">
                <div className="label">EXPERIMENT NAME</div>
                <div className="val">: {data?.experimentName || '[EXPERIMENT_NAME]'}</div>
              </div>
              <div className="info-row">
                <div className="label">COURSE CODE</div>
                <div className="val">: {data?.courseCode || '[COURSE_CODE]'}</div>
              </div>
              <div className="info-row">
                <div className="label">COURSE TITLE</div>
                <div className="val">: {data?.courseTitle || '[COURSE_TITLE]'}</div>
              </div>
            </div>
            
            <div className="submitted-to">
              <div className="section-label-center">SUBMITTED TO :</div>
              <div className="teacher-box">
                <div className="teacher-name">{data?.teacherName || 'Teacher Name'}</div>
                <div className="teacher-desig">{data?.teacherDesignation || 'Designation'},</div>
                <div className="teacher-desig">{data?.teacherDept || 'Department'}</div>
              </div>
            </div>
            <div className="submitted-by">
              <div className="section-label">SUBMITTED BY :</div>
              <div className="student-row">
                <div className="student-label">NAME</div>
                <div>: {data?.studentName || '[STUDENT_NAME]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">ID NO</div>
                <div>: {data?.studentId || '[STUDENT_ID]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">SEMESTER</div>
                <div>: {data?.semester || '[SEMESTER]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">SECTION</div>
                <div>: {data?.section || '[SECTION]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">DEPARTMENT</div>
                <div>: {data?.studentDept || '[DEPARTMENT]'}</div>
              </div>
            </div>
            <div className="footer-details">
              <div className="dates-block">
                {data?.includeExperimentDate && data?.experimentDate && (
                  <div className="date" style={{ marginBottom: '4px' }}>
                    DATE OF EXPERIMENT : {formatDisplayDate(data.experimentDate)}
                  </div>
                )}
                <div className="date">DATE OF SUBMISSION : {data?.submissionDate || ''}</div>
              </div>
              <div className="remark-box">
                <span className="remark-text">REMARK:</span>
              </div>
            </div>
            <img src={footerImg} alt="Campus Image" className="campus-img" />
          </div>
        </div>
        <div className="site-watermark">
          https://iiuccoverpage.vercel.app
        </div>
      </div>
    </div>
  );
};

export default LabReportCover;
