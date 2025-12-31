import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chapterService } from '../services/chapterService';
import { novelService } from '../services/novelService';

const CreateChapterPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [novel, setNovel] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPremium: false,
    price: 0,
    schedule: '',
    isDraft: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  useEffect(() => {
    loadNovel();
    loadDraft();
  }, [slug]);

  useEffect(() => {
    const words = formData.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      if (formData.content && !saving) {
        saveDraft();
      }
    }, 30000);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formData.content]);

  const loadNovel = async () => {
    try {
      const response = await novelService.getNovelBySlug(slug);
      setNovel(response.data);
    } catch (error) {
      setError('Gagal memuat novel');
    }
  };

  const loadDraft = () => {
    const draft = localStorage.getItem(`draft_${slug}`);
    if (draft) {
      const parsed = JSON.parse(draft);
      setFormData(parsed);
      setLastSaved(new Date(parsed.savedAt));
    }
  };

  const saveDraft = () => {
    setSaving(true);
    const draft = {
      ...formData,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`draft_${slug}`, JSON.stringify(draft));
    setLastSaved(new Date());
    setTimeout(() => setSaving(false), 500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (publishNow = false) => {
    setError('');

    if (!formData.title.trim()) {
      setError('Judul bab harus diisi');
      return;
    }

    if (formData.content.length < 100) {
      setError('Konten minimal 100 karakter');
      return;
    }

    setLoading(true);

    try {
      const chapterData = {
        novelId: novel._id,
        title: formData.title,
        content: formData.content,
        isPremium: formData.isPremium,
        price: formData.isPremium ? formData.price : 0,
        schedule: formData.schedule || null,
        isDraft: !publishNow && !formData.schedule
      };

      await chapterService.createChapter(chapterData);
      localStorage.removeItem(`draft_${slug}`);

      alert(publishNow ? '✅ Bab berhasil dipublish!' : '💾 Bab berhasil disimpan!');
      navigate(`/novel/${slug}`);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan bab');
    } finally {
      setLoading(false);
    }
  };

  if (!novel) {
    return (
      <div className="loader" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div> Memuat...
      </div>
    );
  }

  return (
    <div className="create-chapter-page">
      <div className="editor-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="back-btn" 
                onClick={() => navigate(`/novel/${slug}`)}
              >
                ← Kembali
              </button>
              <div className="novel-info">
                <h2>{novel.title}</h2>
                <p>Bab {novel.totalChapters + 1}</p>
              </div>
            </div>

            <div className="header-right">
              {lastSaved && (
                <span className="last-saved">
                  {saving ? '💾 Menyimpan...' : `✓ Tersimpan ${lastSaved.toLocaleTimeString('id-ID')}`}
                </span>
              )}
              <button 
                className="btn-save" 
                onClick={() => handleSubmit(false)}
                disabled={loading}
              >
                💾 Simpan Draft
              </button>
              <button 
                className="btn-publish" 
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                ✨ Publish Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="editor-container">
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
              placeholder="Judul Bab (contoh: Prolog - Awal Perjalanan)"
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
              placeholder="Mulai menulis cerita Anda di sini..."
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

        <div className="editor-sidebar">
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

            <div className="setting-item">
              <label htmlFor="schedule">📅 Jadwal Publish</label>
              <input
                id="schedule"
                type="datetime-local"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
              />
              <small>Kosongkan untuk publish langsung sekarang</small>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>📊 Statistik Novel</h3>
            <div className="stat-item">
              <span className="stat-label">Total Bab</span>
              <span className="stat-value">{novel.totalChapters}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Views</span>
              <span className="stat-value">{novel.views.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rating</span>
              <span className="stat-value">★ {novel.rating.average.toFixed(1)}</span>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>💡 Tips Menulis</h3>
            <ul className="tips-list">
              <li>Buat hook menarik di awal</li>
              <li>Show, don't tell</li>
              <li>Variasikan panjang kalimat</li>
              <li>End with cliffhanger</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChapterPage;