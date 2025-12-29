import Novel from '../models/Novel.js';
import Chapter from '../models/Chapter.js';
import User from '../models/User.js';

export const createNovel = async (req, res) => {
  try {
    const { title, synopsis, genres, tags, cover, mature } = req.body;

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    const novel = await Novel.create({
      title,
      slug,
      synopsis,
      genres,
      tags,
      cover,
      mature,
      author: req.user.id
    });

    res.status(201).json({
      success: true,
      data: novel
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat novel', error: error.message });
  }
};

export const getAllNovels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { genre, status, sort } = req.query;
    
    const filter = {};
    if (genre) filter.genres = genre;
    if (status) filter.status = status;

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { views: -1 };
    if (sort === 'rating') sortOption = { 'rating.average': -1 };
    if (sort === 'updated') sortOption = { updatedAt: -1 };

    const novels = await Novel.find(filter)
      .populate('author', 'username avatar badges')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Novel.countDocuments(filter);

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

export const getNovelBySlug = async (req, res) => {
  try {
    const novel = await Novel.findOne({ slug: req.params.slug })
      .populate('author', 'username avatar bio badges');

    if (!novel) {
      return res.status(404).json({ message: 'Novel tidak ditemukan' });
    }

    // Increment views
    novel.views += 1;
    await novel.save();

    // Get chapters
    const chapters = await Chapter.find({ 
      novel: novel._id, 
      isDraft: false 
    })
      .select('title number publishedAt isPremium views')
      .sort({ number: 1 });

    res.json({
      success: true,
      data: {
        ...novel.toObject(),
        chapters
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil novel', error: error.message });
  }
};

export const updateNovel = async (req, res) => {
  try {
    const novel = await Novel.findOne({ 
      slug: req.params.slug,
      author: req.user.id 
    });

    if (!novel) {
      return res.status(404).json({ message: 'Novel tidak ditemukan' });
    }

    const { title, synopsis, genres, tags, cover, status, mature } = req.body;

    Object.assign(novel, {
      title: title || novel.title,
      synopsis: synopsis || novel.synopsis,
      genres: genres || novel.genres,
      tags: tags || novel.tags,
      cover: cover || novel.cover,
      status: status || novel.status,
      mature: mature !== undefined ? mature : novel.mature
    });

    await novel.save();

    res.json({
      success: true,
      data: novel
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update novel', error: error.message });
  }
};

export const deleteNovel = async (req, res) => {
  try {
    const novel = await Novel.findOne({ 
      slug: req.params.slug,
      author: req.user.id 
    });

    if (!novel) {
      return res.status(404).json({ message: 'Novel tidak ditemukan' });
    }

    // Delete all chapters
    await Chapter.deleteMany({ novel: novel._id });
    await novel.deleteOne();

    res.json({
      success: true,
      message: 'Novel berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus novel', error: error.message });
  }
};

export const getAuthorNovels = async (req, res) => {
  try {
    const novels = await Novel.find({ author: req.user.id })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: novels
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil novel', error: error.message });
  }
};

export const getNovelStats = async (req, res) => {
  try {
    const novel = await Novel.findOne({ 
      slug: req.params.slug,
      author: req.user.id 
    });

    if (!novel) {
      return res.status(404).json({ message: 'Novel tidak ditemukan' });
    }

    const chapters = await Chapter.find({ novel: novel._id })
      .select('number title views rating publishedAt')
      .sort({ number: 1 });

    const totalViews = chapters.reduce((sum, ch) => sum + ch.views, 0);

    res.json({
      success: true,
      data: {
        novel: {
          title: novel.title,
          totalChapters: novel.totalChapters,
          totalWords: novel.totalWords,
          rating: novel.rating,
          views: novel.views
        },
        chapters,
        totalViews
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil statistik', error: error.message });
  }
};
