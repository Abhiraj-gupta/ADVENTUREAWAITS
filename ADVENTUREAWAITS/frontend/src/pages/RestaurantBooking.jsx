import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStateData } from '../data';
import '../styles/Booking.css';

const RestaurantBooking = () => {
  const { user, addBooking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // Get restaurant ID and state ID from URL params or query parameters
  const restaurantId = params.restaurantId || new URLSearchParams(location.search).get('id');
  const stateId = params.stateId || new URLSearchParams(location.search).get('state');
  
  // Form state
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: 2,
    occasion: 'none',
    specialRequests: ''
  });
  
  // Time slots
  const timeSlots = [
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', 
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'
  ];
  
  // Get the restaurant data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (restaurantId && stateId) {
      const stateData = getStateData(stateId);
      const foundRestaurant = stateData?.restaurants?.find(r => r.id === parseInt(restaurantId));
      
      if (foundRestaurant) {
        setRestaurant(foundRestaurant);
        // Set default date (today)
        const today = new Date();
        setFormData(prev => ({
          ...prev,
          date: today.toISOString().split('T')[0],
          time: '7:00 PM' // Default dinner time
        }));
      }
      setLoading(false);
    }
  }, [restaurantId, stateId, user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    const bookingData = {
      type: 'restaurant',
      itemId: parseInt(restaurantId),
      stateId: stateId,
      name: restaurant.name,
      image: restaurant.image,
      location: restaurant.location,
      date: formData.date,
      time: formData.time,
      people: parseInt(formData.people),
      occasion: formData.occasion,
      specialRequests: formData.specialRequests,
      status: 'confirmed',
      bookedAt: new Date().toISOString()
    };
    
    // Add booking
    const bookingId = addBooking(bookingData);
    
    // Show success notification
    setNotification({
      type: 'success',
      message: 'Your table reservation has been confirmed!'
    });
    
    // Navigate to bookings page after 2 seconds
    setTimeout(() => {
      navigate('/bookings');
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading reservation information...</p>
        </div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="booking-page">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Restaurant Not Found</h2>
          <p>We couldn't find the restaurant you're looking for.</p>
          <button onClick={() => navigate('/explore-states')} className="back-btn">
            Explore Other Destinations
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="booking-page restaurant-booking">
      <div className="booking-container">
        {notification && (
          <div className={`notification ${notification.type}`}>
            <p>{notification.message}</p>
          </div>
        )}
        
        <div className="booking-header">
          <h1>Reserve a Table</h1>
          <p>Complete your reservation at <span className="highlight">{restaurant.name}</span></p>
        </div>
        
        <div className="booking-content">
          <div className="booking-item-preview">
            <div className="preview-image">
              <img 
                src={restaurant.image} 
                alt={restaurant.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                }}
              />
            </div>
            
            <div className="preview-details">
              <h2>{restaurant.name}</h2>
              <p className="preview-location">
                <i className="fas fa-map-marker-alt"></i> {restaurant.location}
              </p>
              <div className="preview-rating">
                <span className="rating-value">{restaurant.rating}</span>
                <span className="rating-stars">
                  {Array(5).fill().map((_, i) => (
                    <i key={i} className={`${i < Math.floor(restaurant.rating) ? 'fas' : 'far'} fa-star`}></i>
                  ))}
                </span>
              </div>
              <p className="preview-cuisine">
                <i className="fas fa-utensils"></i> {restaurant.cuisine}
              </p>
              <p className="preview-price">{restaurant.priceRange}</p>
              
              <div className="restaurant-highlights">
                <h3>Highlights</h3>
                <div className="highlights-list">
                  <span><i className="fas fa-check-circle"></i> Outdoor Seating</span>
                  <span><i className="fas fa-check-circle"></i> Vegetarian Options</span>
                  <span><i className="fas fa-check-circle"></i> Full Bar</span>
                  <span><i className="fas fa-check-circle"></i> Accepts Reservations</span>
                  <span><i className="fas fa-check-circle"></i> Kid-Friendly</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="booking-form-container">
            <h2>Reservation Details</h2>
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <select 
                    id="time" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleChange}
                    required
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="people">Number of People</label>
                  <input 
                    type="number" 
                    id="people" 
                    name="people" 
                    value={formData.people} 
                    onChange={handleChange}
                    min="1" 
                    max="20"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="occasion">Occasion (Optional)</label>
                  <select 
                    id="occasion" 
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleChange}
                  >
                    <option value="none">None</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="date">Date Night</option>
                    <option value="business">Business Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="specialRequests">Special Requests (Optional)</label>
                <textarea 
                  id="specialRequests" 
                  name="specialRequests" 
                  value={formData.specialRequests} 
                  onChange={handleChange}
                  placeholder="Any special requests or dietary preferences?"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="menu-price-info">
                <h3>Menu Highlights & Pricing</h3>
                <div className="price-table">
                  <div className="price-row price-header">
                    <div className="price-cell">Menu Type</div>
                    <div className="price-cell">Price Range</div>
                    <div className="price-cell">Description</div>
                  </div>
                  <div className="price-row">
                    <div className="price-cell">À la Carte</div>
                    <div className="price-cell">{restaurant.priceRange || "₹500 - ₹1,500 per person"}</div>
                    <div className="price-cell">Individual dishes from our regular menu</div>
                  </div>
                  <div className="price-row">
                    <div className="price-cell">Chef's Special</div>
                    <div className="price-cell">{restaurant.priceRange ? 
                      `₹${Math.round(parseInt((restaurant.priceRange.match(/₹([\d,]+)/)?.[1] || "1000").replace(/,/g, '')) * 1.5).toLocaleString('en-IN')} per person` : 
                      "₹1,800 per person"}</div>
                    <div className="price-cell">Curated 3-course meal with signature dishes</div>
                  </div>
                  <div className="price-row">
                    <div className="price-cell">Group Set Menu</div>
                    <div className="price-cell">{restaurant.priceRange ? 
                      `₹${Math.round(parseInt((restaurant.priceRange.match(/₹([\d,]+)/)?.[1] || "1000").replace(/,/g, '')) * 1.2).toLocaleString('en-IN')} per person` : 
                      "₹1,200 per person"}</div>
                    <div className="price-cell">Fixed menu for groups of 4 or more with shared appetizers and desserts</div>
                  </div>
                </div>
                <p className="price-note">* Special dietary requirements can be accommodated with prior notice</p>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="confirm-btn">
                  <i className="fas fa-check-circle"></i> Confirm Reservation
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => navigate(-1)}
                >
                  <i className="fas fa-times-circle"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBooking; 