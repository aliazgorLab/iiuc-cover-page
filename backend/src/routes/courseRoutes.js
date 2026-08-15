import express from 'express';
import { getCourses, getCourseById, createCourse } from '../controllers/courseController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', protect, requireRole('ADMIN'), createCourse);

export default router;
