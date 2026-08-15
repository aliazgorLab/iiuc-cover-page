import { apiClient } from './apiClient';

export const fetchCourses = async (query = '', field = '') => {
  try {
    const data = await apiClient(
      `/courses?query=${encodeURIComponent(query || '')}&field=${field}`
    );
    return Array.isArray(data) ? data : (data?.courses || data?.data || []);
  } catch (error) {
    console.warn('Error fetching courses from API:', error);
    return [];
  }
};

export const fetchCourseById = async (id) => {
  try {
    const data = await apiClient(`/courses/${id}`);
    return data;
  } catch (error) {
    console.warn(`Error fetching course ${id}:`, error);
    return null;
  }
};
