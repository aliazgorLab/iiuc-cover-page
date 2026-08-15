import React from 'react';
import logoImg from '../../../Image/logo.png';
import varsityNameImg from '../../../Image/varsitityName.png';
import footerImg from '../../../Image/footer.png';

export const LabIndexCover = ({ data }) => {
  const minRows = 10;
  const experiments = data?.experiments || [];
  const emptyRowsNeeded = Math.max(0, minRows - experiments.length);
  const emptyRows = Array(emptyRowsNeeded).fill(null);

  return (
    <div className="lab-index-wrapper">
      <style>
        {`
          .lab-index-wrapper * { margin: 0; padding: 0; box-sizing: border-box; }
          .lab-index-wrapper { font-family: 'Times New Roman', Times, serif; }
          .lab-index-wrapper .page { width: 210mm; height: 296mm; min-height: 296mm; max-height: 296mm; background: white; padding: 10mm; position: relative; margin: 0 auto; overflow: hidden; page-break-after: avoid; margin-bottom: 0; }
          .lab-index-wrapper .site-watermark { position: absolute; bottom: 8px; left: 0; width: 100%; text-align: center; color: #9ca3af; font-size: 10px; font-family: sans-serif; z-index: 100; }
          .lab-index-wrapper .border-frame { border: 2px solid #1a1a50; height: 274mm; max-height: 274mm; padding: 15px 25px; position: relative; display: flex; flex-direction: column; overflow: hidden; }
          .lab-index-wrapper .content { display: flex; flex-direction: column; height: 100%; justify-content: space-between; }
          .lab-index-wrapper .header { text-align: center; margin-bottom: 20px; }
          .lab-index-wrapper .logo { width: 70px; height: auto; margin: 0 auto 10px auto; display: block; }
          .lab-index-wrapper .varsity-name-img { max-width: 60%; height: auto; display: block; margin: 0 auto; }
          .lab-index-wrapper .page-title { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 15px; margin-bottom: 20px; text-align: center; text-decoration: underline; }
          
          .lab-index-wrapper .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 0 10px; }
          .lab-index-wrapper .info-left, .lab-index-wrapper .info-right { flex: 1; }
          .lab-index-wrapper .info-line { display: flex; margin-bottom: 8px; font-size: 15px; }
          .lab-index-wrapper .info-label { font-weight: bold; width: 120px; flex-shrink: 0; }
          .lab-index-wrapper .info-value { flex: 1; }
          
          .lab-index-wrapper .table-container { margin-bottom: 15px; }
          .lab-index-wrapper table { width: 100%; border-collapse: collapse; border: 2px solid black; }
          .lab-index-wrapper th, .lab-index-wrapper td { border: 1px solid black; padding: 8px; text-align: center; }
          .lab-index-wrapper th { font-weight: bold; background-color: #f5f5f5; font-size: 14px; }
          .lab-index-wrapper td { font-size: 13px; min-height: 35px; }
          .lab-index-wrapper .col-sl { width: 50px; }
          .lab-index-wrapper .col-date { width: 85px; }
          .lab-index-wrapper .col-experiment { width: auto; text-align: left; padding-left: 12px; }
          .lab-index-wrapper .col-report { width: 70px; }
          .lab-index-wrapper .col-viva { width: 70px; }
          .lab-index-wrapper .col-performance { width: 90px; }
          .lab-index-wrapper .col-signature { width: 90px; }
          .lab-index-wrapper tbody tr { height: 40px; }
          
          .lab-index-wrapper .footer { margin-top: 0; }
          .lab-index-wrapper .campus-img { width: 100%; height: 100px; object-fit: cover; border-radius: 2px; display: block; }
          
          @media print {
            .lab-index-wrapper .page { 
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
            .lab-index-wrapper th {
              background-color: #f5f5f5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
      <div className="page">
        <div className="border-frame">
          <div className="content">
            <div className="header">
              <img src={logoImg} alt="IIUC Logo" className="logo" />
              <img src={varsityNameImg} alt="University Name" className="varsity-name-img" />
            </div>
            
            <div className="page-title">LAB REPORT INDEX</div>
            
            <div className="info-section">
              <div className="info-left">
                <div className="info-line">
                  <span className="info-label">NAME</span>
                  <span className="info-value">: {data?.studentName || '[STUDENT_NAME]'}</span>
                </div>
                <div className="info-line">
                  <span className="info-label">ID NO</span>
                  <span className="info-value">: {data?.studentId || '[STUDENT_ID]'}</span>
                </div>
                <div className="info-line">
                  <span className="info-label">SECTION</span>
                  <span className="info-value">: {data?.section || '[SECTION]'}</span>
                </div>
              </div>
              <div className="info-right">
                <div className="info-line">
                  <span className="info-label">COURSE TITLE</span>
                  <span className="info-value">: {data?.courseTitle || '[COURSE_TITLE]'}</span>
                </div>
                <div className="info-line">
                  <span className="info-label">COURSE CODE</span>
                  <span className="info-value">: {data?.courseCode || '[COURSE_CODE]'}</span>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="col-sl">Sl. No</th>
                    <th className="col-date">Date</th>
                    <th className="col-experiment">Experiment Name</th>
                    <th className="col-report">Report</th>
                    <th className="col-viva">Viva</th>
                    <th className="col-performance">Class Performance</th>
                    <th className="col-signature">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.map((exp, index) => (
                    <tr key={index}>
                      <td className="col-sl">{exp.no || index + 1}</td>
                      <td className="col-date">{exp.date || ''}</td>
                      <td className="col-experiment">{exp.name || ''}</td>
                      <td className="col-report"></td>
                      <td className="col-viva"></td>
                      <td className="col-performance"></td>
                      <td className="col-signature"></td>
                    </tr>
                  ))}
                  {emptyRows.map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="col-sl">{experiments.length + index + 1}</td>
                      <td className="col-date"></td>
                      <td className="col-experiment"></td>
                      <td className="col-report"></td>
                      <td className="col-viva"></td>
                      <td className="col-performance"></td>
                      <td className="col-signature"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="footer">
              <img src={footerImg} alt="Campus Image" className="campus-img" />
            </div>
          </div>
        </div>
        <div className="site-watermark">
          https://iiuccoverpage.vercel.app
        </div>
      </div>
    </div>
  );
};

export default LabIndexCover;
