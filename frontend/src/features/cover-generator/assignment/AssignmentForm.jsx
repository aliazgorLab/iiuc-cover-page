import React from 'react';
import FormInput from '../../../components/FormInput';
import CourseSelector from '../../../components/CourseSelector';
import TeacherSelector from '../../../components/TeacherSelector';
import AcademicInfoToggle from '../../../components/AcademicInfoToggle';
import { useCoverStore } from '../../../stores/useCoverStore';

export const AssignmentForm = () => {
  const {
    assignmentData,
    updateAssignment,
    isGuest,
    setIsGuest,
  } = useCoverStore();

  const handleSyncProfileToForm = (info) => {
    if (info.studentName !== undefined) updateAssignment('studentName', info.studentName);
    if (info.studentId !== undefined) updateAssignment('studentId', info.studentId);
    if (info.department !== undefined) updateAssignment('studentDept', info.department);
    if (info.section !== undefined) updateAssignment('section', info.section);
    if (info.semester !== undefined) updateAssignment('semester', info.semester);
  };

  return (
    <div className="space-y-6">
      {/* Assignment Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-bold text-gray-900">Assignment Details</h3>
        </div>
        <FormInput
          label="Assignment Title / Topic Name"
          value={assignmentData.assignmentTitle}
          onChange={(e) => updateAssignment('assignmentTitle', e.target.value)}
          placeholder="Enter assignment topic / title"
        />
      </div>

      {/* Course Details with Auto-Suggest */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">📚</span>
          <h3 className="text-lg font-bold text-gray-900">Course Details</h3>
        </div>
        <CourseSelector
          courseCode={assignmentData.courseCode}
          courseTitle={assignmentData.courseTitle}
          onUpdateField={updateAssignment}
        />
      </div>

      {/* Teacher Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">👨‍🏫</span>
          <h3 className="text-lg font-bold text-gray-900">Teacher Details</h3>
        </div>
        <TeacherSelector
          teacherName={assignmentData.teacherName}
          teacherDesignation={assignmentData.teacherDesignation}
          teacherDept={assignmentData.teacherDept}
          isGuest={isGuest}
          onUpdateField={updateAssignment}
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
            value={assignmentData.studentName}
            onChange={(e) => updateAssignment('studentName', e.target.value)}
            placeholder="Your Full Name"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="Student ID"
              value={assignmentData.studentId}
              onChange={(e) => updateAssignment('studentId', e.target.value)}
              placeholder="C123456"
            />
            <FormInput
              label="Section"
              value={assignmentData.section}
              onChange={(e) => updateAssignment('section', e.target.value)}
              placeholder="A"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="Semester"
              value={assignmentData.semester}
              onChange={(e) => updateAssignment('semester', e.target.value)}
              placeholder="8th"
            />
            <FormInput
              label="Department"
              value={assignmentData.studentDept}
              onChange={(e) => updateAssignment('studentDept', e.target.value)}
              placeholder="CSE"
            />
          </div>
          <FormInput
            label="Date of Submission"
            type="date"
            value={assignmentData.submissionDate}
            onChange={(e) => updateAssignment('submissionDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;
