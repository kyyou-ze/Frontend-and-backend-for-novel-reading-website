import React, { useState, useEffect } from 'react';
import { novelService } from '../services/novelService';

const HomePage = ({ onNavigate, user }) => {
  const [popularNovels, setPopularNovels] = useState([]);
  const [recentNovels, setRecentNovels] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [popular, recent] = await Promise.all([
        novelService.getNovels({ sort: 'popular', limit: 6 }),
        novelService.getNovels({ sort: 'updated', limit: 6 })
      ]);

      setPopularNovels(popular.data);
      setRecentNovels(recent.data);

      // Load recommendations based on reading history
      if (user) {
        const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        if (history.length > 0) {
          // Get genre from last read novel
          const lastRead = history[0];
          const recommended = await novelService.getNovels({ 
            genre: lastRead.genre, 
            limit: 4 
          });
          setRecommendations(recommended.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader">Memuat...</div>;
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Baca Novel Digital Favoritmu</h1>
          <p>Ribuan cerita menarik menanti untuk dibaca</p>
          <button className="btn-large" onClick={() => onNavigate('search')}>
            Jelajahi Novel
          </button>
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Rekomendasi Untukmu</h2>
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
          <h2 className="section-title">Novel Populer</h2>
          <div className="novel-grid">
            {popularNovels.map(novel => (
              <NovelCard key={novel._id} novel={novel} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Baru Diperbarui</h2>
          <div className="novel-grid">
            {recentNovels.map(novel => (
              <NovelCard key={novel._id} novel={novel} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>
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
      </div>
      <div className="novel-info">
        <h3 className="novel-title">{novel.title}</h3>
        <p className="novel-author">{novel.author.username}</p>
        <div className="novel-meta">
          <span className="rating">★ {novel.rating.average.toFixed(1)}</span>
          <span className="chapters">{novel.totalChapters} bab</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;