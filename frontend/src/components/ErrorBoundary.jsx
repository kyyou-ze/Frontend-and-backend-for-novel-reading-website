import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <div className="error-container">
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>💥</div>
            <h1>Oops! Terjadi Kesalahan</h1>
            <p style={{ marginTop: '12px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
              {this.state.error?.message || 'Aplikasi mengalami kesalahan'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              🔄 Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;