import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStateData } from '../data';
import '../styles/Booking.css';

const HotelBooking = () => {
  const { user, addBooking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // Get hotel ID and state ID from URL params or query parameters
  const hotelId = params.hotelId || new URLSearchParams(location.search).get('id');
  const stateId = params.stateId || new URLSearchParams(location.search).get('state');
  
  // Form state
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
    roomType: 'standard'
  });
  
  // Get the hotel data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (hotelId && stateId) {
      const stateData = getStateData(stateId);
      const foundHotel = stateData?.hotels?.find(h => h.id === parseInt(hotelId));
      
      if (foundHotel) {
        setHotel(foundHotel);
        // Set default dates (today and tomorrow)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        setFormData(prev => ({
          ...prev,
          checkIn: today.toISOString().split('T')[0],
          checkOut: tomorrow.toISOString().split('T')[0]
        }));
      }
      setLoading(false);
    }
  }, [hotelId, stateId, user, navigate]);
  
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
    
    // Calculate nights and total price
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Parse price from string like "₹3,000 - ₹5,000"
    const priceMatch = hotel.priceRange.match(/₹([\d,]+)/);
    const basePrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 3000;
    
    // Apply room type multiplier
    const roomTypeMultiplier = 
      formData.roomType === 'standard' ? 1 :
      formData.roomType === 'deluxe' ? 1.5 : 
      formData.roomType === 'suite' ? 2.5 : 1;
      
    const totalPrice = basePrice * formData.rooms * nights * roomTypeMultiplier;
    
    const bookingData = {
      type: 'hotel',
      itemId: parseInt(hotelId),
      stateId: stateId,
      name: hotel.name,
      image: hotel.image,
      location: hotel.location,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: parseInt(formData.guests),
      rooms: parseInt(formData.rooms),
      roomType: formData.roomType,
      nights: nights,
      totalPrice: totalPrice,
      status: 'confirmed',
      bookedAt: new Date().toISOString()
    };
    
    // Add booking
    const bookingId = addBooking(bookingData);
    
    // Show success notification
    setNotification({
      type: 'success',
      message: 'Your hotel booking has been confirmed!'
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
          <p>Loading booking information...</p>
        </div>
      </div>
    );
  }
  
  if (!hotel) {
    return (
      <div className="booking-page">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Hotel Not Found</h2>
          <p>We couldn't find the hotel you're looking for.</p>
          <button onClick={() => navigate('/explore-states')} className="back-btn">
            Explore Other Destinations
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="booking-page hotel-booking">
      <div className="booking-container">
        {notification && (
          <div className={`notification ${notification.type}`}>
            <p>{notification.message}</p>
          </div>
        )}
        
        <div className="booking-header">
          <h1>Book Your Stay</h1>
          <p>Complete your reservation at <span className="highlight">{hotel.name}</span></p>
        </div>
        
        <div className="booking-content">
          <div className="booking-item-preview">
            <div className="preview-image">
              <img 
                src={hotel.image} 
                alt={hotel.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                }}
              />
            </div>
            
            <div className="preview-details">
              <h2>{hotel.name}</h2>
              <p className="preview-location">
                <i className="fas fa-map-marker-alt"></i> {hotel.location}
              </p>
              <div className="preview-rating">
                <span className="rating-value">{hotel.rating}</span>
                <span className="rating-stars">
                  {Array(5).fill().map((_, i) => (
                    <i key={i} className={`${i < Math.floor(hotel.rating) ? 'fas' : 'far'} fa-star`}></i>
                  ))}
                </span>
              </div>
              <p className="preview-price">{hotel.priceRange}</p>
              
              <div className="hotel-amenities">
                <h3>Amenities</h3>
                <div className="amenities-list">
                  <span><i className="fas fa-wifi"></i> Free WiFi</span>
                  <span><i className="fas fa-swimming-pool"></i> Swimming Pool</span>
                  <span><i className="fas fa-utensils"></i> Restaurant</span>
                  <span><i className="fas fa-parking"></i> Free Parking</span>
                  <span><i className="fas fa-concierge-bell"></i> Room Service</span>
                  <span><i className="fas fa-spa"></i> Spa</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="booking-form-container">
            <h2>Reservation Details</h2>
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkIn">Check-in Date</label>
                  <input 
                    type="date" 
                    id="checkIn" 
                    name="checkIn" 
                    value={formData.checkIn} 
                    onChange={handleChange}
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
                    value={formData.checkOut} 
                    onChange={handleChange}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="guests">Number of Guests</label>
                  <input 
                    type="number" 
                    id="guests" 
                    name="guests" 
                    value={formData.guests} 
                    onChange={handleChange}
                    min="1" 
                    max="10"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="rooms">Number of Rooms</label>
                  <input 
                    type="number" 
                    id="rooms" 
                    name="rooms" 
                    value={formData.rooms} 
                    onChange={handleChange}
                    min="1" 
                    max="5"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="roomType">Room Type</label>
                <select 
                  id="roomType" 
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  required
                >
                  <option value="standard">Standard Room</option>
                  <option value="deluxe">Deluxe Room</option>
                  <option value="suite">Luxury Suite</option>
                </select>
              </div>
              
              <div className="room-price-info">
                <h3>Room Rates</h3>
                <div className="price-table">
                  <div className="price-row price-header">
                    <div className="price-cell">Room Type</div>
                    <div className="price-cell">Price Per Night</div>
                    <div className="price-cell">Features</div>
                  </div>
                  <div className="price-row">
                    <div className="price-cell">Standard Room</div>
                    <div className="price-cell">{hotel.priceRange?.match(/₹([\d,]+)/) ? `₹${hotel.priceRange.match(/₹([\d,]+)/)[1]}` : "₹3,000"}</div>
                    <div className="price-cell">Queen bed, Free WiFi, Basic amenities</div>
                  </div>
                  <div className="price-row">
                    <div className="price-cell">Deluxe Room</div>
                    <div className="price-cell">{hotel.priceRange?.match(/₹([\d,]+)/) ? `₹${Math.round(parseInt(hotel.priceRange.match(/₹([\d,]+)/)[1].replace(/,/g, '')) * 1.5).toLocaleString('en-IN')}` : "₹4,500"}</div>
                    <div className="price-cell">King bed, Free WiFi, Premium amenities, City view</div>
                  </div>
                  <div className="price-row">
                    <div className="price-cell">Luxury Suite</div>
                    <div className="price-cell">{hotel.priceRange?.match(/₹([\d,]+)/) ? `₹${Math.round(parseInt(hotel.priceRange.match(/₹([\d,]+)/)[1].replace(/,/g, '')) * 2.5).toLocaleString('en-IN')}` : "₹7,500"}</div>
                    <div className="price-cell">King bed, Living area, Premium amenities, Balcony, Complimentary breakfast</div>
                  </div>
                </div>
                <p className="price-note">* Prices are per night excluding taxes and service fees</p>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="confirm-btn">
                  <i className="fas fa-check-circle"></i> Confirm Booking
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

export default HotelBooking; 