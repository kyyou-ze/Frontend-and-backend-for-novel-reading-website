import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['reader', 'author', 'admin'],
    default: 'reader'
  },
  avatar: String,
  bio: String,
  readingHistory: [{
    novel: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel' },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    progress: Number,
    lastRead: { type: Date, default: Date.now }
  }],
  bookmarks: [{
    novel: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel' },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    addedAt: { type: Date, default: Date.now }
  }],
  subscriptions: [{
    target: { type: mongoose.Schema.Types.ObjectId, refPath: 'subscriptions.targetType' },
    targetType: { type: String, enum: ['User', 'Novel'] },
    subscribedAt: { type: Date, default: Date.now }
  }],
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    fontSize: { type: Number, default: 16 },
    lineHeight: { type: Number, default: 1.6 }
  },
  badges: [String],
  isPremium: { type: Boolean, default: false },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
