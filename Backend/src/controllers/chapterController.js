import Novel from '../models/Novel.js';
import Chapter from '../models/Chapter.js';
import User from '../models/User.js';

export const createChapter = async (req, res) => {
  try {
    const { novelId, title, content, isPremium, price, schedule } = req.body;

    const novel = await Novel.findOne({ 
      _id: novelId,
      author: req.user.id 
    });

    if (!novel) {
      return res.status(404).json({ message: 'Novel tidak ditemukan' });
    }

    const lastChapter = await Chapter.findOne({ novel: novelId })
      .sort({ number: -1 });

    const chapterNumber = lastChapter ? lastChapter.number + 1 : 1;

    const chapter = await Chapter.create({
      novel: novelId,
      title,
      number: chapterNumber,
      content,
      isPremium: isPremium || false,
      price: price || 0,
      schedule: schedule || null,
      isDraft: !!schedule,
      publishedAt: schedule ? null : new Date(),
      approvalStatus: 'pending'
    });

    // Update novel stats only if not draft
    if (!schedule) {
      novel.totalChapters += 1;
      novel.totalWords += chapter.wordCount;
      await novel.save();
    }

    // Notify subscribers if published
    if (!schedule) {
      const io = req.app.get('io');
      if (io) {
        io.to(`novel_${novelId}`).emit('new_chapter', {
          novel: novel.title,
          chapter: chapter.title,
          number: chapter.number
        });
      }
    }

    res.status(201).json({
      success: true,
      message: schedule ? 'Chapter dijadwalkan' : 'Chapter menunggu approval',
      data: chapter
    });
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ 
      message: 'Gagal membuat chapter', 
      error: error.message 
    });
  }
};

export const getChapter = async (req, res) => {
  try {
    const { slug, chapterNum } = req.params;

    const novel = await Novel.findOne({ slug })
      .populate('author', 'username avatar');

    if (!novel) {
      return res.status(404).json({ message: 'Novel tidak ditemukan' });
    }

    const chapter = await Chapter.findOne({ 
      novel: novel._id, 
      number: parseInt(chapterNum),
      approvalStatus: 'approved'
    });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter tidak ditemukan' });
    }

    // Check premium access
    if (chapter.isPremium && req.user) {
      const user = await User.findById(req.user.id);
      if (!user.isPremium) {
        return res.status(403).json({ 
          message: 'Chapter ini hanya untuk member premium',
          isPremium: true
        });
      }
    }

    // Increment views
    chapter.views += 1;
    await chapter.save();

    // Update reading history
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { readingHistory: { novel: novel._id } },
      });
      await User.findByIdAndUpdate(req.user.id, {
        $push: { 
          readingHistory: {
            $each: [{
              novel: novel._id,
              chapter: chapter._id,
              lastRead: new Date()
            }],
            $position: 0,
            $slice: 50
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        chapter,
        novel: {
          title: novel.title,
          slug: novel.slug,
          author: novel.author
        }
      }
    });
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil chapter', 
      error: error.message 
    });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, content, isPremium, price } = req.body;

    const chapter = await Chapter.findById(chapterId).populate('novel');

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter tidak ditemukan' });
    }

    if (chapter.novel.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Tidak memiliki akses' });
    }

    Object.assign(chapter, {
      title: title || chapter.title,
      content: content || chapter.content,
      isPremium: isPremium !== undefined ? isPremium : chapter.isPremium,
      price: price !== undefined ? price : chapter.price
    });

    await chapter.save();

    res.json({
      success: true,
      data: chapter
    });
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ 
      message: 'Gagal update chapter', 
      error: error.message 
    });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId).populate('novel');

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter tidak ditemukan' });
    }

    if (chapter.novel.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Tidak memiliki akses' });
    }

    await chapter.deleteOne();

    // Update novel stats
    const novel = await Novel.findById(chapter.novel._id);
    if (novel) {
      novel.totalChapters = Math.max(0, novel.totalChapters - 1);
      novel.totalWords = Math.max(0, novel.totalWords - chapter.wordCount);
      await novel.save();
    }

    res.json({
      success: true,
      message: 'Chapter berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ 
      message: 'Gagal hapus chapter', 
      error: error.message 
    });
  }
};