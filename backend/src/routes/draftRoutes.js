import express from 'express';
import { saveDraft, getDrafts, deleteDraft } from '../controllers/draftController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/save', saveDraft);
router.get('/', getDrafts);
router.delete('/:id', deleteDraft);

export default router;
