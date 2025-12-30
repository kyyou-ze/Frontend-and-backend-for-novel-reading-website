import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { novelService } from '../services/novelService';

const EditNovelPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    genres: [],
    tags: '',
    cover: '',
    status: 'ongoing',
    mature: false
  });

  const genreOptions = [
    'Romance', 'Fantasy', 'Action', 'Horror', 
    'Mystery', 'Sci-Fi', 'Thriller', 'Comedy',
    'Drama', 'Adventure', 'Slice of Life', 'Historical',
    'Psychological', 'Supernatural'
  ];

  useEffect(() => {
    loadNovel();
  }, [slug]);

  const loadNovel = async () => {
    try {
      const response = await novelService.getNovelBySlug(slug);
      const novel = response.data;
      setFormData({
        title: novel.title,
        synopsis: novel.synopsis,
        genres: novel.genres || [],
        tags: novel.tags?.join(', ') || '',
        cover: novel.cover || '',
        status: novel.status,
        mature: novel.mature || false
      });
    } catch (err) {
      setError('Gagal memuat novel');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleGenreToggle = (genre) => {
    const genres = formData.genres.includes(genre)
      ? formData.genres.filter(g => g !== genre)
      : [...formData.genres, genre];
    
    if (genres.length <= 3) {
      setFormData({ ...formData, genres });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.title.length < 3) {
      setError('Judul minimal 3 karakter');
      return;
    }

    if (formData.synopsis.length < 50) {
      setError('Sinopsis minimal 50 karakter');
      return;
    }

    if (formData.genres.length === 0) {
      setError('Pilih minimal 1 genre');
      return;
    }

    setSaving(true);

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      await novelService.updateNovel(slug, {
        ...formData,
        tags
      });

      alert('✅ Novel berhasil diperbarui!');
      navigate(`/novel/${slug}`);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui novel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        <p>Memuat data novel...</p>
      </div>
    );
  }

  return (
    <div className="create-novel-page">
      <div className="container">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate(`/novel/${slug}`)}>
            ← Kembali
          </button>
          <h1 className="gradient-text">Edit Novel</h1>
          <p>Perbarui Informasi Novel Anda</p>
        </div>

        <div className="create-novel-container">
          <div className="form-wrapper">
            {error && (
              <div className="alert alert-error">
                <strong>Oops!</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* SECTION 1: INFORMASI DASAR */}
              <div className="form-section">
                <h3>📝 Informasi Dasar</h3>
                
                <div className="input-group">
                  <label htmlFor="title">Judul Novel *</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Judul novel"
                    maxLength="100"
                    required
                  />
                  <span className="char-count">{formData.title.length}/100 karakter</span>
                </div>

                <div className="input-group">
                  <label htmlFor="synopsis">Sinopsis *</label>
                  <textarea
                    id="synopsis"
                    name="synopsis"
                    value={formData.synopsis}
                    onChange={handleChange}
                    placeholder="Sinopsis novel..."
                    rows="8"
                    maxLength="2000"
                    required
                  />
                  <span className="char-count">
                    {formData.synopsis.length}/2000 karakter (minimal 50)
                  </span>
                </div>
              </div>

              {/* SECTION 2: KATEGORI */}
              <div className="form-section">
                <h3>🏷️ Kategori & Tag</h3>
                
                <div className="input-group">
                  <label>Genre * (Pilih 1-3)</label>
                  <div className="genre-grid">
                    {genreOptions.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        className={`genre-chip ${formData.genres.includes(genre) ? 'selected' : ''}`}
                        onClick={() => handleGenreToggle(genre)}
                        disabled={!formData.genres.includes(genre) && formData.genres.length >= 3}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  <div className="selected-genres">
                    {formData.genres.length > 0 ? (
                      <>
                        <strong>Genre Terpilih:</strong> {formData.genres.join(', ')}
                      </>
                    ) : (
                      <span className="text-muted">Belum ada genre dipilih</span>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="tags">Tags (Opsional)</label>
                  <input
                    id="tags"
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="reinkarnasi, cultivation, op mc"
                  />
                </div>
              </div>

              {/* SECTION 3: STATUS & VISUAL */}
              <div className="form-section">
                <h3>🎨 Status & Visual</h3>
                
                <div className="input-group">
                  <label htmlFor="status">Status Novel</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="hiatus">Hiatus</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="cover">URL Cover Image</label>
                  <input
                    id="cover"
                    type="url"
                    name="cover"
                    value={formData.cover}
                    onChange={handleChange}
                    placeholder="https://example.com/cover.jpg"
                  />
                  
                  {formData.cover && (
                    <div className="cover-preview-box">
                      <p className="preview-label">Preview Cover</p>
                      <img 
                        src={formData.cover} 
                        alt="Cover preview" 
                        className="cover-preview-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <p className="preview-error" style={{ display: 'none', color: '#ef4444', marginTop: '12px' }}>
                        ❌ Gagal memuat gambar
                      </p>
                    </div>
                  )}
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="mature"
                      checked={formData.mature}
                      onChange={handleChange}
                    />
                    <div className="checkbox-content">
                      <strong>⚠️ Konten Dewasa (18+)</strong>
                      <p>Novel mengandung konten dewasa</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(`/novel/${slug}`)}
                  disabled={saving}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? '💾 Menyimpan...' : '💾 Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>

          {/* TIPS SIDEBAR */}
          <div className="tips-sidebar">
            <h3>💡 Tips Edit</h3>
            
            <div className="tip-card">
              <h4>🔄 Update Teratur</h4>
              <p>
                Perbarui sinopsis dan status novel secara berkala untuk 
                memberikan informasi terbaru kepada pembaca.
              </p>
            </div>

            <div className="tip-card">
              <h4>🎯 Genre Akurat</h4>
              <p>
                Pastikan genre yang dipilih sesuai dengan isi cerita untuk 
                membantu pembaca menemukan novel Anda.
              </p>
            </div>

            <div className="tip-card">
              <h4>📸 Cover Berkualitas</h4>
              <p>
                Gunakan cover yang jelas dan menarik. Cover adalah kesan 
                pertama untuk menarik pembaca baru.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNovelPage;