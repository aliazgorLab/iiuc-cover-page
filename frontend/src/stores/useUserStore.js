import { create } from 'zustand';

export const useUserStore = create((set, get) => ({
  studentName: localStorage.getItem('studentName') || '',
  studentId: localStorage.getItem('studentID') || '',
  departmentName: localStorage.getItem('departmentName') || '',

  setStudentProfile: (name, id, dept) => {
    localStorage.setItem('studentName', name || '');
    localStorage.setItem('studentID', id || '');
    localStorage.setItem('departmentName', dept || '');
    set({
      studentName: name || '',
      studentId: id || '',
      departmentName: dept || '',
    });
  },

  updateField: (field, value) => {
    const keyMap = {
      studentName: 'studentName',
      studentId: 'studentID',
      departmentName: 'departmentName',
    };
    if (keyMap[field]) {
      localStorage.setItem(keyMap[field], value || '');
    }
    set({ [field]: value });
  },
}));
