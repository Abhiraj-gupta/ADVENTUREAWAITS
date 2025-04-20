import React from 'react';
import '../styles/LoadingPage.css';

const LoadingPage = () => {
  return (
    <div className="loading-page">
      <div className="loading-spinner"></div>
      <p>Loading amazing destinations...</p>
    </div>
  );
};

export default LoadingPage; 