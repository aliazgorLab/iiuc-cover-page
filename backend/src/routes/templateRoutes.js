import express from 'express';
import { getTemplates, getTemplateById, createTemplate } from '../controllers/templateController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/', protect, requireRole('ADMIN'), createTemplate);

export default router;
