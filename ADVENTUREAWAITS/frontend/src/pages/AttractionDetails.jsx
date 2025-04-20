import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getStateData } from '../data';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import '../styles/AttractionDetails.css';

const AttractionDetails = () => {
  const { stateId, attractionId } = useParams();
  const navigate = useNavigate();
  const { addBooking, user } = useAuth(); // Get addBooking function
  
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
  
  // State for ticket form
  const [ticketData, setTicketData] = useState({
    date: '',
    tickets: 1
  });
  const [showTicketForm, setShowTicketForm] = useState(false);
  
  // Get state data
  const stateData = getStateData(formattedStateId);
  
  // Find the attraction
  const attraction = stateData?.attractions?.find(attraction => attraction.id === parseInt(attractionId));
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // If attraction not found, navigate back to home
    if (!attraction) {
      navigate('/');
    }
  }, [attraction, navigate]);
  
  if (!attraction) {
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
  
  // Handle ticket form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketData(prev => ({
      ...prev,
      [name]: name === 'tickets' ? parseInt(value) : value
    }));
  };
  
  // Handle ticket booking submission
  const handleTicketBooking = (e) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }
    
    // Create booking object
    const newBooking = {
      type: 'attraction',
      itemId: parseInt(attractionId),
      stateId: formattedStateId,
      name: attraction.name,
      image: attraction.image,
      date: ticketData.date,
      tickets: ticketData.tickets
    };
    
    // Add booking
    const bookingId = addBooking(newBooking);
    
    if (bookingId) {
      alert('Tickets booked successfully! You can view your booking in the My Bookings page.');
      navigate('/bookings');
    }
  };
  
  return (
    <div className="app-container">
      <div id="star-background" className="star-background"></div>
      <Header />

      <div className="attraction-details-page">
        <div className="attraction-details-container">
          <button 
            className="back-button" 
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>
          
          <div className="attraction-header">
            <h1>{attraction.name}</h1>
            <div className="attraction-location">
              <i className="fas fa-map-marker-alt"></i> {attraction.location}
            </div>
            <div className="attraction-rating">
              <span className="stars">{'★'.repeat(Math.floor(attraction.rating))}{'☆'.repeat(5 - Math.floor(attraction.rating))}</span>
              <span className="rating-value">{attraction.rating}</span>
            </div>
            <div className="attraction-entry-fee">Entry Fee: {attraction.entryFee}</div>
          </div>
          
          <div className="attraction-image-gallery">
            {attraction.image ? (
              <img 
                src={attraction.image} 
                alt={attraction.name} 
                className="main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                }} 
              />
            ) : (
              <div className="image-placeholder">
                <i className="fas fa-mountain"></i>
                <p>No image available</p>
              </div>
            )}
          </div>
          
          <div className="attraction-description">
            <h2>About the Attraction</h2>
            <p>{attraction.description}</p>
          </div>
          
          <div className="attraction-highlights">
            <h2>Highlights</h2>
            {attraction.highlights ? (
              <ul className="highlight-list">
                {attraction.highlights.map((highlight, index) => (
                  <li key={index} className="highlight-item">
                    <i className="fas fa-landmark"></i>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Information about highlights not available for this attraction.</p>
            )}
          </div>
          
          <div className="attraction-features">
            <h2>Features</h2>
            <div className="features-grid">
              <div className="feature">
                <i className="fas fa-clock"></i>
                <span>Open Daily</span>
              </div>
              <div className="feature">
                <i className="fas fa-camera"></i>
                <span>Photography Allowed</span>
              </div>
              <div className="feature">
                <i className="fas fa-restroom"></i>
                <span>Restrooms</span>
              </div>
              <div className="feature">
                <i className="fas fa-parking"></i>
                <span>Parking Available</span>
              </div>
              <div className="feature">
                <i className="fas fa-wheelchair"></i>
                <span>Wheelchair Accessible</span>
              </div>
              <div className="feature">
                <i className="fas fa-store"></i>
                <span>Gift Shop</span>
              </div>
            </div>
          </div>
          
          <div className="visiting-hours">
            <h2>Visiting Hours</h2>
            <div className="hours-grid">
              <div className="day">Monday - Friday</div>
              <div className="time">9:00 AM - 5:00 PM</div>
              <div className="day">Saturday - Sunday</div>
              <div className="time">8:00 AM - 6:00 PM</div>
              <div className="day">Public Holidays</div>
              <div className="time">10:00 AM - 4:00 PM</div>
            </div>
          </div>
          
          <div className="visitor-tips">
            <h2>Visitor Tips</h2>
            <ul className="tips-list">
              <li><i className="fas fa-lightbulb"></i> Best time to visit is early morning to avoid crowds</li>
              <li><i className="fas fa-lightbulb"></i> Bring comfortable walking shoes</li>
              <li><i className="fas fa-lightbulb"></i> Guided tours available every hour</li>
              <li><i className="fas fa-lightbulb"></i> Plan to spend at least 2-3 hours for the full experience</li>
              <li><i className="fas fa-lightbulb"></i> Water bottles and sunscreen recommended during summer</li>
            </ul>
          </div>
          
          <div className="ticket-section">
            <h2>Get Your Tickets</h2>
            {!showTicketForm ? (
              <button 
                className="ticket-now-btn"
                onClick={() => navigate(`/attraction-booking/${attractionId}?state=${formattedStateId}`)}
              >
                <i className="fas fa-ticket-alt"></i> Book Tickets
              </button>
            ) : (
              <form className="ticket-form" onSubmit={handleTicketBooking}>
                <div className="form-group">
                  <label htmlFor="date">Visit Date</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date"
                    value={ticketData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="tickets">Number of Tickets</label>
                  <select 
                    id="tickets" 
                    name="tickets"
                    value={ticketData.tickets}
                    onChange={handleInputChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                <div className="ticket-info-summary">
                  <div className="ticket-price">
                    <span>Price per ticket:</span>
                    <span>{attraction.entryFee || "₹500"}</span>
                  </div>
                  <div className="ticket-total">
                    <span>Total:</span>
                    <span>{parseInt(attraction.entryFee?.replace(/[^\d]/g, '') || 500) * ticketData.tickets}</span>
                  </div>
                </div>
                
                <div className="booking-actions">
                  <button type="submit" className="submit-ticket">
                    <i className="fas fa-check"></i> Confirm Booking
                  </button>
                  <button 
                    type="button" 
                    className="cancel-ticket"
                    onClick={() => setShowTicketForm(false)}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            )}
            <p className="ticket-info">
              Skip the line by booking your tickets in advance for {attraction.name}.
              Special discounts available for students and senior citizens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetails; 