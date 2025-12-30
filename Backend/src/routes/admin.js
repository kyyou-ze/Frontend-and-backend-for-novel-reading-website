import express from 'express';
import {
  getDashboardStats,
  getPendingNovels,
  getPendingChapters,
  approveNovel,
  rejectNovel,
  approveChapter,
  rejectChapter
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Semua routes butuh admin authorization
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Novels approval
router.get('/novels/pending', getPendingNovels);
router.post('/novels/:novelId/approve', approveNovel);
router.post('/novels/:novelId/reject', rejectNovel);

// Chapters approval
router.get('/chapters/pending', getPendingChapters);
router.post('/chapters/:chapterId/approve', approveChapter);
router.post('/chapters/:chapterId/reject', rejectChapter);

export default router;