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

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Memuat novel...</p>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="error">
        <h2>❌ Novel tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '20px' }}>
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const isApproved = novel.approvalStatus === 'approved';
  const isAuthor = user && user.id === novel.author._id;
  const canView = isApproved || isAuthor;

  if (!canView) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>⏳ Novel Menunggu Persetujuan</h2>
        <p style={{ marginTop: '12px' }}>Novel ini sedang dalam proses review oleh admin.</p>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '20px' }}>
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Rest of the component remains the same but with navigate() instead of onNavigate()
  // ... (keep all other JSX)

  return (
    <div className="novel-detail-page">
      {/* Keep existing JSX but replace onNavigate with navigate */}
      <div className="container">
        {/* ... existing code ... */}
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
            <button 
              className="btn-secondary btn-large"
              onClick={() => navigate(`/novel/${slug}/create-chapter`)}
            >
              ➕ Tambah Bab Baru
            </button>
          )}
        </div>
        {/* ... rest of existing code ... */}
      </div>
    </div>
  );
};

export default NovelDetailPage;