import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import FormInput from '../../../components/FormInput';
import CourseSelector from '../../../components/CourseSelector';
import TeacherSelector from '../../../components/TeacherSelector';
import AcademicInfoToggle from '../../../components/AcademicInfoToggle';
import { useCoverStore } from '../../../stores/useCoverStore';

export const ProjectForm = () => {
  const {
    projectData,
    updateProject,
    groupMembers,
    handleMemberChange,
    addMember,
    removeMember,
    isGuest,
    setIsGuest,
  } = useCoverStore();

  const handleSyncProfileToForm = (info) => {
    if (info.studentName !== undefined) handleMemberChange(0, 'name', info.studentName);
    if (info.studentId !== undefined) handleMemberChange(0, 'id', info.studentId);
    if (info.department !== undefined) updateProject('departmentName', info.department);
    if (info.section !== undefined) updateProject('section', info.section);
    if (info.semester !== undefined) updateProject('semester', info.semester);
  };

  return (
    <div className="space-y-6">
      {/* Project Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-bold text-gray-900">Project Details</h3>
        </div>
        <FormInput
          label="Project Title"
          value={projectData.projectTitle}
          onChange={(e) => updateProject('projectTitle', e.target.value)}
          placeholder="Enter project title"
        />
      </div>

      {/* Course Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">📚</span>
          <h3 className="text-lg font-bold text-gray-900">Course Details</h3>
        </div>
        <CourseSelector
          courseCode={projectData.courseCode}
          courseTitle={projectData.courseTitle}
          onUpdateField={updateProject}
        />
      </div>

      {/* Teacher Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">👨‍🏫</span>
          <h3 className="text-lg font-bold text-gray-900">Teacher Details</h3>
        </div>
        <TeacherSelector
          teacherName={projectData.teacherName}
          teacherDesignation={projectData.teacherDesignation}
          teacherDept={projectData.teacherDept}
          isGuest={isGuest}
          onUpdateField={updateProject}
          onToggleGuest={setIsGuest}
        />
      </div>

      {/* Group Members Section (Up to 4 Members) */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <span className="text-2xl">👥</span>
          <h3 className="text-lg font-bold text-gray-900">
            Group Members ({groupMembers.length}/4)
          </h3>
        </div>

        <AcademicInfoToggle onSyncToForm={handleSyncProfileToForm} />
        <div className="space-y-4">
          {groupMembers.map((member, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
              {groupMembers.length > 1 && (
                <button
                  onClick={() => removeMember(index)}
                  className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                  title="Remove member"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#006A4E] uppercase tracking-wider">
                  Member {index + 1}
                </div>
                <FormInput
                  label="Member Name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                  placeholder="Student Full Name"
                  small
                />
                <FormInput
                  label="Student ID"
                  value={member.id}
                  onChange={(e) => handleMemberChange(index, 'id', e.target.value)}
                  placeholder="C123456"
                  small
                />
              </div>
            </div>
          ))}

          <button
            onClick={addMember}
            disabled={groupMembers.length >= 4}
            className="w-full py-3 border-2 border-dashed border-[#006A4E] text-[#006A4E] rounded-xl hover:bg-[#006A4E]/5 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Add Group Member {groupMembers.length >= 4 && '(Max 4 Reached)'}
          </button>
        </div>
      </div>

      {/* Department & Date Details */}
      <div className="bento-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-2xl">🏛️</span>
          <h3 className="text-lg font-bold text-gray-900">Department & Submission</h3>
        </div>
        <div className="space-y-4">
          <FormInput
            label="Department Name"
            value={projectData.departmentName}
            onChange={(e) => updateProject('departmentName', e.target.value)}
            placeholder="Department of Computer Science and Engineering"
          />
          <FormInput
            label="Date of Submission"
            type="date"
            value={projectData.date}
            onChange={(e) => updateProject('date', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
