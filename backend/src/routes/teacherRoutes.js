import express from 'express';
import { getTeachers, getTeacherById, createTeacher, updateTeacher } from '../controllers/teacherController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.post('/', protect, requireRole('ADMIN'), createTeacher);
router.put('/:id', protect, requireRole('ADMIN'), updateTeacher);

export default router;
