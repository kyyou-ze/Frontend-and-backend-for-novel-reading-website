import express from 'express';
import Novel from '../models/Novel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, genre, status, sort, limit = 20, page = 1 } = req.query;

    let query = {};

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filters
    if (genre) query.genres = genre;
    if (status) query.status = status;

    // Sort
    let sortOption = {};
    if (sort === 'popular') sortOption = { views: -1 };
    else if (sort === 'rating') sortOption = { 'rating.average': -1 };
    else if (sort === 'updated') sortOption = { updatedAt: -1 };
    else if (q) sortOption = { score: { $meta: 'textScore' } };
    else sortOption = { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const novels = await Novel.find(query)
      .populate('author', 'username avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Novel.countDocuments(query);

    res.json({
      success: true,
      data: novels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mencari', error: error.message });
  }
});

export default router;