import express from 'express';
import {
  createChapter,
  getChapter,
  updateChapter,
  deleteChapter
} from '../controllers/chapterController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('author', 'admin'), createChapter);
router.get('/:slug/:chapterNum', getChapter);
router.put('/:chapterId', protect, authorize('author', 'admin'), updateChapter);
router.delete('/:chapterId', protect, authorize('author', 'admin'), deleteChapter);

export default router;