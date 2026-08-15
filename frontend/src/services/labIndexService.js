import { apiClient } from './apiClient';

export const importPreviousLabData = async (courseCode) => {
  if (!courseCode) {
    throw new Error('Course code is required');
  }

  const encodedCode = encodeURIComponent(courseCode.trim());
  const data = await apiClient(`/lab-index/import/${encodedCode}`);
  return data?.experiments || [];
};

export const fetchOfficialLabTemplate = async (courseCode) => {
  if (!courseCode) return null;
  try {
    const encodedCode = encodeURIComponent(courseCode.trim());
    const data = await apiClient(`/lab-experiments/${encodedCode}`);
    if (data?.templateFound) {
      return data;
    }
    return null;
  } catch (err) {
    return null;
  }
};
