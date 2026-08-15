import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useCoverStore } from '../stores/useCoverStore';

import { API_BASE_URL as API } from '../config/apiConfig';


export const useStudentAcademicInfo = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { useSavedInfo, setUseSavedInfo, setStudentInfo, hydrateProfile } = useCoverStore();

  const getProfileObject = useCallback((sourceUser) => {
    const info = sourceUser?.academicInfo || {};
    return {
      name: info.name || sourceUser?.name || '',
      studentId: info.studentId || sourceUser?.studentId || '',
      department: info.department || sourceUser?.department || '',
      section: info.section || sourceUser?.section || '',
      semester: info.semester || sourceUser?.semester || '',
      batch: info.batch || sourceUser?.batch || '',
    };
  }, []);

  const [academicInfo, setAcademicInfo] = useState(() => getProfileObject(user));
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudentProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        const info = json?.academicInfo || json?.data?.academicInfo || json?.data;
        if (info) {
          const formatted = {
            name: info.name || user?.name || '',
            studentId: info.studentId || user?.studentId || '',
            department: info.department || user?.department || '',
            section: info.section || user?.section || '',
            semester: info.semester || user?.semester || '',
            batch: info.batch || user?.batch || '',
          };

          setAcademicInfo(formatted);
          setStudentInfo(formatted);

          if (useSavedInfo) {
            hydrateProfile({
              name: formatted.name,
              studentName: formatted.name,
              studentId: formatted.studentId,
              department: formatted.department,
              departmentName: formatted.department,
              section: formatted.section,
              semester: formatted.semester,
            });
          }
        }
      }
    } catch (err) {
      console.warn('[useStudentAcademicInfo] Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, useSavedInfo, user, getProfileObject, setStudentInfo, hydrateProfile]);

  useEffect(() => {
    if (user) {
      const formatted = getProfileObject(user);
      setAcademicInfo(formatted);
      setStudentInfo(formatted);
      if (useSavedInfo) {
        hydrateProfile({
          name: formatted.name,
          studentName: formatted.name,
          studentId: formatted.studentId,
          department: formatted.department,
          departmentName: formatted.department,
          section: formatted.section,
          semester: formatted.semester,
        });
      }
    }
    fetchStudentProfile();
  }, [user, fetchStudentProfile, getProfileObject, hydrateProfile, setStudentInfo, useSavedInfo]);

  const isSaved = Boolean(academicInfo.name || academicInfo.studentId);

  return {
    studentName: academicInfo.name,
    studentId: academicInfo.studentId,
    department: academicInfo.department,
    section: academicInfo.section,
    semester: academicInfo.semester,
    batch: academicInfo.batch,
    academicInfo,
    isSaved,
    isLoading,
    useSavedInfo,
    setUseSavedInfo,
    refetch: fetchStudentProfile,
  };
};

export default useStudentAcademicInfo;
