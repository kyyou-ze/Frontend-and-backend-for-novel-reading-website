import cron from 'node-cron';
import Chapter from '../models/Chapter.js';
import Novel from '../models/Novel.js';
import User from '../models/User.js';
import { sendNewChapterNotification } from './emailService.js';
import { io } from '../server.js';

// Check for scheduled chapters every 5 minutes
export const initScheduledTasks = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      
      // Find chapters scheduled for publishing
      const scheduledChapters = await Chapter.find({
        isDraft: true,
        schedule: { $lte: now }
      }).populate('novel');

      for (const chapter of scheduledChapters) {
        // Publish chapter
        chapter.isDraft = false;
        chapter.publishedAt = now;
        chapter.schedule = null;
        await chapter.save();

        // Update novel stats
        const novel = await Novel.findById(chapter.novel._id);
        novel.totalChapters += 1;
        novel.totalWords += chapter.wordCount;
        await novel.save();

        // Get subscribers
        const subscribers = await User.find({
          'subscriptions.target': novel._id,
          'subscriptions.targetType': 'Novel'
        });

        // Send notifications
        io.to(`novel_${novel._id}`).emit('new_chapter', {
          novel: novel.title,
          chapter: chapter.title,
          number: chapter.number
        });

        // Send email notifications
        if (subscribers.length > 0) {
          await sendNewChapterNotification(subscribers, novel, chapter);
        }

        console.log(`Published scheduled chapter: ${chapter.title}`);
      }
    } catch (error) {
      console.error('Scheduled task error:', error);
    }
  });

  console.log('✅ Scheduled tasks initialized');
};