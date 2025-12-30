import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { novelService } from '../services/novelService';
import NovelCard from '../components/NovelCard';

const HomePage = ({ user }) => {
  const [popularNovels, setPopularNovels] = useState([]);
  const [recentNovels, setRecentNovels] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      <div className="loader">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Memuat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>❌ Terjadi Kesalahan</h2>
        <p style={{ marginTop: '12px' }}>{error}</p>
        <button onClick={loadData} className="btn-primary" style={{ marginTop: '20px' }}>
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
          <button className="btn-large" onClick={() => navigate('/search')}>
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
                <NovelCard key={novel._id} novel={novel} />
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
                <button onClick={() => navigate('/create-novel')} className="btn-primary" style={{ marginTop: '20px' }}>
                  ✍️ Buat Novel Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="novel-grid">
              {popularNovels.map(novel => (
                <NovelCard key={novel._id} novel={novel} />
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
                <NovelCard key={novel._id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Sections remain the same */}
    </div>
  );
};

export default HomePage;
