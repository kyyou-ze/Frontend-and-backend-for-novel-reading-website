import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          📚 NovelHub
        </Link>
        
        <nav className="nav">
          <Link to="/">Beranda</Link>
          <Link to="/search">Cari</Link>
          
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {user.role === 'author' && (
                <Link 
                  to="/create-novel"
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                >
                  ✍️ Buat Novel
                </Link>
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
                    <button onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
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
            <Link to="/login" className="btn-primary">
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;