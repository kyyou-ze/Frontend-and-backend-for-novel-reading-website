import React, { useState, useEffect } from 'react';
import { novelService } from '../services/novelService';

const SearchPage = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    status: '',
    sort: 'popular'
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      let response;
      if (query.trim()) {
        response = await novelService.searchNovels(query);
      } else {
        response = await novelService.getNovels({ ...filters, limit: 20 });
      }
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query) {
      handleSearch();
    }
  }, [filters]);

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>Cari Novel</h1>
          
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, penulis, atau tag..."
              className="search-input"
            />
            <button type="submit" className="btn-primary">Cari</button>
          </form>
        </div>

        <div className="search-filters">
          <select 
            value={filters.genre}
            onChange={(e) => setFilters({...filters, genre: e.target.value})}
          >
            <option value="">Semua Genre</option>
            <option value="Romance">Romance</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Action">Action</option>
            <option value="Horror">Horror</option>
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Semua Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="hiatus">Hiatus</option>
          </select>

          <select 
            value={filters.sort}
            onChange={(e) => setFilters({...filters, sort: e.target.value})}
          >
            <option value="popular">Populer</option>
            <option value="rating">Rating Tertinggi</option>
            <option value="updated">Baru Diperbarui</option>
          </select>
        </div>

        {loading ? (
          <div className="loader">Mencari...</div>
        ) : (
          <div className="search-results">
            {results.length === 0 ? (
              <div className="empty-state">Tidak ada hasil ditemukan</div>
            ) : (
              <div className="novel-grid">
                {results.map(novel => (
                  <NovelCard key={novel._id} novel={novel} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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

export default SearchPage;