import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OptimizedImage from './OptimizedImage';
import '../styles/Card.css';

const Card = ({ item, type, stateId }) => {
  const { user, addToFavorites, isInFavorites, removeFromFavorites } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  
  // Function to ensure the state ID is in the correct format for the URL
  const formatStateId = (id) => {
    // If the ID is already formatted correctly, return it
    if (!id || typeof id !== 'string') return id;
    
    // Handle specific conversions for compound state names
    if (id === 'jammu-kashmir' || id === 'jammuKashmir') return 'jammuKashmir';
    if (id === 'himachal-pradesh' || id === 'himachalPradesh') return 'himachalPradesh';
    if (id === 'uttar-pradesh' || id === 'uttarPradesh') return 'uttarPradesh';
    
    return id;
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Prevent the Link from navigating
    e.stopPropagation();
    
    if (!user) {
      alert('Please login to save favorites');
      navigate('/login');
      return;
    }

    const favoriteItem = {
      id: item.id,
      name: item.name,
      image: item.image,
      location: item.location,
      rating: item.rating,
      category: type.slice(0, -1), // Convert 'hotels' to 'hotel'
      type: type.slice(0, -1), // Singular form
      stateId: stateId
    };

    if (isInFavorites(item.id, type.slice(0, -1))) {
      removeFromFavorites(favoriteItem);
      showNotification(`${item.name} removed from favorites`);
    } else {
      addToFavorites(favoriteItem);
      showNotification(`${item.name} added to favorites`);
    }
  };
  
  const handleBookingClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Please login to make a booking');
      navigate('/login');
      return;
    }
    
    const itemType = type.slice(0, -1); // Convert 'hotels' to 'hotel'
    const formattedStateId = formatStateId(stateId);
    
    if (itemType === 'hotel') {
      navigate(`/hotel-booking/${item.id}?state=${formattedStateId}`);
    } else if (itemType === 'restaurant') {
      navigate(`/restaurant-booking/${item.id}?state=${formattedStateId}`);
    } else if (itemType === 'attraction') {
      navigate(`/attraction-booking/${item.id}?state=${formattedStateId}`);
    }
  };

  // Format the price range to remove rupee symbols
  const formatPriceRange = (priceRange) => {
    if (!priceRange) return '';
    
    // Replace all variants of rupee symbols including Unicode characters
    return priceRange.replace(/[₹₨र]/g, '').trim();
  };

  const isFavorite = user && isInFavorites(item.id, type.slice(0, -1));
  const formattedStateId = formatStateId(stateId);
  const singularType = type.slice(0, -1); // Convert 'hotels' to 'hotel'

  return (
    <div className="card">
      {notification && (
        <div className="card-notification">
          <p>{notification}</p>
        </div>
      )}
      
      <Link to={`/state/${formattedStateId}/${singularType}/${item.id}`}>
        <div className="card-image-container">
          <OptimizedImage 
            src={item.image} 
            alt={item.name} 
            aspectRatio="4/3"
          />
          {user && (
            <button 
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i>
            </button>
          )}
        </div>
        <div className="card-content">
          <h3 className="card-title">{item.name}</h3>
          <p className="card-location">{item.location}</p>
          <div className="card-rating">
            <span className="rating-value">{item.rating}</span>
            <span className="rating-stars">★★★★★</span>
          </div>
          {type === 'hotels' && (
            <p className="card-price">{formatPriceRange(item.priceRange)}</p>
          )}
          {type === 'restaurants' && (
            <p className="card-cuisine">{item.cuisine}</p>
          )}
          {type === 'attractions' && (
            <p className="card-entry-fee">{item.entryFee}</p>
          )}
          
          <div className="card-actions">
            <button 
              className="card-details-btn"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/state/${formattedStateId}/${singularType}/${item.id}`);
              }}
            >
              <i className="fas fa-info-circle"></i> View Details
            </button>
            <button 
              className="card-booking-btn"
              onClick={handleBookingClick}
            >
              {singularType === 'hotel' ? (
                <><i className="fas fa-bed"></i> Book Stay</>
              ) : singularType === 'restaurant' ? (
                <><i className="fas fa-utensils"></i> Reserve Table</>
              ) : (
                <><i className="fas fa-ticket-alt"></i> Get Tickets</>
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card;
