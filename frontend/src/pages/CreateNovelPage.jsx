import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { novelService } from '../services/novelService';

const CreateNovelPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    genres: [],
    tags: '',
    cover: '',
    mature: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const genreOptions = [
    'Romance', 'Fantasy', 'Action', 'Horror', 
    'Mystery', 'Sci-Fi', 'Thriller', 'Comedy',
    'Drama', 'Adventure', 'Slice of Life', 'Historical',
    'Psychological', 'Supernatural'
  ];

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

    setLoading(true);

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const response = await novelService.createNovel({
        ...formData,
        tags
      });

      alert('✨ Novel berhasil dibuat!');
      navigate(`/novel/${response.data.slug}`);
    } catch (err) {
      setError(err.message || 'Gagal membuat novel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-novel-page">
      <div className="container">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Kembali ke Dashboard
          </button>
          <h1 className="gradient-text">Buat Novel Baru</h1>
          <p>Wujudkan Imajinasi Anda Menjadi Karya Nyata</p>
        </div>

        <div className="create-novel-container">
          <div className="form-wrapper">
            {error && (
              <div className="alert alert-error">
                <strong>Oops!</strong> {error}
              </div>
            )}

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
                  placeholder="Masukkan judul yang menarik dan mudah diingat"
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
                  placeholder="Ceritakan kisah Anda dengan cara yang membuat pembaca penasaran..."
                  rows="8"
                  maxLength="2000"
                  required
                />
                <span className="char-count">
                  {formData.synopsis.length}/2000 karakter (minimal 50)
                </span>
              </div>
            </div>

            <div className="form-section">
              <h3>🏷️ Kategori & Tag</h3>
              
              <div className="input-group">
                <label>Genre * (Pilih 1-3 genre yang paling sesuai)</label>
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
                  placeholder="reinkarnasi, cultivation, op mc, sistem, academy"
                />
                <span className="helper-text">
                  💡 Pisahkan dengan koma. Maksimal 10 tags.
                </span>
              </div>
            </div>

            <div className="form-section">
              <h3>🎨 Visual & Pengaturan</h3>
              
              <div className="input-group">
                <label htmlFor="cover">URL Cover Image (Opsional)</label>
                <input
                  id="cover"
                  type="url"
                  name="cover"
                  value={formData.cover}
                  onChange={handleChange}
                  placeholder="https://example.com/my-cover.jpg"
                />
                <span className="helper-text">
                  📸 Rekomendasi: 300x450px (rasio 2:3)
                </span>
                
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
                      ❌ Gagal memuat gambar. Periksa URL Anda.
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
                    <p>
                      Centang jika novel Anda mengandung konten dewasa
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                ← Batal
              </button>
              <button 
                type="button"
                className="btn btn-primary shine-effect"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '⏳ Membuat Novel...' : '✨ Buat Novel Sekarang'}
              </button>
            </div>
          </div>

          <div className="tips-sidebar">
            <h3>💡 Tips Sukses</h3>
            
            <div className="tip-card">
              <h4>🎯 Judul Yang Menjual</h4>
              <p>
                Buat judul yang singkat, mudah diingat, dan menggambarkan esensi cerita.
              </p>
            </div>

            <div className="tip-card">
              <h4>🔥 Sinopsis Kuat</h4>
              <p>
                Hook pembaca di 2 kalimat pertama! Perkenalkan konflik utama.
              </p>
            </div>

            <div className="tip-card">
              <h4>🎨 Cover Profesional</h4>
              <p>
                Cover adalah kesan pertama. Gunakan gambar berkualitas tinggi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNovelPage;