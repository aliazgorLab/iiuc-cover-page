import express from 'express';
import { getProfile, getStudentAcademicProfile, updateProfile, getStudentDashboardStats } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validateProfileUpdatePayload } from '../middleware/validator.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/student/profile', protect, getStudentAcademicProfile);
router.put('/profile', protect, validateProfileUpdatePayload, updateProfile);
router.put('/student/profile', protect, validateProfileUpdatePayload, updateProfile);
router.get('/dashboard-stats', protect, getStudentDashboardStats);

export default router;
