import express from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

router.post('/', protect, requireRole('ADMIN', 'SUPER_ADMIN'), createDepartment);
router.put('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), updateDepartment);
router.delete('/:id', protect, requireRole('ADMIN', 'SUPER_ADMIN'), deleteDepartment);

export default router;
