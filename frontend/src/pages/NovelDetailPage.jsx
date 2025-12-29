import React, { useState, useEffect } from 'react';
import { novelService } from '../services/novelService';
import { reviewService } from '../services/reviewService';

const NovelDetailPage = ({ slug, onNavigate, user }) => {
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadNovel();
  }, [slug]);

  const loadNovel = async () => {
    try {
      const response = await novelService.getNovelBySlug(slug);
      setNovel(response.data);
      setChapters(response.data.chapters || []);

      // Load reviews
      const reviewsResponse = await reviewService.getReviews(response.data._id);
      setReviews(reviewsResponse.data || []);
    } catch (error) {
      console.error('Error loading novel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const exists = subscriptions.find(s => s.novelId === novel._id);
    
    if (!exists) {
      subscriptions.push({
        novelId: novel._id,
        title: novel.title,
        slug: novel.slug,
        timestamp: Date.now()
      });
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      alert('Berhasil berlangganan novel ini!');
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      alert('Sudah berlangganan novel ini');
    }
  };

  if (loading) {
    return <div className="loader">Memuat novel...</div>;
  }

  if (!novel) {
    return <div className="error">Novel tidak ditemukan</div>;
  }

  return (
    <div className="novel-detail-page">
      <div className="container">
        <div className="novel-detail-header">
          <div className="novel-detail-cover">
            {novel.cover ? (
              <img src={novel.cover} alt={novel.title} />
            ) : (
              <div className="cover-placeholder">{novel.title[0]}</div>
            )}
          </div>

          <div className="novel-detail-info">
            <h1>{novel.title}</h1>
            <p className="novel-detail-author">
              oleh {novel.author.username}
              {novel.author.badges?.map(badge => (
                <span key={badge} className="author-badge">{badge}</span>
              ))}
            </p>

            <div className="novel-detail-meta">
              <div className="meta-item">
                <span className="meta-label">Rating</span>
                <span className="meta-value">
                  ★ {novel.rating.average.toFixed(1)}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Bab</span>
                <span className="meta-value">{novel.totalChapters}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className="meta-value">{novel.status}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Views</span>
                <span className="meta-value">{novel.views.toLocaleString()}</span>
              </div>
            </div>

            <div className="novel-detail-genres">
              {novel.genres.map(genre => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>

            <div className="novel-detail-synopsis">
              <h2>Sinopsis</h2>
              <p>{novel.synopsis}</p>
            </div>

            <div className="novel-detail-actions">
              {chapters.length > 0 && (
                <button 
                  className="btn-primary btn-large"
                  onClick={() => onNavigate('chapter', { slug, chapter: 1 })}
                >
                  Mulai Membaca
                </button>
              )}
              <button 
                className="btn-secondary btn-large"
                onClick={handleSubscribe}
              >
                🔔 Langganan
              </button>
            </div>
          </div>
        </div>

        <div className="chapters-section">
          <h2>Daftar Bab ({chapters.length})</h2>
          <div className="chapters-list">
            {chapters.map(chapter => (
              <div 
                key={chapter._id} 
                className="chapter-item"
                onClick={() => onNavigate('chapter', { slug, chapter: chapter.number })}
              >
                <div className="chapter-title-wrapper">
                  <h3>Bab {chapter.number}: {chapter.title}</h3>
                  <span className="chapter-date">
                    {new Date(chapter.publishedAt).toLocaleDateString('id-ID')} • {chapter.views} views
                  </span>
                </div>
                {chapter.isPremium && (
                  <span className="chapter-premium">Premium</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="reviews-section">
          <h2>Ulasan & Rating ({reviews.length})</h2>

          {user && (
            <>
              {!showReviewForm ? (
                <button 
                  className="btn-primary"
                  onClick={() => setShowReviewForm(true)}
                >
                  Tulis Ulasan
                </button>
              ) : (
                <ReviewForm 
                  novelId={novel._id}
                  onSubmit={(review) => {
                    setReviews([review, ...reviews]);
                    setShowReviewForm(false);
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}
            </>
          )}

          <div className="reviews-list">
            {reviews.map(review => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewForm = ({ novelId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Pilih rating terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      const response = await reviewService.addReview(novelId, {
        rating,
        title,
        content
      });
      onSubmit(response.data);
      alert('Ulasan berhasil ditambahkan!');
    } catch (error) {
      alert('Gagal menambahkan ulasan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Tulis Ulasan</h3>
      
      <div className="form-group">
        <label>Rating</label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Judul Ulasan</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength="200"
          placeholder="Rangkum pendapatmu dalam 1 kalimat"
        />
      </div>

      <div className="form-group">
        <label>Isi Ulasan</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength="5000"
          rows="8"
          placeholder="Ceritakan pengalamanmu membaca novel ini..."
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim Ulasan'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Batal
        </button>
      </div>
    </form>
  );
};

const ReviewCard = ({ review }) => {
  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          <strong>{review.user.username}</strong>
          <div className="review-rating">
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
        </div>
        <span className="review-date">
          {new Date(review.createdAt).toLocaleDateString('id-ID')}
        </span>
      </div>
      <h3 className="review-title">{review.title}</h3>
      <p className="review-content">{review.content}</p>
      <div className="review-helpful">
        👍 {review.helpful} orang merasa ulasan ini membantu
      </div>
    </div>
  );
};

export default NovelDetailPage;