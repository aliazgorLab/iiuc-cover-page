import express from 'express';
import {
  getLabIndexRecordByCourse,
  saveOrUpdateLabIndexRecord,
  updateLabIndexRecordById,
  deleteLabIndexRecordById,
  getUserLabIndexRecords,
} from '../controllers/labIndexRecordController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', saveOrUpdateLabIndexRecord);
router.get('/user/all', getUserLabIndexRecords);
router.get('/:courseCode', getLabIndexRecordByCourse);
router.put('/:id', updateLabIndexRecordById);
router.delete('/:id', deleteLabIndexRecordById);

export default router;
