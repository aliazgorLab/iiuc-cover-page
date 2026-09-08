import express from 'express';
import {
  // Dashboard & Analytics
  getAdminStats,
  getAdminAnalytics,
  getRecentActivity,

  // Student Intelligence & Management
  getAdminStudents,
  getAdminStudentById,
  updateStudentStatus,
  bulkUpdateStudentStatus,

  // Teachers
  getAdminTeachers,
  getAdminTeacherById,
  createAdminTeacher,
  updateAdminTeacher,
  deleteAdminTeacher,
  importIIUCTeachers,
  getIIUCImportHistory,

  // Courses
  getAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,

  // Templates
  getAdminTemplates,
  createAdminTemplate,
  updateAdminTemplate,
  deleteAdminTemplate,

  // Activity Logs
  getActivityLogs,

  // CSV Exporters
  exportStudentsCSV,
  exportCoversCSV,
  exportActivityCSV,
  exportTeachersCSV,

  // Notifications
  getNotifications,
  markNotificationRead,
  deleteNotification,

  // Security Sessions
  getAdminSessions,
  revokeAdminSession,

  // Announcements & Email Broadcast
  getBroadcastRecipientsCount,
  sendTestAnnouncementEmail,
  sendBroadcastEmail,
  getBroadcastLogs,

  // Database Debug
  getDatabaseDebug,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { requirePermission } from '../middleware/permission.js';

import {
  getAdminLabTemplates,
  createLabTemplate,
  updateLabTemplate,
  deleteLabTemplate,
} from '../controllers/labExperimentTemplateController.js';

const router = express.Router();

// All admin routes require authenticated session with ADMIN/SUPER_ADMIN/MODERATOR role
router.use(protect);
router.use(requireRole('ADMIN', 'SUPER_ADMIN', 'MODERATOR'));

// Lab Experiment Template Management
router.get('/lab-experiments', getAdminLabTemplates);
router.post('/lab-experiments', createLabTemplate);
router.put('/lab-experiments/:id', updateLabTemplate);
router.delete('/lab-experiments/:id', deleteLabTemplate);

// Database Debug
router.get('/debug/database', getDatabaseDebug);

// Dashboard & Analytics
router.get('/dashboard-stats', requirePermission('VIEW_ANALYTICS'), getAdminStats);
router.get('/analytics', requirePermission('VIEW_ANALYTICS'), getAdminAnalytics);

// Student Intelligence System
router.get('/students', requirePermission('MANAGE_STUDENTS'), getAdminStudents);
router.get('/students/:id', requirePermission('MANAGE_STUDENTS'), getAdminStudentById);
router.patch('/students/:id/status', requirePermission('MANAGE_STUDENTS'), updateStudentStatus);
router.post('/students/bulk-status', requirePermission('MANAGE_STUDENTS'), bulkUpdateStudentStatus);

// CSV Export Reporting System
router.get('/export/students', requirePermission('EXPORT_DATA', 'MANAGE_STUDENTS'), exportStudentsCSV);
router.get('/export/covers', requirePermission('EXPORT_DATA', 'VIEW_ANALYTICS'), exportCoversCSV);
router.get('/export/activity', requirePermission('EXPORT_DATA'), exportActivityCSV);
router.get('/export/teachers', requirePermission('EXPORT_DATA', 'MANAGE_TEACHERS'), exportTeachersCSV);

// Teacher Management
router.get('/teachers', requirePermission('MANAGE_TEACHERS'), getAdminTeachers);
router.post('/teachers', requirePermission('MANAGE_TEACHERS'), createAdminTeacher);
router.post('/teachers/import-iiuc', requirePermission('MANAGE_TEACHERS'), importIIUCTeachers);
router.get('/teachers/import-history', requirePermission('MANAGE_TEACHERS'), getIIUCImportHistory);
router.get('/teachers/:id', requirePermission('MANAGE_TEACHERS'), getAdminTeacherById);
router.put('/teachers/:id', requirePermission('MANAGE_TEACHERS'), updateAdminTeacher);
router.delete('/teachers/:id', requirePermission('MANAGE_TEACHERS'), deleteAdminTeacher);

// Course Management
router.get('/courses', requirePermission('MANAGE_COURSES'), getAdminCourses);
router.post('/courses', requirePermission('MANAGE_COURSES'), createAdminCourse);
router.put('/courses/:id', requirePermission('MANAGE_COURSES'), updateAdminCourse);
router.delete('/courses/:id', requirePermission('MANAGE_COURSES'), deleteAdminCourse);

// Template Management
router.get('/templates', requirePermission('MANAGE_TEMPLATES'), getAdminTemplates);
router.post('/templates', requirePermission('MANAGE_TEMPLATES'), createAdminTemplate);
router.put('/templates/:id', requirePermission('MANAGE_TEMPLATES'), updateAdminTemplate);
router.delete('/templates/:id', requirePermission('MANAGE_TEMPLATES'), deleteAdminTemplate);

// Activity Logs & Audit
router.get('/activity-logs', getActivityLogs);
router.get('/activity/recent', getRecentActivity);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.delete('/notifications/:id', deleteNotification);

// Security & Sessions
router.get('/profile/sessions', getAdminSessions);
router.post('/profile/sessions/:id/revoke', revokeAdminSession);

// Email Broadcast & Announcements
router.post('/announcement/count', requirePermission('MANAGE_USERS'), getBroadcastRecipientsCount);
router.post('/announcement/test-email', requirePermission('MANAGE_USERS'), sendTestAnnouncementEmail);
router.post('/announcement/send-email', requirePermission('MANAGE_USERS'), sendBroadcastEmail);
router.get('/announcement/history', requirePermission('MANAGE_USERS'), getBroadcastLogs);

export default router;
