import express from 'express';
import {
  generateCover,
  saveCover,
  getCoverHistory,
  getCoverById,
  deleteCover,
} from '../controllers/coverController.js';
import { protect } from '../middleware/auth.js';
import { validateCoverSavePayload } from '../middleware/validator.js';

const router = express.Router();

router.post('/generate', generateCover);
router.post('/save', protect, validateCoverSavePayload, saveCover);
router.get('/history', protect, getCoverHistory);
router.get('/:id', protect, getCoverById);
router.delete('/:id', protect, deleteCover);

export default router;
