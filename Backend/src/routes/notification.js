import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// This would integrate with a notification service
router.get('/', protect, async (req, res) => {
  try {
    // Placeholder for notification system
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal', error: error.message });
  }
});

export default router;