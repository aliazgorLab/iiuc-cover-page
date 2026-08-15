import express from 'express';
import { importPreviousLabExperiments } from '../controllers/labIndexController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/import/:courseCode', protect, importPreviousLabExperiments);

export default router;
