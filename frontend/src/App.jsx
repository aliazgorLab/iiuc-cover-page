import { useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Create from './pages/Create';
import TemplatesPage from './pages/TemplatesPage';
import Guideline from './pages/Guideline';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import Presentation from './pages/Presentation';
import LoginPage from './pages/LoginPage';
import AdminRoute from './components/AdminRoute';
import DevAuthDiagnostic from './components/ui/DevAuthDiagnostic';
import VersionUpdateModal from './components/ui/VersionUpdateModal';
import { useAuthStore } from './stores/useAuthStore';

// Student Dashboard imports
import DashboardLayout from './features/dashboard/DashboardLayout';
import StudentDashboard from './features/dashboard/StudentDashboard';
import ProfileView from './features/dashboard/ProfileView';
import CoverHistory from './features/dashboard/CoverHistory';
import StudentLabIndexHistory from './features/dashboard/StudentLabIndexHistory';
import TemplateGallery from './features/templates/TemplateGallery';

// Admin Portal imports
import AdminLayout from './features/admin/AdminLayout';
import AdminOverview from './features/admin/dashboard/AdminOverview';
import StudentManagement from './features/admin/students/StudentManagement';
import StudentDetails from './features/admin/students/StudentDetails';
import TeacherManagement from './features/admin/teachers/TeacherManagement';
import TeacherDetails from './features/admin/teachers/TeacherDetails';
import CourseManagement from './features/admin/courses/CourseManagement';
import DepartmentManagement from './features/admin/departments/DepartmentManagement';
import TemplateManagement from './features/admin/templates/TemplateManagement';
import LabTemplateManagement from './features/admin/lab-templates/LabTemplateManagement';
import ActivityLog from './features/admin/ActivityLog';
import AdminAnalytics from './features/admin/analytics/AdminAnalytics';
import AdminSettings from './features/admin/settings/AdminSettings';
import AdminProfile from './features/admin/profile/AdminProfile';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <DevAuthDiagnostic />
      <VersionUpdateModal />
      <Routes>
        <Route path="/presentation" element={<Presentation />} />

        {/* ── PUBLIC PAGES ──────────────────────────── */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="create" element={<Create />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="guideline" element={<Guideline />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* ── STUDENT DASHBOARD ─────────────────────── */}
        <Route path="/dashboard" element={<MainLayout />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="complete-profile" element={<Navigate to="/dashboard/profile" replace />} />
            <Route path="history" element={<CoverHistory />} />
            <Route path="lab-index-history" element={<StudentLabIndexHistory />} />
            <Route path="templates" element={<TemplateGallery />} />
          </Route>
        </Route>

        {/* ── ADMIN PORTAL (/admin/*) ───────────────── */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="students/:id" element={<StudentDetails />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="teachers/:id" element={<TeacherDetails />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="lab-templates" element={<LabTemplateManagement />} />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="templates" element={<TemplateManagement />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="activity" element={<ActivityLog />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
