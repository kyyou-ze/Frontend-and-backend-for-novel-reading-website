import express from 'express';
import Review from '../models/Review.js';
import Novel from '../models/Novel.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a novel
router.get('/novel/:novelId', async (req, res) => {
  try {
    const reviews = await Review.find({ novel: req.params.novelId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil ulasan', error: error.message });
  }
});

// Add review
router.post('/', protect, async (req, res) => {
  try {
    const { novel, rating, title, content } = req.body;

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      novel,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Anda sudah memberikan ulasan untuk novel ini' });
    }

    const review = await Review.create({
      novel,
      user: req.user.id,
      rating,
      title,
      content
    });

    // Update novel rating
    const allReviews = await Review.find({ novel });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Novel.findByIdAndUpdate(novel, {
      'rating.average': avgRating,
      'rating.count': allReviews.length
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'username avatar');

    res.status(201).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan ulasan', error: error.message });
  }
});

// Update review
router.put('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Ulasan tidak ditemukan' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Tidak memiliki akses' });
    }

    const { rating, title, content } = req.body;

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.content = content || review.content;

    await review.save();

    // Update novel rating
    const allReviews = await Review.find({ novel: review.novel });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Novel.findByIdAndUpdate(review.novel, {
      'rating.average': avgRating
    });

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update ulasan', error: error.message });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Ulasan tidak ditemukan' });
    }

    const alreadyMarked = review.helpfulBy.includes(req.user.id);

    if (alreadyMarked) {
      review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== req.user.id);
      review.helpful -= 1;
    } else {
      review.helpfulBy.push(req.user.id);
      review.helpful += 1;
    }

    await review.save();

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal', error: error.message });
  }
});

export default router;