import mongoose from 'mongoose';

const novelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  synopsis: {
    type: String,
    required: true
  },
  cover: String,
  genres: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus'],
    default: 'ongoing'
  },
  
  // 🔥 APPROVAL SYSTEM
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  
  totalChapters: {
    type: Number,
    default: 0
  },
  totalWords: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  mature: {
    type: Boolean,
    default: false
  },
  monetization: {
    enabled: { type: Boolean, default: false },
    donationGoal: Number,
    donationReceived: { type: Number, default: 0 }
  }
}, { timestamps: true });

novelSchema.index({ title: 'text', synopsis: 'text', tags: 'text' });
novelSchema.index({ slug: 1 });
novelSchema.index({ author: 1 });
novelSchema.index({ approvalStatus: 1 }); // 🔥 NEW INDEX

export default mongoose.model('Novel', novelSchema);