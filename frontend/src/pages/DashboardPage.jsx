import React, { useState, useEffect } from 'react';
import { novelService } from '../services/novelService';
import { chapterService } from '../services/chapterService';

const DashboardPage = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('reading');

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Selamat datang, {user.username}!</p>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'reading' ? 'active' : ''}
            onClick={() => setActiveTab('reading')}
          >
            Sedang Dibaca
          </button>
          <button 
            className={activeTab === 'bookmarks' ? 'active' : ''}
            onClick={() => setActiveTab('bookmarks')}
          >
            Bookmark
          </button>
          {user.role === 'author' && (
            <>
              <button 
                className={activeTab === 'mynovels' ? 'active' : ''}
                onClick={() => setActiveTab('mynovels')}
              >
                Novel Saya
              </button>
              <button 
                className={activeTab === 'create' ? 'active' : ''}
                onClick={() => setActiveTab('create')}
              >
                Buat Novel
              </button>
            </>
          )}
          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Pengaturan
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'reading' && <ReadingHistory onNavigate={onNavigate} />}
          {activeTab === 'bookmarks' && <Bookmarks onNavigate={onNavigate} />}
          {activeTab === 'mynovels' && <MyNovels onNavigate={onNavigate} />}
          {activeTab === 'create' && <CreateNovel onNavigate={onNavigate} />}
          {activeTab === 'settings' && <Settings user={user} />}
        </div>
      </div>
    </div>
  );
};

const ReadingHistory = ({ onNavigate }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    setHistory(data);
  }, []);

  if (history.length === 0) {
    return <div className="empty-state">Belum ada riwayat bacaan</div>;
  }

  return (
    <div className="history-list">
      {history.map((item, idx) => (
        <div key={idx} className="history-item" onClick={() => 
          onNavigate('chapter', { slug: item.slug, chapter: item.chapter })
        }>
          <div>
            <h3>{item.novel}</h3>
            <p>Bab {item.chapter}</p>
          </div>
          <button className="btn-continue">Lanjutkan</button>
        </div>
      ))}
    </div>
  );
};

const Bookmarks = ({ onNavigate }) => {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarks(data);
  }, []);

  if (bookmarks.length === 0) {
    return <div className="empty-state">Belum ada bookmark</div>;
  }

  return (
    <div className="history-list">
      {bookmarks.map((item, idx) => (
        <div key={idx} className="history-item" onClick={() => 
          onNavigate('chapter', { slug: item.slug, chapter: item.chapter })
        }>
          <div>
            <h3>{item.novel}</h3>
            <p>Bab {item.chapter}</p>
          </div>
          <button className="btn-continue">Buka</button>
        </div>
      ))}
    </div>
  );
};

const MyNovels = ({ onNavigate }) => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      const response = await novelService.getAuthorNovels();
      setNovels(response.data);
    } catch (error) {
      console.error('Error loading novels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader">Memuat...</div>;

  if (novels.length === 0) {
    return <div className="empty-state">Belum ada novel. Buat novel pertamamu!</div>;
  }

  return (
    <div className="my-novels-list">
      {novels.map(novel => (
        <div key={novel._id} className="my-novel-card">
          <div className="my-novel-info">
            <h3>{novel.title}</h3>
            <div className="my-novel-meta">
              <span>{novel.totalChapters} bab</span>
              <span>{novel.views} views</span>
              <span>★ {novel.rating.average.toFixed(1)}</span>
            </div>
          </div>
          <div className="my-novel-actions">
            <button onClick={() => onNavigate('novel', { slug: novel.slug })}>
              Lihat
            </button>
            <button onClick={() => handleEdit(novel)}>Edit</button>
            <button onClick={() => handleAddChapter(novel)}>+ Bab</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const CreateNovel = ({ onNavigate }) => {
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

  const genreOptions = ['Romance', 'Fantasy', 'Action', 'Horror', 'Mystery', 'Sci-Fi', 'Thriller', 'Comedy'];

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
    setFormData({ ...formData, genres });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const response = await novelService.createNovel({
        ...formData,
        tags
      });
      alert('Novel berhasil dibuat!');
      onNavigate('novel', { slug: response.data.slug });
    } catch (err) {
      setError(err.message || 'Gagal membuat novel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-novel-form">
      <h2>Buat Novel Baru</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Judul Novel *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Judul menarik untuk novelmu"
          />
        </div>

        <div className="form-group">
          <label>Sinopsis *</label>
          <textarea
            name="synopsis"
            value={formData.synopsis}
            onChange={handleChange}
            required
            rows="6"
            placeholder="Ceritakan tentang novelmu..."
          />
        </div>

        <div className="form-group">
          <label>Genre *</label>
          <div className="genre-selector">
            {genreOptions.map(genre => (
              <button
                key={genre}
                type="button"
                className={`genre-btn ${formData.genres.includes(genre) ? 'active' : ''}`}
                onClick={() => handleGenreToggle(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Tags (pisahkan dengan koma)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="reinkarnasi, cultivation, op mc"
          />
        </div>

        <div className="form-group">
          <label>URL Cover</label>
          <input
            type="url"
            name="cover"
            value={formData.cover}
            onChange={handleChange}
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="mature"
              checked={formData.mature}
              onChange={handleChange}
            />
            Konten dewasa (18+)
          </label>
        </div>

        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? 'Membuat...' : 'Buat Novel'}
        </button>
      </form>
    </div>
  );
};

const Settings = ({ user }) => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    fontSize: 16,
    lineHeight: 1.6
  });

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem('readerPreferences') || '{}');
    setPreferences({
      theme: prefs.theme || 'light',
      fontSize: prefs.fontSize || 16,
      lineHeight: prefs.lineHeight || 1.6
    });
  }, []);

  const handleSave = () => {
    localStorage.setItem('readerPreferences', JSON.stringify(preferences));
    alert('Pengaturan tersimpan!');
  };

  return (
    <div className="settings-panel">
      <h2>Pengaturan Pembaca</h2>
      
      <div className="form-group">
        <label>Tema Default</label>
        <select 
          value={preferences.theme}
          onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
        >
          <option value="light">Terang</option>
          <option value="dark">Gelap</option>
        </select>
      </div>

      <div className="form-group">
        <label>Ukuran Font: {preferences.fontSize}px</label>
        <input
          type="range"
          min="12"
          max="24"
          value={preferences.fontSize}
          onChange={(e) => setPreferences({...preferences, fontSize: parseInt(e.target.value)})}
        />
      </div>

      <div className="form-group">
        <label>Spasi Baris: {preferences.lineHeight}</label>
        <input
          type="range"
          min="1.2"
          max="2.4"
          step="0.1"
          value={preferences.lineHeight}
          onChange={(e) => setPreferences({...preferences, lineHeight: parseFloat(e.target.value)})}
        />
      </div>

      <button onClick={handleSave} className="btn-primary">Simpan Pengaturan</button>
    </div>
  );
};

export default DashboardPage;