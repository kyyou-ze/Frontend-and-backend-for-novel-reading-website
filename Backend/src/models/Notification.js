import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'novel_pending',      // Novel menunggu approval
      'novel_approved',     // Novel disetujui
      'novel_rejected',     // Novel ditolak
      'chapter_pending',    // Chapter menunggu approval
      'chapter_approved',   // Chapter disetujui
      'chapter_rejected',   // Chapter ditolak
      'new_chapter',        // Chapter baru (untuk subscribers)
      'new_comment',        // Komentar baru
      'new_review'          // Review baru
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Reference ke item yang terkait
  relatedNovel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel'
  },
  relatedChapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // URL untuk navigate
  actionUrl: String,
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Extra data (JSON)
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export default mongoose.model('Notification', notificationSchema);