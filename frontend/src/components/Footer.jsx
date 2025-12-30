import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
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
            <Link to="/">🏠 Beranda</Link>
            <Link to="/search">🔍 Cari Novel</Link>
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

export default Footer;