import React, { useState, useEffect } from 'react';
import { novelService } from '../services/novelService';

const HomePage = ({ onNavigate, user }) => {
  const [popularNovels, setPopularNovels] = useState([]);
  const [recentNovels, setRecentNovels] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [popular, recent] = await Promise.all([
        novelService.getNovels({ sort: 'popular', limit: 6 }),
        novelService.getNovels({ sort: 'updated', limit: 6 })
      ]);

      setPopularNovels(popular.data || []);
      setRecentNovels(recent.data || []);

      // Load recommendations based on reading history
      if (user) {
        const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        if (history.length > 0) {
          try {
            // Get genre from last read novel
            const lastRead = history[0];
            const recommended = await novelService.getNovels({ 
              genre: lastRead.genre, 
              limit: 4 
            });
            setRecommendations(recommended.data || []);
          } catch (err) {
            console.log('Failed to load recommendations:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: 'var(--danger)'
      }}>
        <h2>❌ Terjadi Kesalahan</h2>
        <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>{error}</p>
        <button 
          onClick={loadData} 
          className="btn-primary"
          style={{ marginTop: '20px' }}
        >
          🔄 Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Baca Novel Digital Favoritmu</h1>
          <p>Ribuan cerita menarik menanti untuk dibaca</p>
          <button className="btn-large" onClick={() => onNavigate('search')}>
            🔍 Jelajahi Novel
          </button>
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">🎯 Rekomendasi Untukmu</h2>
            <div className="novel-grid">
              {recommendations.map(novel => (
                <NovelCard key={novel._id} novel={novel} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <h2 className="section-title">🔥 Novel Populer</h2>
          {popularNovels.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada novel yang tersedia</p>
              {user?.role === 'author' && (
                <button 
                  onClick={() => onNavigate('create-novel')}
                  className="btn-primary"
                  style={{ marginTop: '20px' }}
                >
                  ✍️ Buat Novel Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="novel-grid">
              {popularNovels.map(novel => (
                <NovelCard key={novel._id} novel={novel} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">🆕 Baru Diperbarui</h2>
          {recentNovels.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada novel yang diperbarui</p>
            </div>
          ) : (
            <div className="novel-grid">
              {recentNovels.map(novel => (
                <NovelCard key={novel._id} novel={novel} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section untuk Author */}
      {user?.role === 'author' && (
        <section className="section" style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
          textAlign: 'center',
          margin: '0 20px 60px'
        }}>
          <div className="container">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              ✍️ Siap Berbagi Cerita Anda?
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '32px', opacity: 0.95 }}>
              Wujudkan imajinasi menjadi karya nyata dan bagikan dengan ribuan pembaca
            </p>
            <button 
              className="btn-large"
              onClick={() => onNavigate('create-novel')}
              style={{
                background: 'white',
                color: 'var(--primary)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
              }}
            >
              🚀 Buat Novel Sekarang
            </button>
          </div>
        </section>
      )}

      {/* CTA untuk Reader */}
      {!user && (
        <section className="section" style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
          textAlign: 'center',
          margin: '0 20px 60px',
          border: '2px solid var(--border)'
        }}>
          <div className="container">
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>
              📚 Mulai Petualangan Membaca
            </h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '32px', color: 'var(--text-secondary)' }}>
              Daftar sekarang untuk menyimpan riwayat bacaan dan mendapat rekomendasi personal
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn-primary btn-large"
                onClick={() => onNavigate('register')}
              >
                ✨ Daftar Gratis
              </button>
              <button 
                className="btn-secondary btn-large"
                onClick={() => onNavigate('login')}
              >
                🔑 Sudah Punya Akun
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const NovelCard = ({ novel, onNavigate }) => {
  return (
    <div className="novel-card" onClick={() => onNavigate('novel', { slug: novel.slug })}>
      <div className="novel-cover">
        {novel.cover ? (
          <img src={novel.cover} alt={novel.title} />
        ) : (
          <div className="cover-placeholder">{novel.title[0]}</div>
        )}
        {novel.mature && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(239, 68, 68, 0.95)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '700',
            zIndex: 2
          }}>
            18+
          </div>
        )}
      </div>
      <div className="novel-info">
        <h3 className="novel-title">{novel.title}</h3>
        <p className="novel-author">{novel.author.username}</p>
        <div className="novel-meta">
          <span className="rating">★ {novel.rating.average.toFixed(1)}</span>
          <span className="chapters">{novel.totalChapters} bab</span>
        </div>
        {novel.genres && novel.genres.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {novel.genres[0]}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;