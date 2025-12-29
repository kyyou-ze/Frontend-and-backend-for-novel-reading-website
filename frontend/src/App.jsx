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
    if (path === '/create-novel') {
    setCurrentPage('create-novel');
  } else if (path.includes('/create-chapter')) {
    const slug = path.split('/')[2];
    setCurrentPage('create-chapter');
    setPageParams({ slug });
  }
    if (path === '/' || path === '') {
      setCurrentPage('home');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/register') {
      setCurrentPage('register');
    } else if (path === '/dashboard') {
      setCurrentPage('dashboard');
    } else if (path === '/search') {
      setCurrentPage('search');
    } else if (path.startsWith('/novel/')) {
      const parts = path.split('/').filter(Boolean);
      if (parts.length === 2) {
        setCurrentPage('novel');
        setPageParams({ slug: parts[1] });
      } else if (parts.length === 3) {
        setCurrentPage('chapter');
        setPageParams({ slug: parts[1], chapter: parts[2] });
      }
    }
  };

  const navigate = (page, params = {}) => {
    let path = '/';
    if (page === 'home') path = '/';
    else if (page === 'login') path = '/login';
    else if (page === 'register') path = '/register';
    else if (page === 'dashboard') path = '/dashboard';
    else if (page === 'search') path = '/search';
    else if (page === 'novel') path = `/novel/${params.slug}`;
    else if (page === 'chapter') path = `/novel/${params.slug}/${params.chapter}`;

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
        <Suspense fallback={<div className="page-loader"><div className="spinner"></div></div>}>
          {currentPage === 'home' && <HomePage onNavigate={navigate} user={user} />}
          {currentPage === 'login' && <LoginPage onLogin={handleLogin} onNavigate={navigate} />}
          {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
          {currentPage === 'novel' && <NovelDetailPage slug={pageParams.slug} onNavigate={navigate} user={user} />}
          {currentPage === 'chapter' && <ChapterReadPage slug={pageParams.slug} chapter={pageParams.chapter} onNavigate={navigate} user={user} />}
          {currentPage === 'dashboard' && user && <DashboardPage user={user} onNavigate={navigate} />}
          {currentPage === 'search' && <SearchPage onNavigate={navigate} />}
          {currentPage === 'create-novel' && <CreateNovelPage onNavigate={navigate} />}
          {currentPage === 'create-chapter' && (
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
        <h1 className="logo" onClick={() => onNavigate('home')}>NovelHub</h1>
        
        <nav className="nav">
          <button onClick={() => onNavigate('home')}>Beranda</button>
          <button onClick={() => onNavigate('search')}>Cari</button>
          
          {user ? (
            <>
              <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
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
                      Profil
                    </button>
                    <button onClick={() => { onLogout(); setMenuOpen(false); }}>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate('login')} className="btn-primary">Masuk</button>
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
            <h3>NovelHub</h3>
            <p>Platform baca novel digital terbaik di Indonesia</p>
          </div>
          <div className="footer-section">
            <h4>Navigasi</h4>
            <button onClick={() => onNavigate('home')}>Beranda</button>
            <button onClick={() => onNavigate('search')}>Cari Novel</button>
          </div>
          <div className="footer-section">
            <h4>Bantuan</h4>
            <button>FAQ</button>
            <button>Kontak</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 NovelHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default App;