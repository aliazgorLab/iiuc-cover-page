/**
 * Form validator for cover page templates
 */
export const validateCoverForm = (activeTab, data) => {
  if (!data) return { isValid: false, message: 'No form data available.' };

  if (activeTab === 'project') {
    if (!data.courseCode || !data.courseTitle || !data.projectTitle) {
      return {
        isValid: false,
        message: 'Please fill in required fields: Course Code, Course Title, and Project Title!',
      };
    }
    if (!data.teacherName) {
      return { isValid: false, message: 'Please fill in Teacher Name!' };
    }
    if (!data.departmentName) {
      return { isValid: false, message: 'Please fill in Department Name!' };
    }
    if (!data.groupMembers || data.groupMembers.length === 0) {
      return { isValid: false, message: 'Please add at least one group member!' };
    }
    const hasValidMember = data.groupMembers.some(
      (member) => member.name && member.id
    );
    if (!hasValidMember) {
      return {
        isValid: false,
        message: 'Please fill in Name and ID for at least one group member!',
      };
    }
    return { isValid: true, message: '' };
  }

  // Student details validation for non-project templates
  if (!data.studentName || !data.studentId) {
    return { isValid: false, message: 'Please fill in Student Name and Student ID!' };
  }

  if (activeTab === 'assignment') {
    if (!data.courseCode || !data.courseTitle || !data.assignmentTitle) {
      return {
        isValid: false,
        message: 'Please fill in required fields: Course Code, Course Title, and Assignment Title!',
      };
    }
    if (!data.teacherName) {
      return { isValid: false, message: 'Please fill in Teacher Name!' };
    }
  } else if (activeTab === 'labReport') {
    if (!data.courseCode || !data.courseTitle) {
      return { isValid: false, message: 'Please fill in Course Code and Course Title!' };
    }
    if (!data.experimentNo || !data.experimentName) {
      return { isValid: false, message: 'Please fill in Experiment No and Experiment Name!' };
    }
    if (!data.teacherName) {
      return { isValid: false, message: 'Please fill in Teacher Name!' };
    }
  } else if (activeTab === 'labIndex') {
    if (!data.courseCode || !data.courseTitle) {
      return { isValid: false, message: 'Please fill in Course Code and Course Title!' };
    }
    if (!data.section) {
      return { isValid: false, message: 'Please fill in Section!' };
    }
  }

  return { isValid: true, message: '' };
};
