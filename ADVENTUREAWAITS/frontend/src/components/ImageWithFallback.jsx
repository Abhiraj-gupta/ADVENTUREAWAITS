import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className, ...props }) => {
  const [error, setError] = useState(false);
  
  const handleError = () => {
    setError(true);
  };
  
  if (error) {
    return (
      <div className={`image-fallback ${className || ''}`}>
        <i className="fas fa-image"></i>
        <span>Image not available</span>
      </div>
    );
  }
  
  return (
    <img 
      src={src}
      alt={alt || 'Image'} 
      onError={handleError}
      className={className}
      {...props}
    />
  );
};

export default ImageWithFallback; 