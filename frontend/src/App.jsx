import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const NovelDetailPage = lazy(() => import('./pages/NovelDetailPage'));
const ChapterReadPage = lazy(() => import('./pages/ChapterReadPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CreateNovelPage = lazy(() => import('./pages/CreateNovelPage'));
const CreateChapterPage = lazy(() => import('./pages/CreateChapterPage'));
const EditNovelPage = lazy(() => import('./pages/EditNovelPage'));
const EditChapterPage = lazy(() => import('./pages/EditChapterPage'));

import { authService } from './services/authService';
import { api } from './services/api';

import Header from './components/Header';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    const isConnected = await api.testConnection();
    setBackendStatus(isConnected ? 'connected' : 'disconnected');

    if (!isConnected) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const data = await authService.getMe();
        setUser(data);
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (backendStatus === 'disconnected') {
    return (
      <div className="error-screen">
        <div className="error-container">
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>⚠️</div>
          <h1>Backend Tidak Terhubung</h1>
          <p style={{ marginTop: '12px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
            Pastikan backend berjalan di http://localhost:5000
          </p>
          <div style={{ textAlign: 'left', padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <p style={{ fontWeight: '700', marginBottom: '8px' }}>Cara menjalankan backend:</p>
            <code style={{ display: 'block', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
              cd backend<br/>
              npm install<br/>
              npm run dev
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            🔄 Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app">
          <Header user={user} onLogout={handleLogout} />
          
          <main className="main-content">
            <Suspense fallback={<LoadingScreen message="Memuat halaman..." />}>
              <Routes>
                <Route path="/" element={<HomePage user={user} />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/novel/:slug" element={<NovelDetailPage user={user} />} />
                <Route path="/novel/:slug/:chapterNum" element={<ChapterReadPage user={user} />} />
                
                <Route 
                  path="/login" 
                  element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />} 
                />
                <Route 
                  path="/register" 
                  element={user ? <Navigate to="/" replace /> : <RegisterPage />} 
                />
                
                <Route 
                  path="/dashboard" 
                  element={
                    user ? <DashboardPage user={user} /> : <Navigate to="/login" replace />
                  } 
                />
                
                <Route 
                  path="/create-novel" 
                  element={
                    user?.role === 'author' ? <CreateNovelPage /> : <Navigate to="/" replace />
                  } 
                />
                <Route 
                  path="/novel/:slug/create-chapter" 
                  element={
                    user?.role === 'author' ? <CreateChapterPage /> : <Navigate to="/" replace />
                  } 
                />
                <Route 
                  path="/novel/:slug/edit" 
                  element={
                    user?.role === 'author' ? <EditNovelPage /> : <Navigate to="/" replace />
                  } 
                />
                <Route 
                  path="/novel/:slug/:chapterNum/edit" 
                  element={
                    user?.role === 'author' ? <EditChapterPage /> : <Navigate to="/" replace />
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const NotFound = () => (
  <div className="error-screen">
    <div className="error-container">
      <div style={{ fontSize: '6rem', marginBottom: '24px' }}>🔍</div>
      <h1>404 - Halaman Tidak Ditemukan</h1>
      <p style={{ marginTop: '12px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
        Halaman yang Anda cari tidak ada
      </p>
      <a href="/" className="btn-primary">
        Kembali ke Beranda
      </a>
    </div>
  </div>
);

export default App;