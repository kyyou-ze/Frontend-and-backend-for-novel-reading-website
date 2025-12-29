import express from 'express';
import {
  createNovel,
  getAllNovels,
  getNovelBySlug,
  updateNovel,
  deleteNovel,
  getAuthorNovels,
  getNovelStats
} from '../controllers/novelController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAllNovels)
  .post(protect, authorize('author', 'admin'), createNovel);

router.get('/author/me', protect, authorize('author', 'admin'), getAuthorNovels);

router.route('/:slug')
  .get(getNovelBySlug)
  .put(protect, authorize('author', 'admin'), updateNovel)
  .delete(protect, authorize('author', 'admin'), deleteNovel);

router.get('/:slug/stats', protect, authorize('author', 'admin'), getNovelStats);

export default router;