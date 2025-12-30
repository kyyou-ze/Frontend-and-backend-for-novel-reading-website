import React, { useState, useEffect, Suspense, lazy } from 'react';
import './styles/global.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const NovelDetailPage = lazy(() => import('./pages/NovelDetailPage'));
const ChapterReadPage = lazy(() => import('./pages/ChapterReadPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CreateNovelPage = lazy(() => import('./pages/CreateNovelPage'));
const CreateChapterPage = lazy(() => import('./pages/CreateChapterPage'));

// Services
import { authService } from './services/authService';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      authService.getMe().then(data => {
        setUser(data);
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
    setLoading(false);

    // Handle browser navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      parsePath(path);
    };

    window.addEventListener('popstate', handlePopState);
    parsePath(window.location.pathname);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const parsePath = (path) => {
    // Remove trailing slash
    path = path.replace(/\/$/, '') || '/';

    if (path === '/') {
      setCurrentPage('home');
      setPageParams({});
    } else if (path === '/login') {
      setCurrentPage('login');
      setPageParams({});
    } else if (path === '/register') {
      setCurrentPage('register');
      setPageParams({});
    } else if (path === '/dashboard') {
      setCurrentPage('dashboard');
      setPageParams({});
    } else if (path === '/search') {
      setCurrentPage('search');
      setPageParams({});
    } else if (path === '/create-novel') {
      setCurrentPage('create-novel');
      setPageParams({});
    } else if (path.match(/^\/novel\/[^\/]+\/create-chapter$/)) {
      // Match: /novel/:slug/create-chapter
      const parts = path.split('/').filter(Boolean);
      setCurrentPage('create-chapter');
      setPageParams({ slug: parts[1] });
    } else if (path.match(/^\/novel\/[^\/]+\/\d+$/)) {
      // Match: /novel/:slug/:chapterNum
      const parts = path.split('/').filter(Boolean);
      setCurrentPage('chapter');
      setPageParams({ slug: parts[1], chapter: parts[2] });
    } else if (path.match(/^\/novel\/[^\/]+$/)) {
      // Match: /novel/:slug
      const parts = path.split('/').filter(Boolean);
      setCurrentPage('novel');
      setPageParams({ slug: parts[1] });
    } else {
      // 404 - redirect to home
      setCurrentPage('home');
      setPageParams({});
      window.history.replaceState({}, '', '/');
    }
  };

  const navigate = (page, params = {}) => {
    let path = '/';
    
    switch(page) {
      case 'home':
        path = '/';
        break;
      case 'login':
        path = '/login';
        break;
      case 'register':
        path = '/register';
        break;
      case 'dashboard':
        path = '/dashboard';
        break;
      case 'search':
        path = '/search';
        break;
      case 'create-novel':
        path = '/create-novel';
        break;
      case 'create-chapter':
        path = `/novel/${params.slug}/create-chapter`;
        break;
      case 'novel':
        path = `/novel/${params.slug}`;
        break;
      case 'chapter':
        path = `/novel/${params.slug}/${params.chapter}`;
        break;
      default:
        path = '/';
    }

    window.history.pushState({}, '', path);
    setCurrentPage(page);
    setPageParams(params);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    navigate('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('home');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header user={user} onNavigate={navigate} onLogout={handleLogout} />
      
      <main className="main-content">
        <Suspense fallback={
          <div className="page-loader">
            <div className="spinner"></div>
          </div>
        }>
          {currentPage === 'home' && <HomePage onNavigate={navigate} user={user} />}
          {currentPage === 'login' && <LoginPage onLogin={handleLogin} onNavigate={navigate} />}
          {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
          {currentPage === 'novel' && <NovelDetailPage slug={pageParams.slug} onNavigate={navigate} user={user} />}
          {currentPage === 'chapter' && <ChapterReadPage slug={pageParams.slug} chapter={pageParams.chapter} onNavigate={navigate} user={user} />}
          {currentPage === 'dashboard' && user && <DashboardPage user={user} onNavigate={navigate} />}
          {currentPage === 'search' && <SearchPage onNavigate={navigate} />}
          {currentPage === 'create-novel' && user?.role === 'author' && <CreateNovelPage onNavigate={navigate} />}
          {currentPage === 'create-chapter' && user?.role === 'author' && (
            <CreateChapterPage novelSlug={pageParams.slug} onNavigate={navigate} />
          )}
        </Suspense>
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
};

const Header = ({ user, onNavigate, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-content">
        <h1 className="logo" onClick={() => onNavigate('home')}>
          📚 NovelHub
        </h1>
        
        <nav className="nav">
          <button onClick={() => onNavigate('home')}>Beranda</button>
          <button onClick={() => onNavigate('search')}>Cari</button>
          
          {user ? (
            <>
              <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
              {user.role === 'author' && (
                <button 
                  onClick={() => onNavigate('create-novel')}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                >
                  ✍️ Buat Novel
                </button>
              )}
              <div className="user-menu">
                <button className="user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="avatar-sm" />
                  ) : (
                    <div className="avatar-placeholder">{user.username[0].toUpperCase()}</div>
                  )}
                  <span>{user.username}</span>
                </button>
                {menuOpen && (
                  <div className="dropdown">
                    <button onClick={() => { onNavigate('dashboard'); setMenuOpen(false); }}>
                      👤 Profil
                    </button>
                    <button onClick={() => { onLogout(); setMenuOpen(false); }}>
                      🚪 Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate('login')} className="btn-primary">
                Masuk
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const Footer = ({ onNavigate }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>📚 NovelHub</h3>
            <p>Platform baca novel digital terbaik di Indonesia</p>
            <p style={{ fontSize: '0.85rem', marginTop: '12px', color: 'var(--text-muted)' }}>
              © 2025 NovelHub. All rights reserved.
            </p>
          </div>
          <div className="footer-section">
            <h4>Navigasi</h4>
            <button onClick={() => onNavigate('home')}>🏠 Beranda</button>
            <button onClick={() => onNavigate('search')}>🔍 Cari Novel</button>
          </div>
          <div className="footer-section">
            <h4>Bantuan</h4>
            <button onClick={() => alert('FAQ belum tersedia')}>❓ FAQ</button>
            <button onClick={() => alert('Kontak: support@novelhub.com')}>📧 Kontak</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default App;