import { create } from 'zustand';

const initialAssignment = {
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
};

const initialLabReport = {
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
};

const initialLabIndex = {
  courseCode: '',
  courseTitle: '',
  studentName: '',
  studentId: '',
  section: '',
  experiments: [{ no: '', date: '', name: '' }],
};

const initialProject = {
  projectTitle: '',
  courseCode: '',
  courseTitle: '',
  teacherName: '',
  teacherDesignation: '',
  teacherDept: '',
  date: '',
  departmentName: '',
};

export const useCoverStore = create((set, get) => ({
  activeTab: 'assignment', // assignment, labReport, labIndex, project
  assignmentVersion: 'v1', // 'v1' | 'v2' — template version switcher
  error: '',
  autoSaved: false,

  // Smart PDF Attachment
  attachedPdf: null, // { file, name, size, pages }
  setAttachedPdf: (pdf) => set({ attachedPdf: pdf }),
  removeAttachedPdf: () => set({ attachedPdf: null }),

  // Centralized Student Academic Profile Auto-Fill State
  studentInfo: { name: '', id: '', department: '', section: '' },
  useSavedInfo: true,
  setUseSavedInfo: (val) => set({ useSavedInfo: val }),
  setStudentInfo: (info) => set({ studentInfo: { ...info } }),

  // Guest Teacher toggle & search states
  isGuest: false,
  teacherSuggestions: [],
  showTeacherSuggestions: false,

  // Course search states
  courseSuggestions: [],
  showCourseSuggestions: false,
  activeCourseField: '', // 'code' or 'title'

  // Forms
  assignmentData: { ...initialAssignment },
  labReportData: { ...initialLabReport },
  labIndexData: { ...initialLabIndex },
  projectData: { ...initialProject },
  groupMembers: [{ name: '', id: '' }],

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab, error: '' }),
  setAssignmentVersion: (ver) => set({ assignmentVersion: ver }),
  setError: (msg) => set({ error: msg }),
  setAutoSaved: (val) => set({ autoSaved: val }),
  setIsGuest: (val) => set({ isGuest: val }),

  setTeacherSuggestions: (list, show) =>
    set({ teacherSuggestions: list, showTeacherSuggestions: show }),
  setCourseSuggestions: (list, show, field = '') =>
    set({
      courseSuggestions: list,
      showCourseSuggestions: show,
      activeCourseField: field,
    }),

  updateAssignment: (field, value) =>
    set((state) => ({
      assignmentData: { ...state.assignmentData, [field]: value },
    })),

  updateLabReport: (field, value) =>
    set((state) => ({
      labReportData: { ...state.labReportData, [field]: value },
    })),

  updateLabIndex: (field, value) =>
    set((state) => ({
      labIndexData: { ...state.labIndexData, [field]: value },
    })),

  updateExperiment: (index, field, value) =>
    set((state) => ({
      labIndexData: {
        ...state.labIndexData,
        experiments: state.labIndexData.experiments.map((exp, i) =>
          i === index ? { ...exp, [field]: value } : exp
        ),
      },
    })),

  addExperiment: () =>
    set((state) => ({
      labIndexData: {
        ...state.labIndexData,
        experiments: [
          ...state.labIndexData.experiments,
          { no: '', date: '', name: '' },
        ],
      },
    })),

  deleteExperiment: (index) =>
    set((state) => ({
      labIndexData: {
        ...state.labIndexData,
        experiments: state.labIndexData.experiments.filter((_, i) => i !== index),
      },
    })),

  setExperiments: (experiments) =>
    set((state) => ({
      labIndexData: { ...state.labIndexData, experiments },
    })),

  mergeExperiments: (importedList) =>
    set((state) => {
      const existing = state.labIndexData.experiments || [];
      const expMap = new Map();

      for (const item of existing) {
        if (item.no || item.name) {
          const key = (item.no || item.name).trim().toLowerCase();
          expMap.set(key, { ...item });
        }
      }

      for (const item of importedList) {
        const key = (item.number || item.no || item.name || '').trim().toLowerCase();
        if (key && !expMap.has(key)) {
          expMap.set(key, {
            no: item.number || item.no || '01',
            date: item.date || '',
            name: item.name || '',
          });
        }
      }

      const merged = Array.from(expMap.values());
      return {
        labIndexData: {
          ...state.labIndexData,
          experiments: merged.length > 0 ? merged : existing,
        },
      };
    }),

  updateProject: (field, value) =>
    set((state) => ({
      projectData: { ...state.projectData, [field]: value },
    })),

  handleMemberChange: (index, field, value) =>
    set((state) => ({
      groupMembers: state.groupMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    })),

  addMember: () =>
    set((state) => {
      if (state.groupMembers.length < 4) {
        return {
          groupMembers: [...state.groupMembers, { name: '', id: '' }],
        };
      }
      return state;
    }),

  removeMember: (index) =>
    set((state) => {
      if (state.groupMembers.length > 1) {
        return {
          groupMembers: state.groupMembers.filter((_, i) => i !== index),
        };
      }
      return state;
    }),

  // Hydrate Profile into active tab forms directly from student academic profile
  hydrateProfile: (profile) => {
    if (!profile) return;
    const { name, studentName, studentId, department, departmentName, section, semester } = profile;
    const sName = studentName ?? name ?? '';
    const sId = studentId ?? '';
    const sDept = department ?? departmentName ?? '';
    const sSec = section ?? '';
    const sSem = semester ?? '';

    set((state) => ({
      assignmentData: {
        ...state.assignmentData,
        studentName: sName,
        studentId: sId,
        studentDept: sDept,
        section: sSec,
        semester: sSem,
      },
      labReportData: {
        ...state.labReportData,
        studentName: sName,
        studentId: sId,
        studentDept: sDept,
        section: sSec,
        semester: sSem,
      },
      labIndexData: {
        ...state.labIndexData,
        studentName: sName,
        studentId: sId,
        section: sSec,
        semester: sSem,
      },
      projectData: {
        ...state.projectData,
        departmentName: sDept,
        section: sSec,
        semester: sSem,
      },
      groupMembers: [
        {
          name: sName,
          id: sId,
        },
        ...state.groupMembers.slice(1),
      ],
    }));
  },

  getCurrentData: () => {
    const state = get();
    switch (state.activeTab) {
      case 'assignment':
        return state.assignmentData;
      case 'labReport':
        return state.labReportData;
      case 'labIndex':
        return state.labIndexData;
      case 'project':
        return { ...state.projectData, groupMembers: state.groupMembers };
      default:
        return {};
    }
  },
}));
