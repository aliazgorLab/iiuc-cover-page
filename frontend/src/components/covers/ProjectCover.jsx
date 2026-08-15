import logoImg from '../../Image/logo.png';
import varsityNameImg from '../../Image/varsitityName.png';
import footerImg from '../../Image/footer.png';

/**
 * ProjectCover Component
 * 
 * Generates a professional project report cover page for group projects at IIUC.
 * Features a centered, symmetrical design with flexbox-based student layout.
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectTitle - Title of the project
 * @param {string} props.courseCode - Course code (e.g., "CSE-401")
 * @param {string} props.courseTitle - Full course title
 * @param {string} props.teacherName - Name of the supervising teacher
 * @param {string} props.teacherDesignation - Teacher's designation
 * @param {string} props.teacherDept - Teacher's department
 * @param {Array<{name: string, id: string}>} props.groupMembers - Array of group members
 * @param {string} props.date - Date of submission
 * @param {string} props.departmentName - Full department name for display
 */
const ProjectCover = ({ 
  projectTitle, 
  courseCode, 
  courseTitle, 
  teacherName, 
  teacherDesignation, 
  teacherDept, 
  groupMembers = [], 
  date,
  departmentName
}) => {
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
          
          /* Header Section */
          .preview-wrapper .header { text-align: center; margin-bottom: 15px; }
          .preview-wrapper .logo { width: 70px; height: auto; margin: 0 auto 10px auto; display: block; }
          .preview-wrapper .varsity-name-img { max-width: 60%; height: auto; display: block; margin: 0 auto; }
          
          /* Project Title */
          .preview-wrapper .project-title { font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 10px; margin-bottom: 25px; text-align: center; }
          
          /* Course Info Box - Centered */
          .preview-wrapper .course-info-box { padding: 15px 20px; margin-bottom: 25px; width: 100%; max-width: 550px; margin-left: auto; margin-right: auto; text-align: center; }
          .preview-wrapper .info-row { display: flex; justify-content: center; margin-bottom: 8px; font-size: 17px; font-weight: bold; align-items: flex-start; }
          .preview-wrapper .info-row:last-child { margin-bottom: 0; }
          .preview-wrapper .label { width: 200px; flex-shrink: 0; text-align: left; }
          .preview-wrapper .val { flex: 1; text-align: left; }
          
          /* Submitted To Section - Centered */
          .preview-wrapper .submitted-to { text-align: center; margin-bottom: 30px; }
          .preview-wrapper .section-label-center { font-weight: bold; text-decoration: underline; margin-bottom: 15px; font-size: 16px; text-align: center; }
          .preview-wrapper .teacher-box { border: 1px solid black; display: inline-block; padding: 12px 50px; min-width: 320px; background: white; position: relative; z-index: 10; }
          .preview-wrapper .teacher-name { font-size: 18px; font-weight: bold; color: black !important; position: relative; z-index: 20; margin-bottom: 4px; }
          .preview-wrapper .teacher-desig { font-size: 14px; margin-top: 2px; color: black !important; position: relative; z-index: 20; }
          
          /* Submitted By Section - Flexbox Layout */
          .preview-wrapper .submitted-by { text-align: center; margin-bottom: 25px; width: 100%; padding: 0 40px; }
          .preview-wrapper .students-flex { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px 40px; width: 100%; max-width: 700px; margin: 0 auto; }
          .preview-wrapper .student-card { border: 1px solid #1a1a50; padding: 12px 20px; background: white; position: relative; z-index: 10; text-align: left; min-height: 70px; width: 45%; max-width: 300px; display: flex; flex-direction: column; justify-content: center; }
          .preview-wrapper .student-row { display: flex; margin-bottom: 6px; font-size: 15px; font-weight: bold; }
          .preview-wrapper .student-row:last-child { margin-bottom: 0; }
          .preview-wrapper .student-label { width: 70px; flex-shrink: 0; }
          .preview-wrapper .student-val { flex: 1; }
          
          /* Department Section */
          .preview-wrapper .department-section { text-align: center; font-weight: bold; font-size: 18px; margin-top: auto; margin-bottom: 16px; color: #1a1a50; position: relative; z-index: 10; }
          
          /* Footer */
          .preview-wrapper .footer-date { text-align: center; margin-top: auto; margin-bottom: 15px; font-weight: bold; font-size: 14px; }
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
            .preview-wrapper .teacher-box,
            .preview-wrapper .student-card {
              background-color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .preview-wrapper .teacher-name,
            .preview-wrapper .teacher-desig,
            .preview-wrapper .student-row {
              z-index: 50 !important;
            }
          }
        `}
      </style>
      <div className="page">
        <div className="border-frame">
          <img src={logoImg} alt="Watermark" className="watermark" />
          <div className="content">
            {/* Header with Logo and University Name */}
            <div className="header">
              <img src={logoImg} alt="IIUC Logo" className="logo" />
              <img src={varsityNameImg} alt="University Name" className="varsity-name-img" />
            </div>

            {/* Project Title */}
            <div className="project-title">PROJECT REPORT</div>

            {/* Course Info Box - Centered */}
            <div className="course-info-box">
              <div className="info-row">
                <div className="label">PROJECT TITLE</div>
                <div className="val">: {projectTitle || '[PROJECT_TITLE]'}</div>
              </div>
              <div className="info-row">
                <div className="label">COURSE CODE</div>
                <div className="val">: {courseCode || '[COURSE_CODE]'}</div>
              </div>
              <div className="info-row">
                <div className="label">COURSE TITLE</div>
                <div className="val">: {courseTitle || '[COURSE_TITLE]'}</div>
              </div>
            </div>

            {/* Submitted To (Teacher) - Centered */}
            <div className="submitted-to">
              <div className="section-label-center">SUBMITTED TO:</div>
              <div className="teacher-box">
                <div className="teacher-name">{teacherName || '[TEACHER_NAME]'}</div>
                <div className="teacher-desig">{teacherDesignation || '[DESIGNATION]'},</div>
                <div className="teacher-desig">{teacherDept || '[DEPARTMENT]'}</div>
              </div>
            </div>

            {/* Submitted By (Group Members) - Flexbox Layout */}
            <div className="submitted-by">
              <div className="section-label-center">SUBMITTED BY:</div>
              <div className="students-flex">
                {groupMembers && groupMembers.length > 0 ? (
                  groupMembers.map((member, index) => (
                    <div key={index} className="student-card">
                      <div className="student-row">
                        <div className="student-label">NAME</div>
                        <div className="student-val">: {member.name || '[NAME]'}</div>
                      </div>
                      <div className="student-row">
                        <div className="student-label">ID NO</div>
                        <div className="student-val">: {member.id || '[ID]'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="student-card">
                      <div className="student-row">
                        <div className="student-label">NAME</div>
                        <div className="student-val">: [MEMBER_1_NAME]</div>
                      </div>
                      <div className="student-row">
                        <div className="student-label">ID NO</div>
                        <div className="student-val">: [MEMBER_1_ID]</div>
                      </div>
                    </div>
                    <div className="student-card">
                      <div className="student-row">
                        <div className="student-label">NAME</div>
                        <div className="student-val">: [MEMBER_2_NAME]</div>
                      </div>
                      <div className="student-row">
                        <div className="student-label">ID NO</div>
                        <div className="student-val">: [MEMBER_2_ID]</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Department Section */}
            <div className="department-section">
              {departmentName || '[DEPARTMENT NAME]'}
            </div>

            {/* Footer: Date of Submission */}
            <div className="footer-date">
              DATE OF SUBMISSION: {date || ''}
            </div>

            {/* Campus Footer Image */}
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

export default ProjectCover;
