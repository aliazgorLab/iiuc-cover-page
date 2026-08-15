import { apiClient } from './apiClient';

export const fetchTeachers = async (query = '') => {
  try {
    const data = await apiClient(`/teachers?query=${encodeURIComponent(query || '')}`);
    return Array.isArray(data) ? data : (data?.teachers || data?.data?.teachers || []);
  } catch (error) {
    console.warn('Error fetching teachers from API:', error);
    return [];
  }
};

export const fetchTeacherById = async (id) => {
  try {
    const data = await apiClient(`/teachers/${id}`);
    return data;
  } catch (error) {
    console.warn(`Error fetching teacher ${id}:`, error);
    return null;
  }
};
