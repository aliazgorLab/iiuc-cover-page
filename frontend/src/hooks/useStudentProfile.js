import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useCoverStore } from '../stores/useCoverStore';
import { API_BASE_URL as API } from '../config/apiConfig';

export const useStudentProfile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { useSavedInfo, setUseSavedInfo, setStudentInfo, hydrateProfile } = useCoverStore();

  const getProfileObject = useCallback((sourceUser) => {
    const info = sourceUser?.academicProfile || sourceUser?.academicInfo || {};
    return {
      studentName: info.studentName || info.name || sourceUser?.name || '',
      studentId: info.studentId || sourceUser?.studentId || '',
      department: info.department || sourceUser?.department || '',
      section: info.section || sourceUser?.section || '',
      semester: info.semester || sourceUser?.semester || '',
      batch: info.batch || sourceUser?.batch || '',
    };
  }, []);

  const [profile, setProfile] = useState(() => getProfileObject(user));
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
        const info = json?.academicProfile || json?.academicInfo || json;
        if (info) {
          const formatted = {
            studentName: info.studentName || info.name || user?.name || '',
            studentId: info.studentId || user?.studentId || '',
            department: info.department || user?.department || '',
            section: info.section || user?.section || '',
            semester: info.semester || user?.semester || '',
            batch: info.batch || user?.batch || '',
          };

          setProfile(formatted);
          setStudentInfo({
            name: formatted.studentName,
            id: formatted.studentId,
            department: formatted.department,
            section: formatted.section,
            semester: formatted.semester,
            batch: formatted.batch,
          });

          if (useSavedInfo) {
            hydrateProfile({
              name: formatted.studentName,
              studentName: formatted.studentName,
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
      console.warn('[useStudentProfile] Profile fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, useSavedInfo, user, getProfileObject, setStudentInfo, hydrateProfile]);

  useEffect(() => {
    if (user && isAuthenticated) {
      const formatted = getProfileObject(user);
      setProfile(formatted);
      setStudentInfo({
        name: formatted.studentName,
        id: formatted.studentId,
        department: formatted.department,
        section: formatted.section,
        semester: formatted.semester,
        batch: formatted.batch,
      });
      if (useSavedInfo) {
        hydrateProfile({
          name: formatted.studentName,
          studentName: formatted.studentName,
          studentId: formatted.studentId,
          department: formatted.department,
          departmentName: formatted.department,
          section: formatted.section,
          semester: formatted.semester,
        });
      }
      fetchStudentProfile();
    } else {
      const empty = { studentName: '', studentId: '', department: '', section: '', semester: '', batch: '' };
      setProfile(empty);
    }
  }, [user, isAuthenticated, fetchStudentProfile, getProfileObject, hydrateProfile, setStudentInfo, useSavedInfo]);

  const isSaved = Boolean(
    profile.studentName &&
    profile.studentId &&
    profile.department
  );

  return {
    studentName: profile.studentName,
    studentId: profile.studentId,
    department: profile.department,
    section: profile.section,
    semester: profile.semester,
    batch: profile.batch,
    academicProfile: profile,
    academicInfo: profile,
    isSaved,
    isLoading,
    useSavedInfo,
    setUseSavedInfo,
    refetch: fetchStudentProfile,
  };
};

export default useStudentProfile;
