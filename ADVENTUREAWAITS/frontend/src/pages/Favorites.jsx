import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Favorites.css';

const Favorites = () => {
  const { user, favorites, removeFromFavorites } = useAuth();
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not logged in
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Group favorites by category
  const getFavoritesByCategory = () => {
    const grouped = {
      hotels: [],
      restaurants: [],
      attractions: []
    };

    favorites.forEach(item => {
      const category = item.type + 's'; // Convert to plural form
      if (grouped[category]) {
        grouped[category].push(item);
      }
    });

    return grouped;
  };

  const handleRemoveFavorite = (item) => {
    removeFromFavorites(item);
    showNotification(`${item.name} has been removed from your favorites`);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const favoritesByCategory = getFavoritesByCategory();
  const hasFavorites = favorites.length > 0;

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>My Favorite Destinations</h1>
        <p>Places you've saved for future adventures</p>
      </div>
      
      {notification && (
        <div className="notification">
          <p>{notification}</p>
        </div>
      )}
      
      <div className="favorites-content">
        {hasFavorites ? (
          <div className="favorites-categories">
            {Object.keys(favoritesByCategory).map(category => {
              const items = favoritesByCategory[category];
              
              if (items.length === 0) return null;
              
              return (
                <div key={category} className="favorites-category">
                  <h2 className="category-title">
                    <i className={
                      category === 'hotels' ? 'fas fa-hotel' :
                      category === 'restaurants' ? 'fas fa-utensils' :
                      'fas fa-mountain'
                    }></i>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                  
                  <div className="favorites-grid">
                    {items.map(item => (
                      <div key={`${item.type}-${item.id}`} className="favorite-card">
                        <div className="favorite-image">
                          <img src={item.image} alt={item.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                            }}
                          />
                          <button 
                            className="remove-favorite-btn"
                            onClick={() => handleRemoveFavorite(item)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        
                        <div className="favorite-content">
                          <h3 className="favorite-title">{item.name}</h3>
                          <p className="favorite-location">{item.location}</p>
                          <div className="favorite-rating">
                            <span className="rating-value">{item.rating}</span>
                            <span className="rating-stars">
                              {Array(5).fill().map((_, i) => (
                                <i key={i} className={`${i < Math.floor(item.rating) ? 'fas' : 'far'} fa-star`}></i>
                              ))}
                            </span>
                          </div>
                          
                          <div className="favorite-actions">
                            <Link 
                              to={`/state/${item.stateId}/${item.type}/${item.id}`} 
                              className="view-details-btn"
                            >
                              <i className="fas fa-info-circle"></i> View Details
                            </Link>
                            <Link 
                              to={item.type === 'hotel' 
                                ? `/hotel-booking/${item.id}?state=${item.stateId}` 
                                : item.type === 'restaurant' 
                                ? `/restaurant-booking/${item.id}?state=${item.stateId}` 
                                : `/attraction-booking/${item.id}?state=${item.stateId}`} 
                              className="book-now-btn"
                            >
                              {item.type === 'hotel' ? (
                                <><i className="fas fa-bed"></i> Book Stay</>
                              ) : item.type === 'restaurant' ? (
                                <><i className="fas fa-utensils"></i> Reserve Table</>
                              ) : (
                                <><i className="fas fa-ticket-alt"></i> Get Tickets</>
                              )}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-favorites">
            <i className="far fa-heart"></i>
            <h2>No favorites yet</h2>
            <p>Start exploring and save places you love!</p>
            <Link to="/" className="explore-btn">Explore Destinations</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 