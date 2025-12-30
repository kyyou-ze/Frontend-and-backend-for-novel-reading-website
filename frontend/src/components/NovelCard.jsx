import React from 'react';
import { Link } from 'react-router-dom';

const NovelCard = ({ novel }) => {
  return (
    <Link to={`/novel/${novel.slug}`} className="novel-card">
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
    </Link>
  );
};

export default NovelCard;