import React, { useState, useEffect } from 'react';
import '../styles/OptimizedImage.css';

const OptimizedImage = ({ src, alt, className, aspectRatio = '16/9' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setLoaded(false);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div 
      className={`optimized-image-container ${className || ''}`}
      style={{ aspectRatio }}
    >
      {!loaded && !error && (
        <div className="image-placeholder">
          <div className="loading-shimmer"></div>
        </div>
      )}
      
      {error && (
        <div className="image-error">
          <i className="fas fa-image"></i>
          <span>Image not available</span>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`optimized-image ${loaded ? 'loaded' : ''}`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default OptimizedImage; 