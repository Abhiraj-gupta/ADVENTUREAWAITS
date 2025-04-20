import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStateData } from '../data';
import '../styles/Booking.css';

const AttractionBooking = () => {
  const { user, addBooking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // Get attraction ID and state ID from URL params or query parameters
  const attractionId = params.attractionId || new URLSearchParams(location.search).get('id');
  const stateId = params.stateId || new URLSearchParams(location.search).get('state');
  
  // Form state
  const [formData, setFormData] = useState({
    date: '',
    adultTickets: 1,
    childTickets: 0,
    seniorTickets: 0,
    ticketType: 'standard',
    guidedTour: false
  });
  
  // Get the attraction data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (attractionId && stateId) {
      const stateData = getStateData(stateId);
      const foundAttraction = stateData?.attractions?.find(a => a.id === parseInt(attractionId));
      
      if (foundAttraction) {
        setAttraction(foundAttraction);
        // Set default date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData(prev => ({
          ...prev,
          date: tomorrow.toISOString().split('T')[0]
        }));
      }
      setLoading(false);
    }
  }, [attractionId, stateId, user, navigate]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Calculate total ticket count and price
    const totalTickets = parseInt(formData.adultTickets) + 
                          parseInt(formData.childTickets) + 
                          parseInt(formData.seniorTickets);
    
    // Parse entry fee from a string like "₹500 per person"
    const priceMatch = attraction.entryFee?.match(/₹([\d,]+)/);
    const basePrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 500;
    
    // Calculate price adjustments
    const adultPrice = basePrice;
    const childPrice = basePrice * 0.5; // 50% for children
    const seniorPrice = basePrice * 0.7; // 70% for seniors
    
    // Apply ticket type multiplier
    const ticketTypeMultiplier = 
      formData.ticketType === 'standard' ? 1 :
      formData.ticketType === 'premium' ? 1.5 :
      formData.ticketType === 'vip' ? 2.5 : 1;
    
    // Calculate total price
    const totalPrice = 
      (adultPrice * parseInt(formData.adultTickets) +
       childPrice * parseInt(formData.childTickets) +
       seniorPrice * parseInt(formData.seniorTickets)) * 
      ticketTypeMultiplier + 
      (formData.guidedTour ? 1000 : 0); // Extra ₹1000 for guided tour
    
    const bookingData = {
      type: 'attraction',
      itemId: parseInt(attractionId),
      stateId: stateId,
      name: attraction.name,
      image: attraction.image,
      location: attraction.location,
      date: formData.date,
      adultTickets: parseInt(formData.adultTickets),
      childTickets: parseInt(formData.childTickets),
      seniorTickets: parseInt(formData.seniorTickets),
      totalTickets: totalTickets,
      ticketType: formData.ticketType,
      guidedTour: formData.guidedTour,
      totalPrice: totalPrice,
      status: 'confirmed',
      bookedAt: new Date().toISOString()
    };
    
    // Add booking
    const bookingId = addBooking(bookingData);
    
    // Show success notification
    setNotification({
      type: 'success',
      message: 'Your tickets have been booked successfully!'
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
          <p>Loading ticket information...</p>
        </div>
      </div>
    );
  }
  
  if (!attraction) {
    return (
      <div className="booking-page">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Attraction Not Found</h2>
          <p>We couldn't find the attraction you're looking for.</p>
          <button onClick={() => navigate('/explore-states')} className="back-btn">
            Explore Other Destinations
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="booking-page attraction-booking">
      <div className="booking-container">
        {notification && (
          <div className={`notification ${notification.type}`}>
            <p>{notification.message}</p>
          </div>
        )}
        
        <div className="booking-header">
          <h1>Book Tickets</h1>
          <p>Book your visit to <span className="highlight">{attraction.name}</span></p>
        </div>
        
        <div className="booking-content">
          <div className="booking-item-preview">
            <div className="preview-image">
              <img 
                src={attraction.image} 
                alt={attraction.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                }}
              />
            </div>
            
            <div className="preview-details">
              <h2>{attraction.name}</h2>
              <p className="preview-location">
                <i className="fas fa-map-marker-alt"></i> {attraction.location}
              </p>
              <div className="preview-rating">
                <span className="rating-value">{attraction.rating}</span>
                <span className="rating-stars">
                  {Array(5).fill().map((_, i) => (
                    <i key={i} className={`${i < Math.floor(attraction.rating) ? 'fas' : 'far'} fa-star`}></i>
                  ))}
                </span>
              </div>
              <p className="preview-entry-fee">
                <i className="fas fa-ticket-alt"></i> {attraction.entryFee}
              </p>
              
              <div className="attraction-highlights">
                <h3>Highlights</h3>
                <div className="highlights-list">
                  <span><i className="fas fa-clock"></i> 3-4 hours average visit duration</span>
                  <span><i className="fas fa-camera"></i> Photography allowed</span>
                  <span><i className="fas fa-umbrella-beach"></i> Family-friendly</span>
                  <span><i className="fas fa-map-signs"></i> Guided tours available</span>
                  <span><i className="fas fa-info-circle"></i> Audio guides available</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="booking-form-container">
            <h2>Ticket Details</h2>
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="date">Visit Date</label>
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
                <label>Number of Tickets</label>
                <div className="ticket-count-container">
                  <div className="ticket-type">
                    <label htmlFor="adultTickets">Adults</label>
                    <input 
                      type="number" 
                      id="adultTickets" 
                      name="adultTickets" 
                      value={formData.adultTickets} 
                      onChange={handleChange}
                      min="0" 
                      max="10"
                      required
                    />
                  </div>
                  
                  <div className="ticket-type">
                    <label htmlFor="childTickets">Children (5-12)</label>
                    <input 
                      type="number" 
                      id="childTickets" 
                      name="childTickets" 
                      value={formData.childTickets} 
                      onChange={handleChange}
                      min="0" 
                      max="10"
                    />
                  </div>
                  
                  <div className="ticket-type">
                    <label htmlFor="seniorTickets">Seniors (60+)</label>
                    <input 
                      type="number" 
                      id="seniorTickets" 
                      name="seniorTickets" 
                      value={formData.seniorTickets} 
                      onChange={handleChange}
                      min="0" 
                      max="10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="ticketType">Ticket Type</label>
                <select 
                  id="ticketType" 
                  name="ticketType" 
                  value={formData.ticketType} 
                  onChange={handleChange}
                  required
                >
                  <option value="standard">Standard Admission</option>
                  <option value="premium">Premium (Fast Track Entry)</option>
                  <option value="vip">VIP (Fast Track + Exclusive Areas)</option>
                </select>
              </div>
              
              <div className="form-checkbox">
                <input 
                  type="checkbox" 
                  id="guidedTour" 
                  name="guidedTour" 
                  checked={formData.guidedTour} 
                  onChange={handleChange}
                />
                <label htmlFor="guidedTour">
                  Add Guided Tour (+₹1,000)
                </label>
              </div>
              
              <div className="ticket-price-info">
                <h3>Ticket Pricing</h3>
                <div className="price-table">
                  <div className="price-row price-header">
                    <div className="price-cell">Ticket Type</div>
                    <div className="price-cell">Price</div>
                    <div className="price-cell">Includes</div>
                  </div>
                  <div className="price-row">
                    <div className="price-cell">Standard</div>
                    <div className="price-cell">
                      <div>Adult: {attraction.entryFee || "₹500"}</div>
                      <div>Child: {attraction.entryFee ? 
                        `₹${Math.round(parseInt((attraction.entryFee.match(/₹([\d,]+)/)?.[1] || "500").replace(/,/g, '')) * 0.5).toLocaleString('en-IN')}` : 
                        "₹250"}</div>
                      <div>Senior: {attraction.entryFee ? 
                        `₹${Math.round(parseInt((attraction.entryFee.match(/₹([\d,]+)/)?.[1] || "500").replace(/,/g, '')) * 0.7).toLocaleString('en-IN')}` : 
                        "₹350"}</div>
                    </div>
                    <div className="price-cell">Basic entry, access to main exhibits and areas</div>
                  </div>
                  <div className="price-row">
                    <div className="price-cell">Premium</div>
                    <div className="price-cell">
                      <div>Adult: {attraction.entryFee ? 
                        `₹${Math.round(parseInt((attraction.entryFee.match(/₹([\d,]+)/)?.[1] || "500").replace(/,/g, '')) * 1.5).toLocaleString('en-IN')}` : 
                        "₹750"}</div>
                      <div>Child: {attraction.entryFee ? 
                        `₹${Math.round(parseInt((attraction.entryFee.match(/₹([\d,]+)/)?.[1] || "500").replace(/,/g, '')) * 0.75).toLocaleString('en-IN')}` : 
                        "₹375"}</div>
                      <div>Senior: {attraction.entryFee ? 
                        `₹${Math.round(parseInt((attraction.entryFee.match(/₹([\d,]+)/)?.[1] || "500").replace(/,/g, '')) * 1.0).toLocaleString('en-IN')}` : 
                        "₹500"}</div>
                    </div>
                    <div className="price-cell">Standard entry plus priority access, audio guide, and souvenir booklet</div>
                  </div>
                  <div className="price-row">
                    <div className="price-cell">VIP</div>
                    <div className="price-cell">
                      <div>Adult: {attraction.entryFee ? 
                        `₹${Math.round(parseInt((attraction.entryFee.match(/₹([\d,]+)/)?.[1] || "500").replace(/,/g, '')) * 2.5).toLocaleString('en-IN')}` : 
                        "₹1,250"}</div>
                      <div>Child: {attraction.entryFee ? 
                        `₹${Math.round(parseInt((attraction.entryFee.match(/₹([\d,]+)/)?.[1] || "500").replace(/,/g, '')) * 1.25).toLocaleString('en-IN')}` : 
                        "₹625"}</div>
                      <div>Senior: {attraction.entryFee ? 
                        `₹${Math.round(parseInt((attraction.entryFee.match(/₹([\d,]+)/)?.[1] || "500").replace(/,/g, '')) * 1.75).toLocaleString('en-IN')}` : 
                        "₹875"}</div>
                    </div>
                    <div className="price-cell">Premium benefits plus exclusive access to restricted areas, personal guide, and refreshments</div>
                  </div>
                </div>
                <p className="price-note">* Children (5-12 years), Seniors (65+ years). Children under 5 enter free with paying adult</p>
                <p className="price-note">* Guided tour available for an additional ₹1,000 flat fee per group</p>
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

export default AttractionBooking; 