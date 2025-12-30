import React, { useState, useEffect } from 'react';
import { novelService } from '../services/novelService';

const DashboardPage = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('reading');

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Selamat datang, {user.username}! 👋</p>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'reading' ? 'active' : ''}
            onClick={() => setActiveTab('reading')}
          >
            📖 Sedang Dibaca
          </button>
          <button 
            className={activeTab === 'bookmarks' ? 'active' : ''}
            onClick={() => setActiveTab('bookmarks')}
          >
            🔖 Bookmark
          </button>
          {user.role === 'author' && (
            <button 
              className={activeTab === 'mynovels' ? 'active' : ''}
              onClick={() => setActiveTab('mynovels')}
            >
              📚 Novel Saya
            </button>
          )}
          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Pengaturan
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'reading' && <ReadingHistory onNavigate={onNavigate} />}
          {activeTab === 'bookmarks' && <Bookmarks onNavigate={onNavigate} />}
          {activeTab === 'mynovels' && <MyNovels onNavigate={onNavigate} user={user} />}
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
    return (
      <div className="empty-state">
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📚</div>
        <h3>Belum Ada Riwayat Bacaan</h3>
        <p>Mulai baca novel favoritmu sekarang!</p>
        <button 
          className="btn-primary" 
          onClick={() => onNavigate('search')}
          style={{ marginTop: '20px' }}
        >
          Jelajahi Novel
        </button>
      </div>
    );
  }

  return (
    <div className="history-list">
      {history.map((item, idx) => (
        <div 
          key={idx} 
          className="history-item" 
          onClick={() => onNavigate('chapter', { slug: item.slug, chapter: item.chapter })}
        >
          <div>
            <h3>{item.novel}</h3>
            <p>Bab {item.chapter}</p>
            <span className="genre-tag" style={{ marginTop: '8px', display: 'inline-block' }}>
              {item.genre}
            </span>
          </div>
          <button className="btn-continue">
            Lanjutkan →
          </button>
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

  const handleRemove = (e, index) => {
    e.stopPropagation();
    const newBookmarks = bookmarks.filter((_, i) => i !== index);
    setBookmarks(newBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
  };

  if (bookmarks.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔖</div>
        <h3>Belum Ada Bookmark</h3>
        <p>Tandai novel favoritmu untuk akses cepat!</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {bookmarks.map((item, idx) => (
        <div 
          key={idx} 
          className="history-item"
          style={{ cursor: 'pointer' }}
        >
          <div onClick={() => onNavigate('chapter', { slug: item.slug, chapter: item.chapter })}>
            <h3>{item.novel}</h3>
            <p>Bab {item.chapter}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-continue"
              onClick={() => onNavigate('chapter', { slug: item.slug, chapter: item.chapter })}
            >
              Buka
            </button>
            <button 
              onClick={(e) => handleRemove(e, idx)}
              style={{
                padding: '10px 16px',
                background: '#fee2e2',
                color: '#991b1b',
                border: '2px solid #fca5a5',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const MyNovels = ({ onNavigate, user }) => {
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

  const handleAddChapter = (novel) => {
    onNavigate('create-chapter', { slug: novel.slug });
  };

  const handleDelete = async (novelId, slug) => {
    if (!confirm('Yakin ingin menghapus novel ini? Tindakan ini tidak dapat dibatalkan!')) {
      return;
    }

    try {
      await novelService.deleteNovel(slug);
      setNovels(novels.filter(n => n._id !== novelId));
      alert('✅ Novel berhasil dihapus');
    } catch (error) {
      alert('❌ Gagal menghapus novel: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        Memuat novel...
      </div>
    );
  }

  if (novels.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✍️</div>
        <h3>Belum Ada Novel</h3>
        <p>Waktunya wujudkan imajinasi Anda menjadi karya nyata!</p>
        <button 
          className="btn-primary btn-large" 
          onClick={() => onNavigate('create-novel')}
          style={{ marginTop: '20px' }}
        >
          ✨ Buat Novel Pertama
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Novel Saya ({novels.length})</h3>
        <button 
          className="btn-primary"
          onClick={() => onNavigate('create-novel')}
        >
          ➕ Buat Novel Baru
        </button>
      </div>

      <div className="my-novels-list">
        {novels.map(novel => (
          <div key={novel._id} className="my-novel-card">
            <div className="my-novel-info">
              <h3>{novel.title}</h3>
              <div className="my-novel-meta">
                <span>📖 {novel.totalChapters} bab</span>
                <span>👁️ {novel.views.toLocaleString()} views</span>
                <span>⭐ {novel.rating.average.toFixed(1)}</span>
                <span 
                  style={{ 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    background: novel.status === 'ongoing' ? '#d1fae5' : '#e2e8f0',
                    color: novel.status === 'ongoing' ? '#065f46' : '#475569',
                    fontWeight: '700',
                    fontSize: '0.85rem'
                  }}
                >
                  {novel.status === 'ongoing' ? '🟢 Ongoing' : '⚪ Completed'}
                </span>
              </div>
            </div>
            <div className="my-novel-actions">
              <button onClick={() => onNavigate('novel', { slug: novel.slug })}>
                👁️ Lihat
              </button>
              <button onClick={() => handleAddChapter(novel)}>
                ➕ Bab Baru
              </button>
              <button 
                onClick={() => handleDelete(novel._id, novel.slug)}
                style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}
              >
                🗑️ Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Settings = ({ user }) => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    fontSize: 16,
    lineHeight: 1.6
  });
  const [saved, setSaved] = useState(false);

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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-panel">
      <h2 style={{ marginBottom: '32px', fontSize: '1.8rem' }}>⚙️ Pengaturan Pembaca</h2>
      
      {saved && (
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          color: '#065f46',
          borderRadius: '12px',
          marginBottom: '24px',
          fontWeight: '600',
          border: '2px solid #6ee7b7'
        }}>
          ✅ Pengaturan berhasil disimpan!
        </div>
      )}

      <div className="form-group">
        <label style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'block', fontWeight: '700' }}>
          🎨 Tema Default
        </label>
        <select 
          value={preferences.theme}
          onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
          style={{ 
            width: '100%',
            padding: '14px 18px',
            fontSize: '1rem',
            borderRadius: '12px',
            border: '2px solid var(--border)',
            background: 'var(--bg-secondary)'
          }}
        >
          <option value="light">☀️ Terang</option>
          <option value="dark">🌙 Gelap</option>
        </select>
      </div>

      <div className="form-group">
        <label style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'block', fontWeight: '700' }}>
          📏 Ukuran Font: <strong style={{ color: 'var(--primary)' }}>{preferences.fontSize}px</strong>
        </label>
        <input
          type="range"
          min="12"
          max="24"
          value={preferences.fontSize}
          onChange={(e) => setPreferences({...preferences, fontSize: parseInt(e.target.value)})}
          style={{ width: '100%', cursor: 'pointer', height: '8px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span>Kecil (12px)</span>
          <span>Besar (24px)</span>
        </div>
      </div>

      <div className="form-group">
        <label style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'block', fontWeight: '700' }}>
          📐 Spasi Baris: <strong style={{ color: 'var(--primary)' }}>{preferences.lineHeight.toFixed(1)}</strong>
        </label>
        <input
          type="range"
          min="1.2"
          max="2.4"
          step="0.1"
          value={preferences.lineHeight}
          onChange={(e) => setPreferences({...preferences, lineHeight: parseFloat(e.target.value)})}
          style={{ width: '100%', cursor: 'pointer', height: '8px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span>Rapat (1.2)</span>
          <span>Longgar (2.4)</span>
        </div>
      </div>

      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
        borderRadius: '12px',
        marginTop: '32px',
        marginBottom: '24px',
        border: '2px solid var(--border)'
      }}>
        <h4 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>📝 Preview Teks</h4>
        <p style={{ 
          fontSize: `${preferences.fontSize}px`, 
          lineHeight: preferences.lineHeight,
          fontFamily: 'Georgia, serif',
          color: 'var(--text-primary)'
        }}>
          Ini adalah contoh teks dengan pengaturan yang Anda pilih. "Setiap orang memiliki mimpi," kata sang mentor dengan suara penuh harapan. Di tengah kegelapan malam, cahaya bulan menerangi jalan yang panjang dan berliku.
        </p>
      </div>

      <button onClick={handleSave} className="btn-primary btn-full btn-large">
        💾 Simpan Pengaturan
      </button>
    </div>
  );
};

export default DashboardPage;