import Novel from '../models/Novel.js';
import Chapter from '../models/Chapter.js';
import Notification from '../models/Notification.js';

// 📊 GET DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const [
      pendingNovels,
      pendingChapters,
      totalNovels,
      totalChapters,
      totalUsers
    ] = await Promise.all([
      Novel.countDocuments({ approvalStatus: 'pending' }),
      Chapter.countDocuments({ approvalStatus: 'pending' }),
      Novel.countDocuments({ approvalStatus: 'approved' }),
      Chapter.countDocuments({ approvalStatus: 'approved' }),
      require('../models/User.js').default.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        pendingNovels,
        pendingChapters,
        totalNovels,
        totalChapters,
        totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil statistik', error: error.message });
  }
};

// 📚 GET PENDING NOVELS
export const getPendingNovels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const novels = await Novel.find({ approvalStatus: 'pending' })
      .populate('author', 'username email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Novel.countDocuments({ approvalStatus: 'pending' });

    res.json({
      success: true,
      data: novels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil novel', error: error.message });
  }
};

// 📖 GET PENDING CHAPTERS
export const getPendingChapters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const chapters = await Chapter.find({ approvalStatus: 'pending' })
      .populate('novel', 'title slug author')
      .populate({
        path: 'novel',
        populate: {
          path: 'author',
          select: 'username email avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chapter.countDocuments({ approvalStatus: 'pending' });

    res.json({
      success: true,
      data: chapters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil chapter', error: error.message });
  }
};

// ✅ APPROVE NOVEL
export const approveNovel = async (req, res) => {
  try {
    const { novelId } = req.params;

    const novel = await Novel.findById(novelId).populate('author');

    if (!novel) {
      return res.status(404).json({ message: 'Novel tidak ditemukan' });
    }

    if (novel.approvalStatus !== 'pending') {
      return res.status(400).json({ message: 'Novel sudah diproses sebelumnya' });
    }

    // Update novel status
    novel.approvalStatus = 'approved';
    novel.approvedBy = req.user.id;
    novel.approvedAt = new Date();
    await novel.save();

    // Create notification for author
    await Notification.create({
      recipient: novel.author._id,
      type: 'novel_approved',
      title: '🎉 Novel Disetujui!',
      message: `Novel "${novel.title}" telah disetujui oleh admin dan sekarang dapat dilihat oleh pembaca.`,
      relatedNovel: novel._id,
      actionUrl: `/novel/${novel.slug}`,
      metadata: {
        novelTitle: novel.title,
        approvedBy: req.user.username
      }
    });

    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${novel.author._id}`).emit('notification', {
        type: 'novel_approved',
        title: '🎉 Novel Disetujui!',
        message: `Novel "${novel.title}" telah disetujui`,
        novelId: novel._id
      });
    }

    res.json({
      success: true,
      message: 'Novel berhasil disetujui',
      data: novel
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyetujui novel', error: error.message });
  }
};

// ❌ REJECT NOVEL
export const rejectNovel = async (req, res) => {
  try {
    const { novelId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Alasan penolakan harus diisi' });
    }

    const novel = await Novel.findById(novelId).populate('author');

    if (!novel) {
      return res.status(404).json({ message: 'Novel tidak ditemukan' });
    }

    if (novel.approvalStatus !== 'pending') {
      return res.status(400).json({ message: 'Novel sudah diproses sebelumnya' });
    }

    // Update novel status
    novel.approvalStatus = 'rejected';
    novel.approvedBy = req.user.id;
    novel.approvedAt = new Date();
    novel.rejectionReason = reason;
    await novel.save();

    // Create notification for author
    await Notification.create({
      recipient: novel.author._id,
      type: 'novel_rejected',
      title: '❌ Novel Ditolak',
      message: `Novel "${novel.title}" ditolak oleh admin. Alasan: ${reason}`,
      relatedNovel: novel._id,
      actionUrl: `/dashboard`,
      metadata: {
        novelTitle: novel.title,
        rejectionReason: reason,
        rejectedBy: req.user.username
      }
    });

    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${novel.author._id}`).emit('notification', {
        type: 'novel_rejected',
        title: '❌ Novel Ditolak',
        message: `Novel "${novel.title}" ditolak`,
        novelId: novel._id,
        reason
      });
    }

    res.json({
      success: true,
      message: 'Novel berhasil ditolak',
      data: novel
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menolak novel', error: error.message });
  }
};

// ✅ APPROVE CHAPTER
export const approveChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId).populate({
      path: 'novel',
      populate: { path: 'author' }
    });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter tidak ditemukan' });
    }

    if (chapter.approvalStatus !== 'pending') {
      return res.status(400).json({ message: 'Chapter sudah diproses sebelumnya' });
    }

    // Update chapter status
    chapter.approvalStatus = 'approved';
    chapter.approvedBy = req.user.id;
    chapter.approvedAt = new Date();
    chapter.isDraft = false;
    if (!chapter.publishedAt) {
      chapter.publishedAt = new Date();
    }
    await chapter.save();

    // Update novel stats
    await Novel.findByIdAndUpdate(chapter.novel._id, {
      $inc: {
        totalChapters: 1,
        totalWords: chapter.wordCount
      }
    });

    // Create notification for author
    await Notification.create({
      recipient: chapter.novel.author._id,
      type: 'chapter_approved',
      title: '🎉 Chapter Disetujui!',
      message: `Chapter "${chapter.title}" dari novel "${chapter.novel.title}" telah disetujui.`,
      relatedChapter: chapter._id,
      relatedNovel: chapter.novel._id,
      actionUrl: `/novel/${chapter.novel.slug}/${chapter.number}`,
      metadata: {
        chapterTitle: chapter.title,
        novelTitle: chapter.novel.title,
        approvedBy: req.user.username
      }
    });

    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${chapter.novel.author._id}`).emit('notification', {
        type: 'chapter_approved',
        title: '🎉 Chapter Disetujui!',
        message: `Chapter "${chapter.title}" telah disetujui`,
        chapterId: chapter._id
      });
    }

    res.json({
      success: true,
      message: 'Chapter berhasil disetujui',
      data: chapter
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyetujui chapter', error: error.message });
  }
};

// ❌ REJECT CHAPTER
export const rejectChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Alasan penolakan harus diisi' });
    }

    const chapter = await Chapter.findById(chapterId).populate({
      path: 'novel',
      populate: { path: 'author' }
    });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter tidak ditemukan' });
    }

    if (chapter.approvalStatus !== 'pending') {
      return res.status(400).json({ message: 'Chapter sudah diproses sebelumnya' });
    }

    // Update chapter status
    chapter.approvalStatus = 'rejected';
    chapter.approvedBy = req.user.id;
    chapter.approvedAt = new Date();
    chapter.rejectionReason = reason;
    await chapter.save();

    // Create notification for author
    await Notification.create({
      recipient: chapter.novel.author._id,
      type: 'chapter_rejected',
      title: '❌ Chapter Ditolak',
      message: `Chapter "${chapter.title}" dari novel "${chapter.novel.title}" ditolak. Alasan: ${reason}`,
      relatedChapter: chapter._id,
      relatedNovel: chapter.novel._id,
      actionUrl: `/dashboard`,
      metadata: {
        chapterTitle: chapter.title,
        novelTitle: chapter.novel.title,
        rejectionReason: reason,
        rejectedBy: req.user.username
      }
    });

    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${chapter.novel.author._id}`).emit('notification', {
        type: 'chapter_rejected',
        title: '❌ Chapter Ditolak',
        message: `Chapter "${chapter.title}" ditolak`,
        chapterId: chapter._id,
        reason
      });
    }

    res.json({
      success: true,
      message: 'Chapter berhasil ditolak',
      data: chapter
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menolak chapter', error: error.message });
  }
};