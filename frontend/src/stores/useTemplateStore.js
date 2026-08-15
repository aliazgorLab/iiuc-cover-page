import { create } from 'zustand';
import { API_BASE_URL } from '../config/apiConfig';

export const useTemplateStore = create((set) => ({
  templates: [
    {
      _id: 'default-assignment',
      name: 'Official IIUC Assignment Cover',
      slug: 'assignment',
      type: 'ASSIGNMENT',
      description: 'Official IIUC assignment cover page layout with topic title, course matrix, and faculty box.',
      department: 'All Departments',
      isDefault: true,
    },
    {
      _id: 'default-lab-report',
      name: 'Standard IIUC Lab Report Cover',
      slug: 'lab-report',
      type: 'LAB_REPORT',
      description: 'Standard lab report cover template featuring experiment number, title, course code, and supervisor details.',
      department: 'All Departments',
      isDefault: true,
    },
    {
      _id: 'default-lab-index',
      name: 'Standard IIUC Lab Index Matrix',
      slug: 'lab-index',
      type: 'LAB_INDEX',
      description: 'Lab index table matrix padded with minimum 10 auto-padded rows for experiment dates, marks, and faculty signatures.',
      department: 'All Departments',
      isDefault: true,
    },
    {
      _id: 'default-project',
      name: 'Standard IIUC Group Project Cover',
      slug: 'project',
      type: 'PROJECT',
      description: 'Multi-member flexbox grid project report cover supporting team projects with 1 to 4 students.',
      department: 'All Departments',
      isDefault: true,
    },
  ],
  isLoading: false,
  selectedTemplate: 'assignment',

  setSelectedTemplate: (id) => set({ selectedTemplate: id }),

  fetchTemplates: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/templates`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          set({ templates: data });
        }
      }
    } catch (err) {
      // Use default fallback templates
    } finally {
      set({ isLoading: false });
    }
  },
}));
