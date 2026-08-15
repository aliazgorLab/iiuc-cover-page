import express from 'express';
import { getLabTemplateByCourseCode } from '../controllers/labExperimentTemplateController.js';

const router = express.Router();

// GET /api/v1/lab-experiments/:courseCode
router.get('/:courseCode', getLabTemplateByCourseCode);

export default router;
