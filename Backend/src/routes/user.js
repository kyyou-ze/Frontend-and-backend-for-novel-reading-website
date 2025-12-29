import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Update preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const { theme, fontSize, lineHeight } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          theme: theme || 'light',
          fontSize: fontSize || 16,
          lineHeight: lineHeight || 1.6
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update preferences', error: error.message });
  }
});

// Subscribe to novel/author
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { target, targetType } = req.body;

    const user = await User.findById(req.user.id);

    const alreadySubscribed = user.subscriptions.some(
      s => s.target.toString() === target && s.targetType === targetType
    );

    if (alreadySubscribed) {
      return res.status(400).json({ message: 'Sudah berlangganan' });
    }

    user.subscriptions.push({
      target,
      targetType,
      subscribedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal subscribe', error: error.message });
  }
});

export default router;