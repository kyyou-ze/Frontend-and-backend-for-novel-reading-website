import express from 'express';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a chapter
router.get('/chapter/:chapterId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      chapter: req.params.chapterId,
      parent: null 
    })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil komentar', error: error.message });
  }
});

// Add comment
router.post('/', protect, async (req, res) => {
  try {
    const { chapter, content, parent } = req.body;

    const comment = await Comment.create({
      chapter,
      user: req.user.id,
      content,
      parent: parent || null
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username avatar');

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan komentar', error: error.message });
  }
});

// Like comment
router.post('/:commentId/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }

    const alreadyLiked = comment.likedBy.includes(req.user.id);

    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== req.user.id);
      comment.likes -= 1;
    } else {
      comment.likedBy.push(req.user.id);
      comment.likes += 1;
    }

    await comment.save();

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal', error: error.message });
  }
});

// Delete comment
router.delete('/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tidak memiliki akses' });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Komentar berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus komentar', error: error.message });
  }
});

export default router;
