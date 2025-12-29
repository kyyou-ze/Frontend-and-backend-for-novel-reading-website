import React, { useState, useEffect } from 'react';
import { chapterService } from '../services/chapterService';
import { commentService } from '../services/commentService';

const ChapterReadPage = ({ slug, chapter, onNavigate, user }) => {
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
  }, [slug, chapter]);

  const loadChapter = async () => {
    try {
      const result = await chapterService.getChapter(slug, chapter);
      setData(result.data);
      
      // Save to reading history
      saveToHistory(result.data);
      
      // Load comments
      const commentsData = await commentService.getComments(result.data.chapter._id);
      setComments(commentsData.data);
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

    // Cache chapter for offline
    const cache = JSON.parse(localStorage.getItem('chapterCache') || '{}');
    cache[`${slug}-${chapter}`] = {
      data: chapterData,
      cached: Date.now()
    };
    localStorage.setItem('chapterCache', JSON.stringify(cache));
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
    alert('Bookmark tersimpan!');
  };

  if (loading) {
    return <div className="loader">Memuat chapter...</div>;
  }

  if (!data) {
    return <div className="error">Chapter tidak ditemukan</div>;
  }

  const prevChapter = data.chapter.number > 1 ? data.chapter.number - 1 : null;
  const nextChapter = data.chapter.number + 1;

  return (
    <div className={`reader-page theme-${theme}`}>
      <div className="reader-header">
        <button onClick={() => onNavigate('novel', { slug })} className="back-btn">
          ← Kembali
        </button>
        <h2 className="reader-title">{data.novel.title}</h2>
        <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="reader-settings">
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
              onClick={() => onNavigate('chapter', { slug, chapter: prevChapter })}
              className="btn-nav"
            >
              ← Bab Sebelumnya
            </button>
          )}
          <button 
            onClick={() => onNavigate('novel', { slug })}
            className="btn-nav"
          >
            📚 Daftar Bab
          </button>
          <button 
            onClick={() => onNavigate('chapter', { slug, chapter: nextChapter })}
            className="btn-nav"
          >
            Bab Selanjutnya →
          </button>
        </div>
      </div>

      <div className="comments-section">
        <h2>Komentar ({comments.length})</h2>
        
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
            <button onClick={() => onNavigate('login')} className="link-btn">
              Login
            </button> untuk berkomentar
          </p>
        )}

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <strong>{comment.user.username}</strong>
                <span className="comment-time">
                  {new Date(comment.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
              <div className="comment-actions">
                <button className="comment-like">
                  👍 {comment.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChapterReadPage;