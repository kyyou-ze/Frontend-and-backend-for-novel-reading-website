export const validateNovel = (req, res, next) => {
  const { title, synopsis, genres } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({ message: 'Judul minimal 3 karakter' });
  }

  if (!synopsis || synopsis.trim().length < 50) {
    return res.status(400).json({ message: 'Sinopsis minimal 50 karakter' });
  }

  if (!genres || genres.length === 0) {
    return res.status(400).json({ message: 'Pilih minimal 1 genre' });
  }

  next();
};

export const validateChapter = (req, res, next) => {
  const { title, content } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({ message: 'Judul chapter minimal 3 karakter' });
  }

  if (!content || content.trim().length < 100) {
    return res.status(400).json({ message: 'Konten chapter minimal 100 karakter' });
  }

  next();
};