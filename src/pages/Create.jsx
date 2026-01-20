import { useState, useRef } from 'react';
import { FileText, Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import logoImg from '../Image/logo.png';
import varsityNameImg from '../Image/varsitityName.png';
import footerImg from '../Image/footer.png';

const Create = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState('assignment'); // assignment, labReport, labIndex

  // Form States for Each Type
  const [assignmentData, setAssignmentData] = useState({
    assignmentTitle: '',
    courseCode: '',
    courseTitle: '',
    teacherName: '',
    teacherDesignation: '',
    teacherDept: '',
    studentName: '',
    studentId: '',
    section: '',
    semester: '',
    studentDept: '',
    submissionDate: '',
  });

  const [labReportData, setLabReportData] = useState({
    experimentNo: '',
    experimentName: '',
    courseCode: '',
    courseTitle: '',
    teacherName: '',
    teacherDesignation: '',
    teacherDept: '',
    studentName: '',
    studentId: '',
    section: '',
    semester: '',
    studentDept: '',
    submissionDate: '',
  });

  const [labIndexData, setLabIndexData] = useState({
    courseCode: '',
    courseTitle: '',
    studentName: '',
    studentId: '',
    section: '',
    experiments: [
      { no: '', date: '', name: '', pageNo: '', remarks: '' }
    ]
  });

  // Get current form data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'assignment':
        return assignmentData;
      case 'labReport':
        return labReportData;
      case 'labIndex':
        return labIndexData;
      default:
        return {};
    }
  };

  // Update handlers
  const updateAssignment = (field, value) => {
    setAssignmentData(prev => ({ ...prev, [field]: value }));
  };

  const updateLabReport = (field, value) => {
    setLabReportData(prev => ({ ...prev, [field]: value }));
  };

  const updateLabIndex = (field, value) => {
    setLabIndexData(prev => ({ ...prev, [field]: value }));
  };

  const updateExperiment = (index, field, value) => {
    setLabIndexData(prev => ({
      ...prev,
      experiments: prev.experiments.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addExperiment = () => {
    setLabIndexData(prev => ({
      ...prev,
      experiments: [...prev.experiments, { no: '', date: '', name: '', pageNo: '', remarks: '' }]
    }));
  };

  const deleteExperiment = (index) => {
    setLabIndexData(prev => ({
      ...prev,
      experiments: prev.experiments.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'assignment', label: 'Assignment Cover', icon: '📝' },
    { id: 'labReport', label: 'Lab Report Cover', icon: '🔬' },
    { id: 'labIndex', label: 'Lab Index', icon: '📋' },
  ];

  // Ref for PDF download
  const previewRef = useRef(null);

  // Download PDF function
  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      // Dynamic import for better code splitting
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Get the preview element
      const element = previewRef.current;
      
      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Calculate PDF dimensions (A4)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const filename = `${activeTab}_${getCurrentData().studentName || 'document'}_${Date.now()}.pdf`;
      
      // Download
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Create Your <span className="text-[#006A4E]">Cover Page</span>
          </h1>
          <p className="text-gray-600">Fill in the details and see the live preview</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#006A4E] text-white shadow-lg shadow-[#006A4E]/30'
                    : 'bg-white text-gray-700 hover:bg-[#006A4E]/10 border-2 border-gray-200'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Split Screen */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Form */}
          <div className="space-y-6">
            {activeTab === 'assignment' && <AssignmentForm data={assignmentData} updateData={updateAssignment} />}
            {activeTab === 'labReport' && <LabReportForm data={labReportData} updateData={updateLabReport} />}
            {activeTab === 'labIndex' && (
              <LabIndexForm 
                data={labIndexData} 
                updateData={updateLabIndex}
                updateExperiment={updateExperiment}
                addExperiment={addExperiment}
                deleteExperiment={deleteExperiment}
              />
            )}
          </div>

          {/* RIGHT COLUMN - Live Preview (Sticky) */}
          <div className="lg:sticky lg:top-8 h-fit">
            <LivePreview 
              data={getCurrentData()} 
              activeTab={activeTab} 
              previewRef={previewRef}
              onDownload={handleDownloadPDF}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// REUSABLE COMPONENTS
// ============================================

// Person Details Form (Teacher & Student)
const PersonDetailsForm = ({ data, updateData, titleTeacher = "Teacher Details", titleStudent = "Student Details" }) => {
  return (
    <>
      {/* Teacher Details */}
      <FormSection title={titleTeacher} icon="👨‍🏫">
        <InputField
          label="Teacher Name"
          value={data.teacherName}
          onChange={(e) => updateData('teacherName', e.target.value)}
          placeholder="Dr. John Doe"
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Designation"
            value={data.teacherDesignation}
            onChange={(e) => updateData('teacherDesignation', e.target.value)}
            placeholder="Professor"
          />
          <InputField
            label="Department"
            value={data.teacherDept}
            onChange={(e) => updateData('teacherDept', e.target.value)}
            placeholder="Computer Science"
          />
        </div>
      </FormSection>

      {/* Student Details */}
      <FormSection title={titleStudent} icon="🎓">
        <InputField
          label="Student Name"
          value={data.studentName}
          onChange={(e) => updateData('studentName', e.target.value)}
          placeholder="Your Full Name"
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Student ID"
            value={data.studentId}
            onChange={(e) => updateData('studentId', e.target.value)}
            placeholder="C123456"
          />
          <InputField
            label="Section"
            value={data.section}
            onChange={(e) => updateData('section', e.target.value)}
            placeholder="A"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Semester"
            value={data.semester}
            onChange={(e) => updateData('semester', e.target.value)}
            placeholder="Spring 2026"
          />
          <InputField
            label="Department"
            value={data.studentDept}
            onChange={(e) => updateData('studentDept', e.target.value)}
            placeholder="CSE"
          />
        </div>
      </FormSection>
    </>
  );
};

// ============================================
// FORM COMPONENTS FOR EACH TAB
// ============================================

const AssignmentForm = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      {/* Assignment Details */}
      <FormSection title="Assignment Details" icon="📝">
        <InputField
          label="Assignment Title / Topic Name"
          value={data.assignmentTitle}
          onChange={(e) => updateData('assignmentTitle', e.target.value)}
          placeholder="Enter assignment topic"
        />
      </FormSection>

      {/* Course Details */}
      <FormSection title="Course Details" icon="📚">
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Course Code"
            value={data.courseCode}
            onChange={(e) => updateData('courseCode', e.target.value)}
            placeholder="CSE-101"
          />
          <InputField
            label="Course Title"
            value={data.courseTitle}
            onChange={(e) => updateData('courseTitle', e.target.value)}
            placeholder="Programming Fundamentals"
          />
        </div>
      </FormSection>

      {/* Reuse Person Details */}
      <PersonDetailsForm data={data} updateData={updateData} />

      {/* Submission Details */}
      <FormSection title="Submission Details" icon="📅">
        <InputField
          label="Submission Date"
          type="date"
          value={data.submissionDate}
          onChange={(e) => updateData('submissionDate', e.target.value)}
        />
      </FormSection>
    </div>
  );
};

const LabReportForm = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      {/* Experiment Details */}
      <FormSection title="Experiment Details" icon="🔬">
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Experiment No."
            value={data.experimentNo}
            onChange={(e) => updateData('experimentNo', e.target.value)}
            placeholder="01"
          />
          <InputField
            label="Experiment Name"
            value={data.experimentName}
            onChange={(e) => updateData('experimentName', e.target.value)}
            placeholder="Introduction to Arduino"
          />
        </div>
      </FormSection>

      {/* Course Details */}
      <FormSection title="Course Details" icon="📚">
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Course Code"
            value={data.courseCode}
            onChange={(e) => updateData('courseCode', e.target.value)}
            placeholder="CSE-101"
          />
          <InputField
            label="Course Title"
            value={data.courseTitle}
            onChange={(e) => updateData('courseTitle', e.target.value)}
            placeholder="Microprocessor Lab"
          />
        </div>
      </FormSection>

      {/* Reuse Person Details */}
      <PersonDetailsForm data={data} updateData={updateData} />

      {/* Submission Details */}
      <FormSection title="Submission Details" icon="📅">
        <InputField
          label="Submission Date"
          type="date"
          value={data.submissionDate}
          onChange={(e) => updateData('submissionDate', e.target.value)}
        />
      </FormSection>
    </div>
  );
};

const LabIndexForm = ({ data, updateData, updateExperiment, addExperiment, deleteExperiment }) => {
  return (
    <div className="space-y-6">
      {/* Course Details */}
      <FormSection title="Course Details" icon="📚">
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Course Code"
            value={data.courseCode}
            onChange={(e) => updateData('courseCode', e.target.value)}
            placeholder="CSE-101"
          />
          <InputField
            label="Course Title"
            value={data.courseTitle}
            onChange={(e) => updateData('courseTitle', e.target.value)}
            placeholder="Microprocessor Lab"
          />
        </div>
      </FormSection>

      {/* Student Details */}
      <FormSection title="Student Details" icon="🎓">
        <InputField
          label="Student Name"
          value={data.studentName}
          onChange={(e) => updateData('studentName', e.target.value)}
          placeholder="Your Full Name"
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Student ID"
            value={data.studentId}
            onChange={(e) => updateData('studentId', e.target.value)}
            placeholder="C123456"
          />
          <InputField
            label="Section"
            value={data.section}
            onChange={(e) => updateData('section', e.target.value)}
            placeholder="A"
          />
        </div>
      </FormSection>

      {/* Experiments List */}
      <FormSection title="Experiments List" icon="📋">
        <div className="space-y-4">
          {data.experiments.map((exp, index) => (
            <div key={index} className="bento-card p-4 relative">
              {/* Delete Button */}
              {data.experiments.length > 1 && (
                <button
                  onClick={() => deleteExperiment(index)}
                  className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete experiment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Exp. No."
                    value={exp.no}
                    onChange={(e) => updateExperiment(index, 'no', e.target.value)}
                    placeholder="01"
                    small
                  />
                  <InputField
                    label="Date"
                    type="date"
                    value={exp.date}
                    onChange={(e) => updateExperiment(index, 'date', e.target.value)}
                    small
                  />
                </div>
                <InputField
                  label="Experiment Name"
                  value={exp.name}
                  onChange={(e) => updateExperiment(index, 'name', e.target.value)}
                  placeholder="Enter experiment name"
                  small
                />
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Page No."
                    value={exp.pageNo}
                    onChange={(e) => updateExperiment(index, 'pageNo', e.target.value)}
                    placeholder="1"
                    small
                  />
                  <InputField
                    label="Remarks"
                    value={exp.remarks}
                    onChange={(e) => updateExperiment(index, 'remarks', e.target.value)}
                    placeholder="Optional"
                    small
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Experiment Button */}
          <button
            onClick={addExperiment}
            className="w-full py-3 border-2 border-dashed border-[#006A4E] text-[#006A4E] rounded-xl hover:bg-[#006A4E]/5 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Plus className="h-5 w-5" />
            Add Experiment
          </button>
        </div>
      </FormSection>
    </div>
  );
};

// ============================================
// UTILITY COMPONENTS
// ============================================

const FormSection = ({ title, icon, children }) => {
  return (
    <div className="bento-card p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-100">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = 'text', small = false }) => {
  return (
    <div>
      <label className={`block font-semibold text-gray-700 mb-2 ${small ? 'text-sm' : ''}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field w-full focus:ring-2 focus:ring-[#006A4E]/20 transition-all"
      />
    </div>
  );
};

// ============================================
// ASSIGNMENT COVER COMPONENT
// ============================================

const AssignmentCover = ({ data }) => {
  return (
    <div className="preview-wrapper">
      <style>
        {`
          .preview-wrapper * { margin: 0; padding: 0; box-sizing: border-box; }
          .preview-wrapper { font-family: 'Times New Roman', Times, serif; }
          .preview-wrapper .page { width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background: white; padding: 10mm; position: relative; margin: 0 auto; overflow: hidden; page-break-after: avoid; }
          .preview-wrapper .border-frame { border: 2px solid #1a1a50; height: 275mm; max-height: 275mm; padding: 15px 30px; position: relative; display: flex; flex-direction: column; overflow: hidden; }
          .preview-wrapper .watermark { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); width: 350px; opacity: 0.15; pointer-events: none; z-index: 0; }
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
              height: 297mm !important; 
              max-height: 297mm !important;
              min-height: 297mm !important;
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
            <div className="assignment-title">ASSIGNMENT</div>
            <div className="course-info-box">
              <div className="info-row">
                <div className="label">COURSE CODE</div>
                <div className="val">: {data.courseCode || '[COURSE_CODE]'}</div>
              </div>
              <div className="info-row">
                <div className="label">COURSE TITLE</div>
                <div className="val">: {data.courseTitle || '[COURSE_TITLE]'}</div>
              </div>
              <div className="info-row">
                <div className="label">TOPIC NAME</div>
                <div className="val">: {data.assignmentTitle || '[TOPIC_NAME]'}</div>
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
                <div>: {data.studentName || '[STUDENT_NAME]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">ID NO</div>
                <div>: {data.studentId || '[STUDENT_ID]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">SEMESTER</div>
                <div>: {data.semester || '[SEMESTER]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">SECTION</div>
                <div>: {data.section || '[SECTION]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">DEPARTMENT</div>
                <div>: {data.studentDept || '[DEPARTMENT]'}</div>
              </div>
            </div>
            <div className="footer-details">
              <div className="date">DATE OF SUBMISSION : {data.submissionDate || '[SUBMISSION_DATE]'}</div>
              <div className="remark-box">
                <span className="remark-text">REMARK:</span>
              </div>
            </div>
            <img src={footerImg} alt="Campus Image" className="campus-img" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// LAB REPORT COVER COMPONENT
// ============================================

const LabReportCover = ({ data }) => {
  return (
    <div className="preview-wrapper">
      <style>
        {`
          .preview-wrapper * { margin: 0; padding: 0; box-sizing: border-box; }
          .preview-wrapper { font-family: 'Times New Roman', Times, serif; }
          .preview-wrapper .page { width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background: white; padding: 10mm; position: relative; margin: 0 auto; overflow: hidden; page-break-after: avoid; }
          .preview-wrapper .border-frame { border: 2px solid #1a1a50; height: 275mm; max-height: 275mm; padding: 15px 30px; position: relative; display: flex; flex-direction: column; overflow: hidden; }
          .preview-wrapper .watermark { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); width: 350px; opacity: 0.15; pointer-events: none; z-index: 0; }
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
              height: 297mm !important; 
              max-height: 297mm !important;
              min-height: 297mm !important;
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
            
            {/* Experiment Details Box - NEW */}
            <div className="course-info-box">
              <div className="info-row">
                <div className="label">EXPERIMENT NO</div>
                <div className="val">: {data.experimentNo || '[EXPERIMENT_NO]'}</div>
              </div>
              <div className="info-row">
                <div className="label">EXPERIMENT NAME</div>
                <div className="val">: {data.experimentName || '[EXPERIMENT_NAME]'}</div>
              </div>
              <div className="info-row">
                <div className="label">COURSE CODE</div>
                <div className="val">: {data.courseCode || '[COURSE_CODE]'}</div>
              </div>
              <div className="info-row">
                <div className="label">COURSE TITLE</div>
                <div className="val">: {data.courseTitle || '[COURSE_TITLE]'}</div>
              </div>
            </div>
            
            {/* Course Details Box - Modified (removed TOPIC NAME) */}
            
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
                <div>: {data.studentName || '[STUDENT_NAME]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">ID NO</div>
                <div>: {data.studentId || '[STUDENT_ID]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">SEMESTER</div>
                <div>: {data.semester || '[SEMESTER]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">SECTION</div>
                <div>: {data.section || '[SECTION]'}</div>
              </div>
              <div className="student-row">
                <div className="student-label">DEPARTMENT</div>
                <div>: {data.studentDept || '[DEPARTMENT]'}</div>
              </div>
            </div>
            <div className="footer-details">
              <div className="date">DATE OF SUBMISSION : {data.submissionDate || '[SUBMISSION_DATE]'}</div>
              <div className="remark-box">
                <span className="remark-text">REMARK:</span>
              </div>
            </div>
            <img src={footerImg} alt="Campus Image" className="campus-img" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// LAB INDEX COMPONENT
// ============================================

const LabIndex = ({ data }) => {
  // Generate empty rows if no experiments or fill remaining rows
  const minRows = 10; // Minimum rows for handwriting space
  const experiments = data.experiments || [];
  const emptyRowsNeeded = Math.max(0, minRows - experiments.length);
  const emptyRows = Array(emptyRowsNeeded).fill(null);

  return (
    <div className="lab-index-wrapper">
      <style>
        {`
          .lab-index-wrapper * { margin: 0; padding: 0; box-sizing: border-box; }
          .lab-index-wrapper { font-family: 'Times New Roman', Times, serif; }
          .lab-index-wrapper .page { width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background: white; padding: 10mm; position: relative; margin: 0 auto; overflow: hidden; page-break-after: avoid; }
          .lab-index-wrapper .border-frame { border: 2px solid #1a1a50; height: 275mm; max-height: 275mm; padding: 15px 25px; position: relative; display: flex; flex-direction: column; overflow: hidden; }
          .lab-index-wrapper .content { display: flex; flex-direction: column; height: 100%; justify-content: space-between; }
          .lab-index-wrapper .header { text-align: center; margin-bottom: 20px; }
          .lab-index-wrapper .logo { width: 70px; height: auto; margin: 0 auto 10px auto; display: block; }
          .lab-index-wrapper .varsity-name-img { max-width: 60%; height: auto; display: block; margin: 0 auto; }
          .lab-index-wrapper .page-title { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 15px; margin-bottom: 20px; text-align: center; text-decoration: underline; }
          
          /* Student and Course Info */
          .lab-index-wrapper .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 0 10px; }
          .lab-index-wrapper .info-left, .lab-index-wrapper .info-right { flex: 1; }
          .lab-index-wrapper .info-line { display: flex; margin-bottom: 8px; font-size: 15px; }
          .lab-index-wrapper .info-label { font-weight: bold; width: 120px; flex-shrink: 0; }
          .lab-index-wrapper .info-value { flex: 1; }
          
          /* Table Styles */
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
          
          /* Footer */
          .lab-index-wrapper .footer { margin-top: 0; }
          .lab-index-wrapper .campus-img { width: 100%; height: 100px; object-fit: cover; border-radius: 2px; display: block; }
          
          @media print {
            .lab-index-wrapper .page { 
              width: 210mm; 
              height: 297mm !important; 
              max-height: 297mm !important;
              min-height: 297mm !important;
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
            {/* Header with Logo and University Name */}
            <div className="header">
              <img src={logoImg} alt="IIUC Logo" className="logo" />
              <img src={varsityNameImg} alt="University Name" className="varsity-name-img" />
            </div>
            
            {/* Page Title */}
            <div className="page-title">LAB REPORT INDEX</div>
            
            {/* Student and Course Information */}
            <div className="info-section">
              <div className="info-left">
                <div className="info-line">
                  <span className="info-label">NAME</span>
                  <span className="info-value">: {data.studentName || '[STUDENT_NAME]'}</span>
                </div>
                <div className="info-line">
                  <span className="info-label">ID NO</span>
                  <span className="info-value">: {data.studentId || '[STUDENT_ID]'}</span>
                </div>
                <div className="info-line">
                  <span className="info-label">SECTION</span>
                  <span className="info-value">: {data.section || '[SECTION]'}</span>
                </div>
              </div>
              <div className="info-right">
                <div className="info-line">
                  <span className="info-label">COURSE TITLE</span>
                  <span className="info-value">: {data.courseTitle || '[COURSE_TITLE]'}</span>
                </div>
                <div className="info-line">
                  <span className="info-label">COURSE CODE</span>
                  <span className="info-value">: {data.courseCode || '[COURSE_CODE]'}</span>
                </div>
              </div>
            </div>
            
            {/* Lab Report Table */}
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
                  {/* Render experiments from data */}
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
                  {/* Render empty rows for handwriting */}
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
            
            {/* Footer Image */}
            <div className="footer">
              <img src={footerImg} alt="Campus Image" className="campus-img" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// LIVE PREVIEW COMPONENT
// ============================================

const LivePreview = ({ data, activeTab, previewRef, onDownload }) => {
  // Create reference for the hidden full-size component
  const componentRef = useRef();

  // Download PDF directly using html2pdf.js
  const handleDownload = () => {
    const element = componentRef.current;
    
    if (!element) {
      toast.error('Unable to generate PDF. Please try again.');
      return;
    }
    
    toast.info('Generating PDF...');

    // Dynamic filename based on active tab
    const filePrefix = activeTab === 'assignment' ? 'Assignment' : 
                       activeTab === 'labReport' ? 'LabReport' : 
                       'LabIndex';

    const options = {
      margin: 0,
      filename: `${filePrefix}_${data.studentId || 'Cover'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save()
      .then(() => {
        toast.success('PDF downloaded successfully!');
      })
      .catch((error) => {
        console.error('PDF generation error:', error);
        toast.error('Failed to generate PDF. Please try again.');
      });
  };

  // Download JPG using html2canvas
  const handleDownloadJPG = async () => {
    const element = componentRef.current;
    
    if (!element) {
      toast.error('Unable to generate JPG. Please try again.');
      return;
    }

    toast.info('Generating JPG...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Helps with images
        backgroundColor: "#ffffff" // Ensure white background
      });

      const imageData = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');

      // Dynamic filename based on active tab
      const filePrefix = activeTab === 'assignment' ? 'Assignment' : 
                         activeTab === 'labReport' ? 'LabReport' : 
                         'LabIndex';

      if (typeof link.download === 'string') {
        link.href = imageData;
        link.download = `${filePrefix}_${data.studentId || 'Cover'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('JPG downloaded successfully!');
      } else {
        window.open(imageData);
      }
    } catch (error) {
      console.error('JPG generation error:', error);
      toast.error('Failed to generate JPG. Please try again.');
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case 'assignment':
        return 'Assignment Cover';
      case 'labReport':
        return 'Lab Report Cover';
      case 'labIndex':
        return 'Lab Index';
      default:
        return 'Preview';
    }
  };

  return (
    <div className="bento-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-[#006A4E]" />
          <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
        </div>
        <span className="px-3 py-1 bg-[#F3CF45]/20 text-[#004d38] rounded-lg text-sm font-semibold border border-[#F3CF45]/40">
          {getTabLabel()}
        </span>
      </div>

      {/* A4 Preview Container with Scaling (VISIBLE - Scaled down for viewing) */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-auto" style={{ height: '850px' }}>
          <div style={{ transform: 'scale(0.60)', transformOrigin: 'top left', width: '167%' }}>
            {activeTab === 'assignment' && <AssignmentCover data={data} />}
            {activeTab === 'labReport' && <LabReportCover data={data} />}
            {activeTab === 'labIndex' && <LabIndex data={data} />}
          </div>
        </div>
        
        {/* Download Buttons - PDF and JPG */}
        <div className="p-4 border-t-2 border-gray-200">
          <div className="flex gap-4">
            <button 
              onClick={handleDownload}
              className="flex-1 py-3 bg-gradient-to-r from-[#006A4E] to-[#00805d] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#006A4E]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!data || Object.keys(data).length === 0}
            >
              <Download className="h-5 w-5" />
              Download PDF
            </button>
            <button 
              onClick={handleDownloadJPG}
              className="flex-1 py-3 bg-white text-[#006A4E] border-2 border-[#006A4E] rounded-xl font-bold hover:bg-[#006A4E]/5 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!data || Object.keys(data).length === 0}
            >
              <Download className="h-5 w-5" />
              Download JPG
            </button>
          </div>
        </div>
      </div>

      {/* HIDDEN FULL-SIZE PRINT COMPONENT - Positioned off-screen for html2pdf.js */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={componentRef}>
          {activeTab === 'assignment' && <AssignmentCover data={data} />}
          {activeTab === 'labReport' && <LabReportCover data={data} />}
          {activeTab === 'labIndex' && <LabIndex data={data} />}
        </div>
      </div>
    </div>
  );
};

export default Create;
