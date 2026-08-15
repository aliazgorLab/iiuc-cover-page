import React from 'react';
import FormInput from '../../../components/FormInput';
import CourseSelector from '../../../components/CourseSelector';
import TeacherSelector from '../../../components/TeacherSelector';
import AcademicInfoToggle from '../../../components/AcademicInfoToggle';
import { useCoverStore } from '../../../stores/useCoverStore';

export const LabReportForm = () => {
  const {
    labReportData,
    updateLabReport,
    isGuest,
    setIsGuest,
  } = useCoverStore();

  const handleSyncProfileToForm = (info) => {
    if (info.studentName !== undefined) updateLabReport('studentName', info.studentName);
    if (info.studentId !== undefined) updateLabReport('studentId', info.studentId);
    if (info.department !== undefined) updateLabReport('studentDept', info.department);
    if (info.section !== undefined) updateLabReport('section', info.section);
    if (info.semester !== undefined) updateLabReport('semester', info.semester);
  };

  return (
    <div className="space-y-6">
      {/* Experiment Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">🔬</span>
          <h3 className="text-lg font-bold text-gray-900">Experiment Details</h3>
        </div>
        <div className="space-y-4">
          <FormInput
            label="Experiment No."
            value={labReportData.experimentNo}
            onChange={(e) => updateLabReport('experimentNo', e.target.value)}
            placeholder="e.g., 01"
          />
          <FormInput
            label="Experiment Name / Topic"
            value={labReportData.experimentName}
            onChange={(e) => updateLabReport('experimentName', e.target.value)}
            placeholder="Enter experiment name"
          />
        </div>
      </div>

      {/* Course Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">📚</span>
          <h3 className="text-lg font-bold text-gray-900">Course Details</h3>
        </div>
        <CourseSelector
          courseCode={labReportData.courseCode}
          courseTitle={labReportData.courseTitle}
          onUpdateField={updateLabReport}
        />
      </div>

      {/* Teacher Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">👨‍🏫</span>
          <h3 className="text-lg font-bold text-gray-900">Teacher Details</h3>
        </div>
        <TeacherSelector
          teacherName={labReportData.teacherName}
          teacherDesignation={labReportData.teacherDesignation}
          teacherDept={labReportData.teacherDept}
          isGuest={isGuest}
          onUpdateField={updateLabReport}
          onToggleGuest={setIsGuest}
        />
      </div>

      {/* Student Details */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <span className="text-2xl">🎓</span>
          <h3 className="text-lg font-bold text-gray-900">Student Details</h3>
        </div>

        <AcademicInfoToggle onSyncToForm={handleSyncProfileToForm} />
        <div className="space-y-4">
          <FormInput
            label="Student Name"
            value={labReportData.studentName}
            onChange={(e) => updateLabReport('studentName', e.target.value)}
            placeholder="Your Full Name"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="Student ID"
              value={labReportData.studentId}
              onChange={(e) => updateLabReport('studentId', e.target.value)}
              placeholder="C123456"
            />
            <FormInput
              label="Section"
              value={labReportData.section}
              onChange={(e) => updateLabReport('section', e.target.value)}
              placeholder="A"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="Semester"
              value={labReportData.semester}
              onChange={(e) => updateLabReport('semester', e.target.value)}
              placeholder="8th"
            />
            <FormInput
              label="Department"
              value={labReportData.studentDept}
              onChange={(e) => updateLabReport('studentDept', e.target.value)}
              placeholder="CSE"
            />
          </div>
          <FormInput
            label="Date of Submission"
            type="date"
            value={labReportData.submissionDate}
            onChange={(e) => updateLabReport('submissionDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default LabReportForm;
