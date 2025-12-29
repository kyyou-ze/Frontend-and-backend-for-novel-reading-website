import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const chapterSchema = new mongoose.Schema({
  novel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  uuid: {
    type: String,
    default: uuidv4
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  publishedAt: Date,
  isDraft: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  schedule: Date
}, { timestamps: true });

chapterSchema.index({ novel: 1, number: 1 });
chapterSchema.index({ uuid: 1 });

chapterSchema.pre('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.split(/\s+/).length;
  }
  next();
});

export default mongoose.model('Chapter', chapterSchema);