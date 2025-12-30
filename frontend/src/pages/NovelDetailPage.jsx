import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { novelService } from '../services/novelService';
import { reviewService } from '../services/reviewService';

const NovelDetailPage = ({ user }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });

  useEffect(() => {
    loadNovel();
  }, [slug]);

  const loadNovel = async () => {
    try {
      const response = await novelService.getNovelBySlug(slug);
      setNovel(response.data);
      
      const allChapters = response.data.chapters || [];
      const filteredChapters = allChapters.filter(ch => {
        if (user && user.id === response.data.author._id) {
          return true;
        }
        return ch.approvalStatus === 'approved' && !ch.isDraft;
      });
      
      setChapters(filteredChapters);

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
      navigate('/login');
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
      
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      alert('ℹ️ Anda sudah berlangganan novel ini');
    }
  };

  // 🔥 NEW: Handle Review Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Login untuk memberikan review');
      navigate('/login');
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.content.trim()) {
      alert('Judul dan isi review harus diisi');
      return;
    }

    try {
      if (editingReview) {
        // Update existing review
        const result = await reviewService.updateReview(editingReview._id, reviewForm);
        setReviews(reviews.map(r => r._id === editingReview._id ? result.data : r));
        alert('✅ Review berhasil diperbarui!');
      } else {
        // Add new review
        const result = await reviewService.addReview(novel._id, reviewForm);
        setReviews([result.data, ...reviews]);
        alert('✅ Review berhasil ditambahkan!');
      }
      
      // Reset form
      setReviewForm({ rating: 5, title: '', content: '' });
      setShowReviewForm(false);
      setEditingReview(null);
      
      // Reload novel to update rating
      loadNovel();
    } catch (error) {
      alert('❌ ' + (error.message || 'Gagal menyimpan review'));
    }
  };

  // 🔥 NEW: Handle Mark Helpful
  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      alert('Login untuk menandai review sebagai helpful');
      return;
    }

    try {
      const result = await reviewService.markHelpful(reviewId);
      setReviews(reviews.map(r => r._id === reviewId ? result.data : r));
    } catch (error) {
      alert('Gagal menandai review');
    }
  };

  // 🔥 NEW: Handle Edit Review
  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title,
      content: review.content
    });
    setShowReviewForm(true);
    // Scroll to form
    setTimeout(() => {
      document.querySelector('.review-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 🔥 NEW: Cancel Edit
  const handleCancelEdit = () => {
    setEditingReview(null);
    setReviewForm({ rating: 5, title: '', content: '' });
    setShowReviewForm(false);
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        <p>Memuat novel...</p>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="error">
        <h2>❌ Novel tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const isApproved = novel.approvalStatus === 'approved';
  const isAuthor = user && user.id === novel.author._id;
  const canView = isApproved || isAuthor;
  const userReview = user ? reviews.find(r => r.user._id === user.id) : null;
  const canAddReview = user && !userReview && user.id !== novel.author._id;

  if (!canView) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>⏳ Novel Menunggu Persetujuan</h2>
        <p>Novel ini sedang dalam proses review oleh admin.</p>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '20px' }}>
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="novel-detail-page">
      <div className="container">
        {/* HEADER */}
        <div className="novel-detail-header">
          <div className="novel-detail-cover">
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
                padding: '8px 16px',
                borderRadius: '12px',
                fontWeight: '700',
                zIndex: 2
              }}>
                18+
              </div>
            )}
          </div>

          <div className="novel-detail-info">
            <h1>{novel.title}</h1>
            <div className="novel-detail-author">
              oleh {novel.author.username}
              {novel.author.badges?.map((badge, i) => (
                <span key={i} className="author-badge">{badge}</span>
              ))}
            </div>

            <div className="novel-detail-meta">
              <div className="meta-item">
                <span className="meta-label">Rating</span>
                <span className="meta-value">★ {novel.rating.average.toFixed(1)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Chapters</span>
                <span className="meta-value">{novel.totalChapters}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Views</span>
                <span className="meta-value">{novel.views.toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className="meta-value" style={{ 
                  color: novel.status === 'ongoing' ? '#10b981' : '#64748b',
                  textTransform: 'capitalize'
                }}>
                  {novel.status}
                </span>
              </div>
            </div>

            <div className="novel-detail-genres">
              {novel.genres?.map((genre, i) => (
                <span key={i} className="genre-tag">{genre}</span>
              ))}
            </div>

            <div className="novel-detail-synopsis">
              <h2>📖 Sinopsis</h2>
              <p>{novel.synopsis}</p>
            </div>

            <div className="novel-detail-actions">
              {chapters.length > 0 && isApproved && (
                <button 
                  className="btn-primary btn-large"
                  onClick={() => navigate(`/novel/${slug}/${chapters[0].number}`)}
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
                <>
                  <button 
                    className="btn-secondary btn-large"
                    onClick={() => navigate(`/novel/${slug}/create-chapter`)}
                  >
                    ➕ Tambah Bab
                  </button>
                  <button 
                    className="btn-secondary btn-large"
                    onClick={() => navigate(`/novel/${slug}/edit`)}
                  >
                    ✏️ Edit Novel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CHAPTERS */}
        {chapters.length > 0 && (
          <div className="chapters-section">
            <h2>📚 Daftar Chapter ({chapters.length})</h2>
            <div className="chapters-list">
              {chapters.map(chapter => (
                <div 
                  key={chapter._id} 
                  className="chapter-item"
                  onClick={() => navigate(`/novel/${slug}/${chapter.number}`)}
                >
                  <div className="chapter-title-wrapper">
                    <h3>Bab {chapter.number}: {chapter.title}</h3>
                    <span className="chapter-date">
                      {new Date(chapter.publishedAt || chapter.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {chapter.isPremium && (
                      <span className="chapter-premium">💎 Premium</span>
                    )}
                    {isAuthor && chapter.approvalStatus !== 'approved' && (
                      <span style={{
                        padding: '6px 16px',
                        background: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '700'
                      }}>
                        ⏳ {chapter.approvalStatus}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS SECTION */}
        <div className="reviews-section">
          <h2>⭐ Reviews ({reviews.length})</h2>

          {/* ADD/EDIT REVIEW FORM */}
          {user && (canAddReview || editingReview) && (
            <div>
              {!showReviewForm ? (
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="btn-primary"
                  style={{ marginBottom: '24px' }}
                >
                  ✍️ Tulis Review
                </button>
              ) : (
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <h3>{editingReview ? '✏️ Edit Review' : '✍️ Tulis Review'}</h3>
                  
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`star ${reviewForm.rating >= star ? 'active' : ''}`}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Judul review"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                    maxLength="200"
                    required
                  />

                  <textarea
                    placeholder="Apa pendapat Anda tentang novel ini?"
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
                    rows="6"
                    maxLength="5000"
                    required
                  />

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn-primary">
                      {editingReview ? '💾 Simpan Perubahan' : '📤 Kirim Review'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      className="btn-secondary"
                    >
                      ❌ Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* USER'S OWN REVIEW */}
          {userReview && !editingReview && (
            <div className="review-card" style={{ 
              border: '3px solid #3b82f6',
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)'
            }}>
              <div className="review-header">
                <div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: i < userReview.rating ? '#fbbf24' : '#e5e7eb' }}>★</span>
                    ))}
                  </div>
                  <h3 className="review-title">{userReview.title}</h3>
                </div>
                <button 
                  onClick={() => handleEditReview(userReview)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  ✏️ Edit
                </button>
              </div>
              <p className="review-content">{userReview.content}</p>
              <div className="review-actions">
                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                  👍 {userReview.helpful} orang merasa review ini membantu
                </span>
              </div>
            </div>
          )}

          {/* OTHER REVIEWS */}
          {reviews.filter(r => !user || r.user._id !== user.id).length > 0 ? (
            <div className="reviews-list">
              {reviews
                .filter(r => !user || r.user._id !== user.id)
                .map(review => {
                  const hasMarkedHelpful = user && review.helpfulBy?.includes(user.id);
                  
                  return (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div>
                          <strong>{review.user.username}</strong>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{ color: i < review.rating ? '#fbbf24' : '#e5e7eb' }}>★</span>
                            ))}
                          </div>
                        </div>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h3 className="review-title">{review.title}</h3>
                      <p className="review-content">{review.content}</p>
                      <div className="review-actions">
                        <button 
                          className="review-helpful"
                          onClick={() => handleMarkHelpful(review._id)}
                          style={{
                            color: hasMarkedHelpful ? '#3b82f6' : 'inherit',
                            fontWeight: hasMarkedHelpful ? '700' : '600'
                          }}
                        >
                          👍 Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada review. Jadilah yang pertama!</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NovelDetailPage;