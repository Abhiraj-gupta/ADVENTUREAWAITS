import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getStateData } from '../data';
import { useAuth } from '../contexts/AuthContext';
import '../styles/RestaurantDetails.css';

const RestaurantDetails = () => {
  const { stateId, restaurantId } = useParams();
  const navigate = useNavigate();
  const { addBooking, user } = useAuth();
  
  // Format state ID to ensure it works with the data functions
  const formatStateIdForData = (id) => {
    if (!id || typeof id !== 'string') return id;
    
    // Return only the correctly formatted state ID for data fetching
    if (id === 'jammuKashmir' || id === 'jammu-kashmir') return 'jammuKashmir';
    if (id === 'himachalPradesh' || id === 'himachal-pradesh') return 'himachalPradesh';
    if (id === 'uttarPradesh' || id === 'uttar-pradesh') return 'uttarPradesh';
    
    return id;
  };
  
  const formattedStateId = formatStateIdForData(stateId);
  
  // State for reservation form
  const [reservationData, setReservationData] = useState({
    date: '',
    time: '',
    people: 2
  });
  const [showReservationForm, setShowReservationForm] = useState(false);
  
  // Get state data
  const stateData = getStateData(formattedStateId);
  
  // Find the restaurant
  const restaurant = stateData?.restaurants?.find(restaurant => restaurant.id === parseInt(restaurantId));
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // If restaurant not found, navigate back to home
    if (!restaurant) {
      navigate('/');
    }
  }, [restaurant, navigate]);
  
  if (!restaurant) {
    return <div className="loading">Loading...</div>;
  }

  // Create stars for background
  useEffect(() => {
    const createStars = () => {
      const starContainer = document.getElementById('star-background');
      if (!starContainer) return;
      
      // Clear existing stars
      starContainer.innerHTML = '';
      
      // Create new stars
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star-bg';
        
        // Random position
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        
        // Random size (0.5px to 2px)
        const size = 0.5 + Math.random() * 1.5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random animation delay
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        starContainer.appendChild(star);
      }
    };
    
    createStars();
  }, []);
  
  // Handle reservation form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservationData(prev => ({
      ...prev,
      [name]: name === 'people' ? parseInt(value) : value
    }));
  };
  
  // Handle reservation submission
  const handleReservation = (e) => {
    e.preventDefault();
    
    // Create reservation object
    const newReservation = {
      type: 'restaurant',
      itemId: parseInt(restaurantId),
      stateId: formattedStateId,
      name: restaurant.name,
      image: restaurant.image,
      date: reservationData.date,
      time: reservationData.time,
      people: reservationData.people
    };
    
    // Add booking
    const bookingId = addBooking(newReservation);
    
    if (bookingId) {
      alert('Reservation successful! You can view your reservation in the My Bookings page.');
      navigate('/bookings');
    }
  };
  
  return (
    <div className="app-container">
      <div id="star-background" className="star-background"></div>
      <Header />

      <div className="restaurant-details-page">
        <div className="restaurant-details-container">
          <button 
            className="back-button" 
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>
          
          <div className="restaurant-header">
            <h1>{restaurant.name}</h1>
            <div className="restaurant-location">
              <i className="fas fa-map-marker-alt"></i> {restaurant.location}
            </div>
            <div className="restaurant-rating">
              <span className="stars">{'★'.repeat(Math.floor(restaurant.rating))}{'☆'.repeat(5 - Math.floor(restaurant.rating))}</span>
              <span className="rating-value">{restaurant.rating}</span>
            </div>
            <div className="restaurant-cuisine">Cuisine: {restaurant.cuisine}</div>
          </div>
          
          <div className="restaurant-image-gallery">
            {restaurant.image ? (
              <img 
                src={restaurant.image} 
                alt={restaurant.name} 
                className="main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                }} 
              />
            ) : (
              <div className="image-placeholder">
                <i className="fas fa-utensils"></i>
                <p>No image available</p>
              </div>
            )}
          </div>
          
          <div className="restaurant-description">
            <h2>About the Restaurant</h2>
            <p>{restaurant.description}</p>
          </div>
          
          <div className="restaurant-specialties">
            <h2>Signature Dishes</h2>
            {restaurant.specialDishes ? (
              <ul className="specialty-list">
                {restaurant.specialDishes.map((dish, index) => (
                  <li key={index} className="specialty-item">
                    <i className="fas fa-utensils"></i>
                    <span>{dish}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Information about signature dishes not available for this restaurant.</p>
            )}
          </div>
          
          <div className="restaurant-features">
            <h2>Features</h2>
            <div className="features-grid">
              <div className="feature">
                <i className="fas fa-wifi"></i>
                <span>Free Wi-Fi</span>
              </div>
              <div className="feature">
                <i className="fas fa-parking"></i>
                <span>Parking Available</span>
              </div>
              <div className="feature">
                <i className="fas fa-glass-cheers"></i>
                <span>Full Bar</span>
              </div>
              <div className="feature">
                <i className="fas fa-music"></i>
                <span>Live Music</span>
              </div>
              <div className="feature">
                <i className="fas fa-wheelchair"></i>
                <span>Wheelchair Accessible</span>
              </div>
              <div className="feature">
                <i className="fas fa-credit-card"></i>
                <span>Cards Accepted</span>
              </div>
            </div>
          </div>
          
          <div className="hours-section">
            <h2>Hours</h2>
            <div className="hours-grid">
              <div className="day">Monday - Thursday</div>
              <div className="time">11:00 AM - 10:00 PM</div>
              <div className="day">Friday - Saturday</div>
              <div className="time">11:00 AM - 11:00 PM</div>
              <div className="day">Sunday</div>
              <div className="time">12:00 PM - 9:00 PM</div>
            </div>
          </div>
          
          <div className="reservation-section">
            <h2>Make a Reservation</h2>
            {!showReservationForm ? (
              <button 
                className="reserve-now-btn"
                onClick={() => navigate(`/restaurant-booking/${restaurantId}?state=${formattedStateId}`)}
              >
                <i className="fas fa-calendar-check"></i> Reserve a Table
              </button>
            ) : (
              <form className="reservation-form" onSubmit={handleReservation}>
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date"
                    value={reservationData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <select 
                    id="time" 
                    name="time"
                    value={reservationData.time}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="1:30 PM">1:30 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                    <option value="6:30 PM">6:30 PM</option>
                    <option value="7:00 PM">7:00 PM</option>
                    <option value="7:30 PM">7:30 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                    <option value="8:30 PM">8:30 PM</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="people">Number of People</label>
                  <select 
                    id="people" 
                    name="people"
                    value={reservationData.people}
                    onChange={handleInputChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                <div className="booking-actions">
                  <button type="submit" className="submit-reservation">
                    <i className="fas fa-check"></i> Confirm Reservation
                  </button>
                  <button 
                    type="button" 
                    className="cancel-reservation"
                    onClick={() => setShowReservationForm(false)}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            )}
            <p className="reservation-info">
              Secure your table for an unforgettable dining experience at {restaurant.name}.
              Special arrangements available for private events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails; 