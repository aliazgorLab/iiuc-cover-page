const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').trim();
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

export const API_BASE_URL = getApiBaseUrl();

