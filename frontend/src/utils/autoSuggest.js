import { fetchTeachers } from '../services/teacherService';
import { fetchCourses } from '../services/courseService';

/**
 * Filter teachers by name query via API
 */
export const filterTeachers = async (query) => {
  if (!query || !query.trim()) return [];
  return await fetchTeachers(query);
};

/**
 * Filter courses by code or title query via API
 */
export const filterCoursesByCode = async (query) => {
  if (!query || !query.trim()) return [];
  return await fetchCourses(query, 'code');
};

export const filterCoursesByTitle = async (query) => {
  if (!query || !query.trim()) return [];
  return await fetchCourses(query, 'title');
};
