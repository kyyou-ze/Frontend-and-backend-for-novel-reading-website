import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  isModerated: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

commentSchema.index({ chapter: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);
