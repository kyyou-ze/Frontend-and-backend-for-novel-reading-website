import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chapterService } from '../services/chapterService';
import { novelService } from '../services/novelService';

const EditChapterPage = () => {
  const { slug, chapterNum } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPremium: false,
    price: 0
  });
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [slug, chapterNum]);

  useEffect(() => {
    const words = formData.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [formData.content]);

  const loadData = async () => {
    try {
      const [novelRes, chapterRes] = await Promise.all([
        novelService.getNovelBySlug(slug),
        chapterService.getChapter(slug, chapterNum)
      ]);
      
      setNovel(novelRes.data);
      const chapterData = chapterRes.data.chapter;
      setChapter(chapterData);
      
      setFormData({
        title: chapterData.title,
        content: chapterData.content,
        isPremium: chapterData.isPremium || false,
        price: chapterData.price || 0
      });
    } catch (err) {
      setError('Gagal memuat chapter');
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

  const handleSubmit = async () => {
    setError('');

    if (!formData.title.trim()) {
      setError('Judul chapter harus diisi');
      return;
    }

    if (formData.content.length < 100) {
      setError('Konten minimal 100 karakter');
      return;
    }

    setSaving(true);

    try {
      await chapterService.updateChapter(chapter._id, formData);
      alert('✅ Chapter berhasil diperbarui!');
      navigate(`/novel/${slug}/${chapterNum}`);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui chapter');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ Yakin ingin menghapus chapter ini? Tindakan ini tidak dapat dibatalkan!')) {
      return;
    }

    try {
      await chapterService.deleteChapter(chapter._id);
      alert('✅ Chapter berhasil dihapus!');
      navigate(`/novel/${slug}`);
    } catch (err) {
      alert('❌ Gagal menghapus chapter: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        <p>Memuat chapter...</p>
      </div>
    );
  }

  if (!novel || !chapter) {
    return (
      <div className="error">
        <h2>❌ Chapter tidak ditemukan</h2>
        <button onClick={() => navigate(`/novel/${slug}`)} className="btn-primary">
          Kembali ke Novel
        </button>
      </div>
    );
  }

  return (
    <div className="create-chapter-page">
      {/* EDITOR HEADER */}
      <div className="editor-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="back-btn" 
                onClick={() => navigate(`/novel/${slug}/${chapterNum}`)}
              >
                ← Kembali
              </button>
              <div className="novel-info">
                <h2>{novel.title}</h2>
                <p>Edit Bab {chapter.number}</p>
              </div>
            </div>

            <div className="header-right">
              <button 
                className="btn-save" 
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? '💾 Menyimpan...' : '💾 Simpan Perubahan'}
              </button>
              <button 
                className="btn-secondary" 
                onClick={handleDelete}
                style={{ 
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  color: '#991b1b',
                  borderColor: '#fca5a5'
                }}
              >
                🗑️ Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDITOR CONTAINER */}
      <div className="editor-container">
        {/* MAIN EDITOR */}
        <div className="editor-main">
          {error && (
            <div className="alert alert-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Judul Bab"
              className="chapter-title-input"
              maxLength="200"
            />
            <span className="char-count">{formData.title.length}/200 karakter</span>
          </div>

          <div className="editor-wrapper">
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Konten chapter..."
              className="chapter-editor"
            />
            
            <div className="editor-footer">
              <div className="word-count">
                <strong>{wordCount.toLocaleString()}</strong> kata
                {wordCount < 500 && wordCount > 0 && (
                  <span className="warning"> • Minimal 500 kata direkomendasikan</span>
                )}
                {wordCount >= 500 && wordCount < 1000 && (
                  <span style={{ color: '#f59e0b' }}> • Bagus! Tambah lagi untuk optimal</span>
                )}
                {wordCount >= 1000 && (
                  <span style={{ color: '#10b981' }}> • Sempurna! ✓</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="editor-sidebar">
          {/* SETTINGS */}
          <div className="sidebar-section">
            <h3>⚙️ Pengaturan Bab</h3>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={formData.isPremium}
                  onChange={handleChange}
                />
                <span>💎 Bab Premium</span>
              </label>
              {formData.isPremium && (
                <div className="premium-settings">
                  <label htmlFor="price">Harga (koin)</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    max="1000"
                    placeholder="50"
                  />
                  <small>💡 Harga rata-rata: 50-100 koin per bab</small>
                </div>
              )}
            </div>
          </div>

          {/* STATISTICS */}
          <div className="sidebar-section">
            <h3>📊 Statistik Chapter</h3>
            <div className="stat-item">
              <span className="stat-label">Views</span>
              <span className="stat-value">{chapter.views.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rating</span>
              <span className="stat-value">★ {chapter.rating?.average?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Status</span>
              <span className="stat-value" style={{ 
                color: chapter.approvalStatus === 'approved' ? '#10b981' : '#f59e0b' 
              }}>
                {chapter.approvalStatus === 'approved' ? '✅ Approved' : '⏳ Pending'}
              </span>
            </div>
          </div>

          {/* INFO */}
          <div className="sidebar-section">
            <h3>ℹ️ Informasi</h3>
            <div className="stat-item">
              <span className="stat-label">Nomor Bab</span>
              <span className="stat-value">{chapter.number}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Dipublish</span>
              <span className="stat-value" style={{ fontSize: '0.85rem' }}>
                {chapter.publishedAt 
                  ? new Date(chapter.publishedAt).toLocaleDateString('id-ID')
                  : 'Belum dipublish'}
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="sidebar-section">
            <h3>⚡ Actions</h3>
            <button 
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '12px' }}
              disabled={saving}
            >
              💾 Simpan
            </button>
            <button 
              onClick={() => navigate(`/novel/${slug}/${chapterNum}`)}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '12px' }}
            >
              👁️ Preview
            </button>
            <button 
              onClick={handleDelete}
              className="btn btn-secondary"
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                color: '#991b1b',
                borderColor: '#fca5a5'
              }}
            >
              🗑️ Hapus Chapter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditChapterPage;