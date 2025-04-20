import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getStateData } from '../data';
import { useAuth } from '../contexts/AuthContext';
import '../styles/HotelDetails.css';

const HotelDetails = () => {
  const { stateId, hotelId } = useParams();
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
  
  // State for booking form
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Get state data
  const stateData = getStateData(formattedStateId);
  
  // Find the hotel
  const hotel = stateData?.hotels?.find(hotel => hotel.id === parseInt(hotelId));
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // If hotel not found, navigate back to home
    if (!hotel) {
      navigate('/');
    }
  }, [hotel, navigate]);
  
  if (!hotel) {
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
  
  // Handle booking form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'guests' || name === 'rooms' ? parseInt(value) : value
    }));
  };
  
  // Handle booking submission
  const handleBooking = (e) => {
    e.preventDefault();
    
    // Create booking object
    const newBooking = {
      type: 'hotel',
      itemId: parseInt(hotelId),
      stateId: formattedStateId,
      name: hotel.name,
      image: hotel.image,
      date: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      rooms: bookingData.rooms
    };
    
    // Add booking
    const bookingId = addBooking(newBooking);
    
    if (bookingId) {
      alert('Booking successful! You can view your booking in the My Bookings page.');
      navigate('/bookings');
    }
  };
  
  return (
    <div className="app-container">
      <div id="star-background" className="star-background"></div>
      <Header />

      <div className="hotel-details-page">
        <div className="hotel-details-container">
          <button 
            className="back-button" 
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>
          
          <div className="hotel-header">
            <h1>{hotel.name}</h1>
            <div className="hotel-location">
              <i className="fas fa-map-marker-alt"></i> {hotel.location}
            </div>
            <div className="hotel-rating">
              <span className="stars">{'★'.repeat(Math.floor(hotel.rating))}{'☆'.repeat(5 - Math.floor(hotel.rating))}</span>
              <span className="rating-value">{hotel.rating}</span>
            </div>
            <div className="price-range">Price: {hotel.priceRange}</div>
          </div>
          
          <div className="hotel-image-gallery">
            {hotel.image ? (
              <img 
                src={hotel.image} 
                alt={hotel.name} 
                className="main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                }} 
              />
            ) : (
              <div className="image-placeholder">
                <i className="fas fa-hotel"></i>
                <p>No image available</p>
              </div>
            )}
          </div>
          
          <div className="hotel-description">
            <h2>About the Hotel</h2>
            <p>{hotel.description}</p>
          </div>
          
          <div className="hotel-specialties">
            <h2>What Makes Us Special</h2>
            {hotel.specialFeatures ? (
              <ul className="specialty-list">
                {hotel.specialFeatures.map((feature, index) => (
                  <li key={index} className="specialty-item">
                    <i className="fas fa-gem"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Information about specialties not available for this hotel.</p>
            )}
          </div>
          
          <div className="hotel-amenities">
            <h2>Amenities</h2>
            <div className="amenities-grid">
              <div className="amenity">
                <i className="fas fa-wifi"></i>
                <span>Free Wi-Fi</span>
              </div>
              <div className="amenity">
                <i className="fas fa-swimming-pool"></i>
                <span>Swimming Pool</span>
              </div>
              <div className="amenity">
                <i className="fas fa-concierge-bell"></i>
                <span>Room Service</span>
              </div>
              <div className="amenity">
                <i className="fas fa-spa"></i>
                <span>Spa</span>
              </div>
              <div className="amenity">
                <i className="fas fa-dumbbell"></i>
                <span>Fitness Center</span>
              </div>
              <div className="amenity">
                <i className="fas fa-utensils"></i>
                <span>Restaurant</span>
              </div>
            </div>
          </div>
          
          <div className="booking-section">
            <h2>Book Your Stay</h2>
            {!showBookingForm ? (
              <button 
                className="book-now-btn"
                onClick={() => navigate(`/hotel-booking/${hotelId}?state=${formattedStateId}`)}
              >
                <i className="fas fa-calendar-check"></i> Book Now
              </button>
            ) : (
              <form className="booking-form" onSubmit={handleBooking}>
                <div className="form-group">
                  <label htmlFor="checkIn">Check-in Date</label>
                  <input 
                    type="date" 
                    id="checkIn" 
                    name="checkIn"
                    value={bookingData.checkIn}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="checkOut">Check-out Date</label>
                  <input 
                    type="date" 
                    id="checkOut" 
                    name="checkOut"
                    value={bookingData.checkOut}
                    onChange={handleInputChange}
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="guests">Guests</label>
                    <select 
                      id="guests" 
                      name="guests"
                      value={bookingData.guests}
                      onChange={handleInputChange}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="rooms">Rooms</label>
                    <select 
                      id="rooms" 
                      name="rooms"
                      value={bookingData.rooms}
                      onChange={handleInputChange}
                      required
                    >
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="booking-actions">
                  <button type="submit" className="submit-booking">
                    <i className="fas fa-check"></i> Confirm Booking
                  </button>
                  <button 
                    type="button" 
                    className="cancel-booking"
                    onClick={() => setShowBookingForm(false)}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            )}
            <p className="booking-info">
              Secure your reservation for an unforgettable experience at {hotel.name}.
              Special rates available for extended stays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails; 