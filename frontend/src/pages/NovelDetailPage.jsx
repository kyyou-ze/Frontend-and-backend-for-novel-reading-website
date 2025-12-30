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
      
      // Filter hanya chapter yang approved (kecuali author sendiri)
      const allChapters = response.data.chapters || [];
      const filteredChapters = allChapters.filter(ch => {
        if (user && user.id === response.data.author._id) {
          return true; // Author bisa lihat semua chapter miliknya
        }
        return ch.approvalStatus === 'approved' && !ch.isDraft;
      });
      
      setChapters(filteredChapters);

      // Load reviews
      const reviewsResponse = await reviewService.getReviews(response.data._id);
      setReviews(reviewsResponse.data || []);
    } catch (error) {
      console.error('Error loading novel:', error);
      alert('Gagal memuat novel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (!user) {
      alert('Login terlebih dahulu untuk berlangganan');
      onNavigate('login');
      return;
    }

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
      alert('✅ Berhasil berlangganan novel ini!');
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      alert('ℹ️ Anda sudah berlangganan novel ini');
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
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Memuat novel...</p>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="error" style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: 'var(--text-secondary)'
      }}>
        <h2>❌ Novel tidak ditemukan</h2>
        <button 
          onClick={() => onNavigate('home')} 
          className="btn-primary"
          style={{ marginTop: '20px' }}
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Check if novel is approved
  const isApproved = novel.approvalStatus === 'approved';
  const isAuthor = user && user.id === novel.author._id;
  const canView = isApproved || isAuthor;

  if (!canView) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>⏳ Novel Menunggu Persetujuan</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
          Novel ini sedang dalam proses review oleh admin.
        </p>
        <button 
          onClick={() => onNavigate('home')} 
          className="btn-primary"
          style={{ marginTop: '20px' }}
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="novel-detail-page">
      <div className="container">
        {/* Approval Status Badge for Author */}
        {isAuthor && novel.approvalStatus !== 'approved' && (
          <div style={{
            padding: '16px 24px',
            background: novel.approvalStatus === 'pending' 
              ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
              : 'linear-gradient(135deg, #fee2e2, #fecaca)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '24px',
            border: `2px solid ${novel.approvalStatus === 'pending' ? '#fbbf24' : '#fca5a5'}`,
            fontWeight: '600'
          }}>
            {novel.approvalStatus === 'pending' && (
              <>⏳ Novel sedang menunggu persetujuan admin</>
            )}
            {novel.approvalStatus === 'rejected' && (
              <>
                ❌ Novel ditolak: {novel.rejectionReason || 'Tidak ada alasan'}
              </>
            )}
          </div>
        )}

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
                <span className="meta-value">{chapters.length}</span>
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
              {novel.mature && (
                <span className="genre-tag" style={{
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  color: '#991b1b',
                  border: '2px solid #fca5a5'
                }}>
                  ⚠️ 18+
                </span>
              )}
            </div>

            <div className="novel-detail-synopsis">
              <h2>Sinopsis</h2>
              <p>{novel.synopsis}</p>
            </div>

            <div className="novel-detail-actions">
              {chapters.length > 0 && isApproved && (
                <button 
                  className="btn-primary btn-large"
                  onClick={() => onNavigate('chapter', { slug, chapter: chapters[0].number })}
                >
                  📖 Mulai Membaca
                </button>
              )}
              
              {isApproved && (
                <button 
                  className="btn-secondary btn-large"
                  onClick={handleSubscribe}
                >
                  🔔 Langganan
                </button>
              )}

              {isAuthor && (
                <button 
                  className="btn-secondary btn-large"
                  onClick={() => onNavigate('create-chapter', { slug })}
                >
                  ➕ Tambah Bab Baru
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="chapters-section">
          <h2>Daftar Bab ({chapters.length})</h2>
          {chapters.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada chapter yang tersedia</p>
              {isAuthor && (
                <button 
                  onClick={() => onNavigate('create-chapter', { slug })}
                  className="btn-primary"
                  style={{ marginTop: '20px' }}
                >
                  ➕ Buat Chapter Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="chapters-list">
              {chapters.map(chapter => (
                <div 
                  key={chapter._id} 
                  className="chapter-item"
                  onClick={() => onNavigate('chapter', { slug, chapter: chapter.number })}
                >
                  <div className="chapter-title-wrapper">
                    <h3>
                      Bab {chapter.number}: {chapter.title}
                      {isAuthor && chapter.approvalStatus === 'pending' && (
                        <span style={{
                          marginLeft: '12px',
                          padding: '4px 12px',
                          background: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          ⏳ Pending
                        </span>
                      )}
                      {isAuthor && chapter.approvalStatus === 'rejected' && (
                        <span style={{
                          marginLeft: '12px',
                          padding: '4px 12px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          ❌ Ditolak
                        </span>
                      )}
                    </h3>
                    <span className="chapter-date">
                      {new Date(chapter.publishedAt || chapter.createdAt).toLocaleDateString('id-ID')} • {chapter.views} views
                    </span>
                  </div>
                  {chapter.isPremium && (
                    <span className="chapter-premium">💎 Premium</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {isApproved && (
          <div className="reviews-section">
            <h2>Ulasan & Rating ({reviews.length})</h2>

            {user && (
              <>
                {!showReviewForm ? (
                  <button 
                    className="btn-primary"
                    onClick={() => setShowReviewForm(true)}
                  >
                    ✍️ Tulis Ulasan
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
              {reviews.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                  Belum ada ulasan. Jadilah yang pertama!
                </p>
              ) : (
                reviews.map(review => (
                  <ReviewCard key={review._id} review={review} />
                ))
              )}
            </div>
          </div>
        )}
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
      alert('⭐ Pilih rating terlebih dahulu');
      return;
    }

    if (!title.trim()) {
      alert('✏️ Judul ulasan harus diisi');
      return;
    }

    if (!content.trim()) {
      alert('📝 Isi ulasan harus diisi');
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
      alert('✅ Ulasan berhasil ditambahkan!');
    } catch (error) {
      alert('❌ Gagal menambahkan ulasan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>✍️ Tulis Ulasan</h3>
      
      <div className="form-group">
        <label>Rating *</label>
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
        {rating > 0 && (
          <p style={{ marginTop: '8px', color: 'var(--warning)', fontWeight: '600' }}>
            {rating === 1 && '⭐ Sangat Buruk'}
            {rating === 2 && '⭐⭐ Buruk'}
            {rating === 3 && '⭐⭐⭐ Cukup'}
            {rating === 4 && '⭐⭐⭐⭐ Bagus'}
            {rating === 5 && '⭐⭐⭐⭐⭐ Sangat Bagus!'}
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Judul Ulasan *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength="200"
          placeholder="Rangkum pendapatmu dalam 1 kalimat"
        />
        <span className="char-count">{title.length}/200</span>
      </div>

      <div className="form-group">
        <label>Isi Ulasan *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength="5000"
          rows="8"
          placeholder="Ceritakan pengalamanmu membaca novel ini..."
        />
        <span className="char-count">{content.length}/5000</span>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '⏳ Mengirim...' : '✅ Kirim Ulasan'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          ❌ Batal
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