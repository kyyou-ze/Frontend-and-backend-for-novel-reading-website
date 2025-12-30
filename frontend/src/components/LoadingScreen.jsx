import React from 'react';

const LoadingScreen = ({ message = 'Memuat...' }) => {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingScreen;

