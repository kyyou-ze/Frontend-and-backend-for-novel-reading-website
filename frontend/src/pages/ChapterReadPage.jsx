import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chapterService } from '../services/chapterService';
import { commentService } from '../services/commentService';

const ChapterReadPage = ({ user }) => {
  const { slug, chapterNum } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showSettings, setShowSettings] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadChapter();
    loadPreferences();
  }, [slug, chapterNum]);

  const loadChapter = async () => {
    try {
      const result = await chapterService.getChapter(slug, chapterNum);
      setData(result.data);
      
      // Save to reading history
      saveToHistory(result.data);
      
      // Load comments
      const commentsData = await commentService.getComments(result.data.chapter._id);
      setComments(commentsData.data || []);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = () => {
    const prefs = JSON.parse(localStorage.getItem('readerPreferences') || '{}');
    if (prefs.theme) setTheme(prefs.theme);
    if (prefs.fontSize) setFontSize(prefs.fontSize);
    if (prefs.lineHeight) setLineHeight(prefs.lineHeight);
  };

  const savePreferences = (key, value) => {
    const prefs = JSON.parse(localStorage.getItem('readerPreferences') || '{}');
    prefs[key] = value;
    localStorage.setItem('readerPreferences', JSON.stringify(prefs));
  };

  const saveToHistory = (chapterData) => {
    const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    const newEntry = {
      novel: chapterData.novel.title,
      slug: chapterData.novel.slug,
      chapter: chapterData.chapter.number,
      genre: chapterData.novel.genres?.[0],
      timestamp: Date.now()
    };
    
    const filtered = history.filter(h => h.slug !== slug);
    filtered.unshift(newEntry);
    localStorage.setItem('readingHistory', JSON.stringify(filtered.slice(0, 20)));
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    savePreferences('theme', newTheme);
  };

  const handleFontSizeChange = (delta) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    savePreferences('fontSize', newSize);
  };

  const handleLineHeightChange = (delta) => {
    const newHeight = Math.max(1.2, Math.min(2.4, lineHeight + delta));
    setLineHeight(newHeight);
    savePreferences('lineHeight', newHeight);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const comment = await commentService.addComment(data.chapter._id, newComment);
      setComments([comment.data, ...comments]);
      setNewComment('');
    } catch (error) {
      alert('Gagal menambahkan komentar');
    }
  };

  // 🔥 NEW: Like Comment Handler
  const handleLikeComment = async (commentId) => {
    if (!user) {
      alert('Login untuk menyukai komentar');
      return;
    }

    try {
      const result = await commentService.likeComment(commentId);
      // Update comment in state
      setComments(comments.map(c => 
        c._id === commentId ? result.data : c
      ));
    } catch (error) {
      alert('Gagal menyukai komentar');
    }
  };

  // 🔥 NEW: Delete Comment Handler
  const handleDeleteComment = async (commentId) => {
    if (!confirm('⚠️ Yakin ingin menghapus komentar ini?')) {
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
      alert('✅ Komentar berhasil dihapus');
    } catch (error) {
      alert('❌ Gagal menghapus komentar');
    }
  };

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const bookmark = {
      novel: data.novel.title,
      slug,
      chapter: data.chapter.number,
      timestamp: Date.now()
    };
    
    const filtered = bookmarks.filter(b => b.slug !== slug);
    filtered.unshift(bookmark);
    localStorage.setItem('bookmarks', JSON.stringify(filtered));
    alert('📖 Bookmark tersimpan!');
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        <p>Memuat chapter...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="error">
        <h2>❌ Chapter tidak ditemukan</h2>
        <button onClick={() => navigate(`/novel/${slug}`)} className="btn-primary">
          Kembali ke Novel
        </button>
      </div>
    );
  }

  const prevChapter = data.chapter.number > 1 ? data.chapter.number - 1 : null;
  const nextChapter = data.chapter.number + 1;
  const isAuthor = user && user.id === data.novel.author._id;

  return (
    <div className={`reader-page theme-${theme}`}>
      <div className="reader-header">
        <div className="container">
          <button onClick={() => navigate(`/novel/${slug}`)} className="back-btn">
            ← Kembali
          </button>
          <h2 className="reader-title">{data.novel.title}</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            {isAuthor && (
              <button 
                onClick={() => navigate(`/novel/${slug}/${chapterNum}/edit`)} 
                className="settings-btn"
                style={{ background: '#fbbf24', color: 'white', border: 'none' }}
              >
                ✏️ Edit
              </button>
            )}
            <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="reader-settings">
          <div className="container">
            <div className="setting-item">
              <label>Tema</label>
              <button onClick={handleThemeToggle} className="btn-sm">
                {theme === 'light' ? '🌙 Gelap' : '☀️ Terang'}
              </button>
            </div>
            <div className="setting-item">
              <label>Ukuran Font</label>
              <div className="btn-group">
                <button onClick={() => handleFontSizeChange(-1)} className="btn-sm">A-</button>
                <span>{fontSize}px</span>
                <button onClick={() => handleFontSizeChange(1)} className="btn-sm">A+</button>
              </div>
            </div>
            <div className="setting-item">
              <label>Spasi Baris</label>
              <div className="btn-group">
                <button onClick={() => handleLineHeightChange(-0.1)} className="btn-sm">-</button>
                <span>{lineHeight.toFixed(1)}</span>
                <button onClick={() => handleLineHeightChange(0.1)} className="btn-sm">+</button>
              </div>
            </div>
            <button onClick={handleBookmark} className="btn-full">📖 Bookmark</button>
          </div>
        </div>
      )}

      <div className="reader-content">
        <div className="chapter-header">
          <h1>Bab {data.chapter.number}: {data.chapter.title}</h1>
          <div className="chapter-meta">
            <span>{data.chapter.wordCount} kata</span>
            <span>{data.chapter.views} pembaca</span>
          </div>
        </div>

        <div 
          className="chapter-text"
          style={{ 
            fontSize: `${fontSize}px`, 
            lineHeight: lineHeight 
          }}
          dangerouslySetInnerHTML={{ 
            __html: data.chapter.content.replace(/\n/g, '<br/>') 
          }}
        />

        <div className="chapter-navigation">
          {prevChapter && (
            <button 
              onClick={() => navigate(`/novel/${slug}/${prevChapter}`)}
              className="btn-nav"
            >
              ← Bab Sebelumnya
            </button>
          )}
          <button 
            onClick={() => navigate(`/novel/${slug}`)}
            className="btn-nav"
          >
            📚 Daftar Bab
          </button>
          <button 
            onClick={() => navigate(`/novel/${slug}/${nextChapter}`)}
            className="btn-nav"
          >
            Bab Selanjutnya →
          </button>
        </div>
      </div>

      <div className="comments-section">
        <h2>💬 Komentar ({comments.length})</h2>
        
        {user ? (
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar..."
              maxLength="1000"
            />
            <button type="submit" className="btn-primary">Kirim</button>
          </form>
        ) : (
          <p className="comment-login-prompt">
            <button onClick={() => navigate('/login')} className="link-btn">
              Login
            </button> untuk berkomentar
          </p>
        )}

        <div className="comments-list">
          {comments.map(comment => {
            const isCommentAuthor = user && user.id === comment.user._id;
            const hasLiked = user && comment.likedBy?.includes(user.id);
            
            return (
              <div key={comment._id} className="comment">
                <div className="comment-header">
                  <strong>{comment.user.username}</strong>
                  <span className="comment-time">
                    {new Date(comment.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
                <div className="comment-actions">
                  <button 
                    className="comment-like"
                    onClick={() => handleLikeComment(comment._id)}
                    style={{ 
                      color: hasLiked ? '#3b82f6' : 'inherit',
                      fontWeight: hasLiked ? '700' : '600'
                    }}
                  >
                    {hasLiked ? '👍' : '👍'} {comment.likes}
                  </button>
                  
                  {(isCommentAuthor || user?.role === 'admin') && (
                    <button 
                      onClick={() => handleDeleteComment(comment._id)}
                      style={{
                        color: '#991b1b',
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      🗑️ Hapus
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChapterReadPage;