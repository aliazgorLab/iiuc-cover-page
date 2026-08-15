import { apiClient } from './apiClient';

export const saveLabIndex = async (payload) => {
  return await apiClient('/lab-index-records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getLabIndex = async (courseCode) => {
  if (!courseCode) return null;
  try {
    const encoded = encodeURIComponent(courseCode.trim());
    const data = await apiClient(`/lab-index-records/${encoded}`);
    if (data?.recordFound) {
      return data.record;
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const updateLabIndex = async (id, payload) => {
  return await apiClient(`/lab-index-records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteLabIndex = async (id) => {
  return await apiClient(`/lab-index-records/${id}`, {
    method: 'DELETE',
  });
};

export const getAllUserLabIndexRecords = async () => {
  try {
    const data = await apiClient('/lab-index-records/user/all');
    return data?.records || [];
  } catch (err) {
    return [];
  }
};
