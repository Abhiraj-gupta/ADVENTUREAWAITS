import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { states } from '../data/states';
import { getStateData } from '../data';
import '../styles/Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notification, setNotification] = useState(null);
  
  useEffect(() => {
    // Fetch bookings from localStorage
    const savedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    setBookings(savedBookings);
    setLoading(false);
  }, []);
  
  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    try {
      // Make sure we have a valid date by using a fallback
      const bookingDate = new Date(booking.date || booking.checkIn || new Date());
      const today = new Date();
      
      // Compare only dates without time
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
      
      if (activeTab === 'upcoming') {
        return bookingDateOnly >= todayDate;
      } else {
        return bookingDateOnly < todayDate;
      }
    } catch (error) {
      console.error("Error filtering booking:", error);
      return activeTab === 'upcoming'; // Default to showing in upcoming if there's an error
    }
  });
  
  // Group bookings by type
  const hotelBookings = filteredBookings.filter(booking => booking.type === 'hotel');
  const restaurantBookings = filteredBookings.filter(booking => booking.type === 'restaurant');
  const attractionBookings = filteredBookings.filter(booking => booking.type === 'attraction');
  
  // Get state name function
  const getStateName = (stateId) => {
    const state = states.find(s => s.id === stateId || s.id.replace('-', '') === stateId);
    return state ? state.name : stateId;
  };
  
  // Calculate cancellation fee based on booking type and date proximity
  const calculateCancellationFee = (booking) => {
    const today = new Date();
    let bookingDate;
    let rawPrice = 0;
    
    // Extract the raw price number without formatting
    if (booking.totalPrice) {
      rawPrice = parseFloat(booking.totalPrice.toString().replace(/[^\d.-]/g, ''));
    } else if (booking.type === 'hotel') {
      // Calculate hotel price based on nights, rooms, and room type
      const checkInDate = new Date(booking.checkIn || booking.date);
      const checkOutDate = new Date(booking.checkOut || new Date(checkInDate).setDate(checkInDate.getDate() + 1));
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1;
      
      // Base price per night (default ₹3,000 if not specified)
      let basePrice = 3000;
      if (booking.roomType === 'deluxe') basePrice = 4500;
      if (booking.roomType === 'suite') basePrice = 7500;
      
      rawPrice = basePrice * nights * (booking.rooms || 1);
    } else if (booking.type === 'restaurant') {
      // Calculate restaurant price (estimated based on people)
      const perPersonCost = 1200; // Average cost per person
      rawPrice = perPersonCost * (booking.people || 1);
    } else if (booking.type === 'attraction') {
      // Calculate attraction price based on tickets with proper pricing for each ticket type
      const adultPrice = 500;
      const childPrice = 250;
      const seniorPrice = 350;
      
      // Get individual ticket counts
      const adultTickets = booking.adultTickets || 0;
      const childTickets = booking.childTickets || 0;
      const seniorTickets = booking.seniorTickets || 0;
      
      // If individual ticket counts are specified, use them
      if (adultTickets > 0 || childTickets > 0 || seniorTickets > 0) {
        // Calculate price with different rates for each ticket type
        const adultTotal = adultPrice * adultTickets;
        const childTotal = childPrice * childTickets;
        const seniorTotal = seniorPrice * seniorTickets;
        
        let rawTotal = adultTotal + childTotal + seniorTotal;
        
        // Apply ticket type multiplier if specified
        let ticketMultiplier = 1;
        if (booking.ticketType === 'premium') ticketMultiplier = 1.5;
        if (booking.ticketType === 'vip') ticketMultiplier = 2.5;
        
        rawPrice = rawTotal * ticketMultiplier;
      } else {
        // Fallback to total tickets if individual counts aren't available
        const totalTickets = booking.totalTickets || booking.tickets || 1;
        const baseTicketPrice = 500; // Default to adult price
        
        let ticketMultiplier = 1;
        if (booking.ticketType === 'premium') ticketMultiplier = 1.5;
        if (booking.ticketType === 'vip') ticketMultiplier = 2.5;
        
        rawPrice = baseTicketPrice * totalTickets * ticketMultiplier;
      }
      
      console.log("Attraction price calculated:", rawPrice, "for", booking.name);
    }
    
    if (booking.type === 'hotel') {
      bookingDate = new Date(booking.checkIn);
      const daysDifference = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysDifference <= 1) {
        return { percentage: 100, amount: rawPrice }; // 100% fee for same day or next day
      } else if (daysDifference <= 3) {
        return { percentage: 75, amount: rawPrice * 0.75 }; // 75% fee for 2-3 days before
      } else if (daysDifference <= 7) {
        return { percentage: 50, amount: rawPrice * 0.5 }; // 50% fee for 4-7 days before
      } else {
        return { percentage: 10, amount: rawPrice * 0.1 }; // 10% fee for more than 7 days
      }
    } else if (booking.type === 'restaurant') {
      bookingDate = new Date(booking.date);
      const hoursDifference = Math.ceil((bookingDate - today) / (1000 * 60 * 60));
      
      if (hoursDifference > 24) {
        return { percentage: 0, amount: 0 }; // No fee if more than 24 hours before
      } else {
        return { percentage: 20, amount: rawPrice * 0.2 }; // 20% fee if less than 24 hours
      }
    } else if (booking.type === 'attraction') {
      bookingDate = new Date(booking.date);
      const daysDifference = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysDifference <= 1) {
        return { percentage: 75, amount: rawPrice * 0.75 }; // 75% fee for same day or next day
      } else if (daysDifference <= 3) {
        return { percentage: 50, amount: rawPrice * 0.5 }; // 50% fee for 2-3 days before
      } else {
        return { percentage: 20, amount: rawPrice * 0.2 }; // 20% fee for more than 3 days
      }
    }
    
    return { percentage: 0, amount: 0 }; // Default: no fee
  };
  
  // Open cancellation modal
  const openCancellationModal = (booking) => {
    setSelectedBooking(booking);
    setShowCancellationModal(true);
  };
  
  // Cancel booking function
  const handleCancelBooking = () => {
    if (selectedBooking) {
      const updatedBookings = bookings.filter(booking => booking.id !== selectedBooking.id);
      setBookings(updatedBookings);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      
      setShowCancellationModal(false);
      setSelectedBooking(null);
      
      // Show cancellation notification
      setNotification({
        type: 'success',
        message: 'Your booking has been cancelled successfully.'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };
  
  // Format date function
  const formatDate = (dateString) => {
    // Handle invalid or empty dates
    if (!dateString) {
      return "Not specified";
    }
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };
  
  // Ensure all bookings have the required fields
  useEffect(() => {
    if (bookings.length > 0) {
      // Add debugging message for each booking
      bookings.forEach(booking => {
        console.log(`Booking: ${booking.name}, Type: ${booking.type}, Date: ${booking.date || booking.checkIn}`);
        
        if (!booking.date && !booking.checkIn) {
          console.warn(`Booking ${booking.name} has no date information`);
        }
      });
    }
  }, [bookings]);
  
  // Format price and calculate if not present
  const getFormattedPrice = (booking) => {
    let price = 0;
    
    try {
      // Use the exact totalPrice if it exists (from original booking)
      if (booking.totalPrice && !isNaN(parseFloat(booking.totalPrice))) {
        price = parseFloat(booking.totalPrice);
      } else if (booking.type === 'hotel') {
        // Calculate hotel price based on nights, rooms, and room type
        const checkInDate = new Date(booking.checkIn || booking.date);
        const checkOutDate = new Date(booking.checkOut || new Date(checkInDate).setDate(checkInDate.getDate() + 1));
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1;
        
        // Base price per night (default ₹3,000 if not specified)
        let basePrice = 3000;
        if (booking.roomType === 'deluxe') basePrice = 4500;
        if (booking.roomType === 'suite') basePrice = 7500;
        
        price = basePrice * nights * (booking.rooms || 1);
      } else if (booking.type === 'restaurant') {
        // Calculate restaurant price (estimated based on people)
        const perPersonCost = 1200; // Average cost per person
        price = perPersonCost * (booking.people || 1);
      } else if (booking.type === 'attraction') {
        // Calculate attraction price
        const baseTicketPrice = 500; // Standard adult ticket price
        
        // Get individual ticket counts
        const adultTickets = parseInt(booking.adultTickets || 0);
        const childTickets = parseInt(booking.childTickets || 0);
        const seniorTickets = parseInt(booking.seniorTickets || 0);
        
        if (adultTickets > 0 || childTickets > 0 || seniorTickets > 0) {
          // Calculate total tickets
          const totalTickets = adultTickets + childTickets + seniorTickets;
          price = baseTicketPrice * totalTickets;
        } else {
          // If individual counts aren't available, use total tickets
          const totalTickets = parseInt(booking.totalTickets || booking.tickets || 1);
          price = baseTicketPrice * totalTickets;
        }
        
        // Apply ticket type multiplier if specified
        if (booking.ticketType === 'premium') {
          price = Math.round(price * 1.5);
        } else if (booking.ticketType === 'vip') {
          price = Math.round(price * 2.5);
        }
      }
      
      // Ensure price is a whole number
      price = Math.round(price);
      
    } catch (error) {
      console.error('Error calculating price:', error);
      // Set default prices based on booking type
      if (booking.type === 'hotel') {
        price = 3000;
      } else if (booking.type === 'restaurant') {
        price = 1200;
      } else if (booking.type === 'attraction') {
        price = 500;
      } else {
        price = 1000;
      }
    }
    
    return `₹${price.toLocaleString('en-IN')}`;
  };
  
  // Get price badge class based on booking type
  const getPriceBadgeClass = (bookingType) => {
    switch(bookingType) {
      case 'hotel':
        return 'hotel-price';
      case 'restaurant':
        return 'restaurant-price';
      case 'attraction':
        return 'attraction-price';
      default:
        return '';
    }
  };
  
  if (loading) {
    return (
      <div className="bookings-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Manage all your travel bookings in one place</p>
      </div>
      
      {notification && (
        <div className={`booking-notification ${notification.type}`}>
          <p>{notification.message}</p>
        </div>
      )}
      
      <div className="bookings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <i className="fas fa-calendar-alt"></i> Upcoming Bookings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          <i className="fas fa-history"></i> Past Bookings
        </button>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <i className="fas fa-calendar-times"></i>
          <h3>No {activeTab} bookings found</h3>
          <p>You don't have any {activeTab} bookings yet.</p>
          <Link to="/" className="browse-btn">Browse Destinations</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {hotelBookings.length > 0 && (
            <div className="booking-category">
              <h2><i className="fas fa-hotel"></i> Hotel Bookings</h2>
              <div className="booking-items">
                {hotelBookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-image">
                      <img src={booking.image} alt={booking.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                        }}
                      />
                      <div className="booking-type-badge hotel">
                        <i className="fas fa-hotel"></i> Hotel
                      </div>
                    </div>
                    <div className="booking-details">
                      <h3 className="booking-title">{booking.name}</h3>
                      <p className="booking-location">
                        <i className="fas fa-map-marker-alt"></i> {booking.location}, {getStateName(booking.stateId)}
                      </p>
                      
                      <div className="booking-info-grid">
                        <div className="info-item">
                          <i className="fas fa-calendar-check"></i>
                          <div>
                            <span className="info-label">Check-in</span>
                            <span className="info-value">{formatDate(booking.checkIn || booking.date)}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-calendar-times"></i>
                          <div>
                            <span className="info-label">Check-out</span>
                            <span className="info-value">{formatDate(booking.checkOut || booking.date)}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-user-friends"></i>
                          <div>
                            <span className="info-label">Guests</span>
                            <span className="info-value">{booking.guests} Guests, {booking.rooms} {booking.rooms > 1 ? 'Rooms' : 'Room'}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-bed"></i>
                          <div>
                            <span className="info-label">Room Type</span>
                            <span className="info-value">{booking.roomType ? booking.roomType.charAt(0).toUpperCase() + booking.roomType.slice(1) : 'Standard'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="booking-price-container">
                        <span className="booking-price-label">Total Price</span>
                        <span className={`booking-price ${getPriceBadgeClass(booking.type)}`}>
                          {getFormattedPrice(booking) || "₹3,000"}
                        </span>
                      </div>
                      
                      <div className="booking-actions">
                        <Link to={`/state/${booking.stateId}/hotel/${booking.itemId}`} className="view-booking-btn">
                          <i className="fas fa-info-circle"></i> View Details
                        </Link>
                        {activeTab === 'upcoming' && (
                          <button 
                            className="cancel-booking-btn"
                            onClick={() => openCancellationModal(booking)}
                          >
                            <i className="fas fa-times-circle"></i> Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {restaurantBookings.length > 0 && (
            <div className="booking-category">
              <h2><i className="fas fa-utensils"></i> Restaurant Reservations</h2>
              <div className="booking-items">
                {restaurantBookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-image">
                      <img src={booking.image} alt={booking.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                        }}
                      />
                      <div className="booking-type-badge restaurant">
                        <i className="fas fa-utensils"></i> Restaurant
                      </div>
                    </div>
                    <div className="booking-details">
                      <h3 className="booking-title">{booking.name}</h3>
                      <p className="booking-location">
                        <i className="fas fa-map-marker-alt"></i> {booking.location}, {getStateName(booking.stateId)}
                      </p>
                      
                      <div className="booking-info-grid">
                        <div className="info-item">
                          <i className="fas fa-calendar"></i>
                          <div>
                            <span className="info-label">Date</span>
                            <span className="info-value">{formatDate(booking.date)}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-clock"></i>
                          <div>
                            <span className="info-label">Time</span>
                            <span className="info-value">{booking.time}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-users"></i>
                          <div>
                            <span className="info-label">Party Size</span>
                            <span className="info-value">{booking.people} {booking.people > 1 ? 'People' : 'Person'}</span>
                          </div>
                        </div>
                        {booking.occasion && booking.occasion !== 'none' && (
                          <div className="info-item">
                            <i className="fas fa-glass-cheers"></i>
                            <div>
                              <span className="info-label">Occasion</span>
                              <span className="info-value">{booking.occasion.charAt(0).toUpperCase() + booking.occasion.slice(1)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="booking-price-container">
                        <span className="booking-price-label">Total Price</span>
                        <span className={`booking-price ${getPriceBadgeClass(booking.type)}`}>
                          {getFormattedPrice(booking)}
                        </span>
                      </div>
                      
                      <div className="booking-actions">
                        <Link to={`/state/${booking.stateId}/restaurant/${booking.itemId}`} className="view-booking-btn">
                          <i className="fas fa-info-circle"></i> View Details
                        </Link>
                        {activeTab === 'upcoming' && (
                          <button 
                            className="cancel-booking-btn"
                            onClick={() => openCancellationModal(booking)}
                          >
                            <i className="fas fa-times-circle"></i> Cancel Reservation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {attractionBookings.length > 0 && (
            <div className="booking-category">
              <h2><i className="fas fa-mountain"></i> Attraction Tickets</h2>
              <div className="booking-items">
                {attractionBookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-image">
                      <img src={booking.image} alt={booking.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                        }}
                      />
                      <div className="booking-type-badge attraction">
                        <i className="fas fa-mountain"></i> Attraction
                      </div>
                    </div>
                    <div className="booking-details">
                      <h3 className="booking-title">{booking.name}</h3>
                      <p className="booking-location">
                        <i className="fas fa-map-marker-alt"></i> {booking.location}, {getStateName(booking.stateId)}
                      </p>
                      
                      <div className="booking-info-grid">
                        <div className="info-item">
                          <i className="fas fa-calendar"></i>
                          <div>
                            <span className="info-label">Date</span>
                            <span className="info-value">{formatDate(booking.date)}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-ticket-alt"></i>
                          <div>
                            <span className="info-label">Tickets</span>
                            <span className="info-value">
                              {booking.adultTickets > 0 || booking.childTickets > 0 || booking.seniorTickets > 0 ? (
                                <>
                                  {booking.adultTickets > 0 && `${booking.adultTickets} Adult${booking.adultTickets > 1 ? 's' : ''}`}
                                  {booking.childTickets > 0 && (booking.adultTickets > 0 ? ', ' : '') + `${booking.childTickets} Child${booking.childTickets > 1 ? 'ren' : ''}`}
                                  {booking.seniorTickets > 0 && ((booking.adultTickets > 0 || booking.childTickets > 0) ? ', ' : '') + `${booking.seniorTickets} Senior${booking.seniorTickets > 1 ? 's' : ''}`}
                                </>
                              ) : (
                                `${booking.totalTickets || booking.tickets || 1} Ticket${(booking.totalTickets > 1 || booking.tickets > 1) ? 's' : ''} (₹500 each)`
                              )}
                            </span>
                          </div>
                        </div>
                        {booking.ticketType && (
                          <div className="info-item">
                            <i className="fas fa-tag"></i>
                            <div>
                              <span className="info-label">Ticket Type</span>
                              <span className="info-value">{booking.ticketType.charAt(0).toUpperCase() + booking.ticketType.slice(1)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="booking-price-container">
                        <span className="booking-price-label">Total Price</span>
                        <span className={`booking-price ${getPriceBadgeClass(booking.type)}`}>
                          {getFormattedPrice(booking)}
                        </span>
                      </div>
                      
                      <div className="booking-actions">
                        <Link to={`/state/${booking.stateId}/attraction/${booking.itemId}`} className="view-booking-btn">
                          <i className="fas fa-info-circle"></i> View Details
                        </Link>
                        {activeTab === 'upcoming' && (
                          <button 
                            className="cancel-booking-btn"
                            onClick={() => openCancellationModal(booking)}
                          >
                            <i className="fas fa-times-circle"></i> Cancel Tickets
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Cancellation Modal */}
      {showCancellationModal && selectedBooking && (
        <div className="cancellation-modal-overlay">
          <div className="cancellation-modal">
            <button className="close-modal" onClick={() => setShowCancellationModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="modal-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Cancel {selectedBooking.type === 'hotel' ? 'Booking' : 
                       selectedBooking.type === 'restaurant' ? 'Reservation' : 'Tickets'}</h3>
            </div>
            
            <div className="modal-body">
              <p className="cancel-warning">Are you sure you want to cancel your {selectedBooking.type === 'hotel' ? 'booking' : 
                                selectedBooking.type === 'restaurant' ? 'reservation' : 'tickets'} for <strong>{selectedBooking.name}</strong>?</p>
              
              <div className="cancellation-info">
                <div className="cancellation-fee-info">
                  <h4>Cancellation Fee Information</h4>
                  
                  {selectedBooking.type === 'hotel' && (
                    <ul>
                      <li>Within 24 hours of check-in: 100% of booking amount (no refund)</li>
                      <li>1-3 days before check-in: 50% of booking amount</li>
                      <li>4-7 days before check-in: 25% of booking amount</li>
                      <li>More than 7 days before check-in: 10% of booking amount</li>
                    </ul>
                  )}
                  
                  {selectedBooking.type === 'restaurant' && (
                    <ul>
                      <li>Within 24 hours of reservation: 100% of deposit (no refund)</li>
                      <li>More than 24 hours before reservation: 20% of deposit</li>
                    </ul>
                  )}
                  
                  {selectedBooking.type === 'attraction' && (
                    <ul>
                      <li>Within 48 hours of visit: 75% of ticket price</li>
                      <li>2-5 days before visit: 50% of ticket price</li>
                      <li>More than 5 days before visit: 20% of ticket price</li>
                    </ul>
                  )}
                </div>
                
                <div className="cancellation-breakdown">
                  <h4>Your Cancellation Calculation</h4>
                  
                  {(() => {
                    const { percentage, amount } = calculateCancellationFee(selectedBooking);
                    const originalAmount = amount / (percentage / 100);
                    const refundAmount = originalAmount - amount;
                    
                    return (
                      <div className="cancellation-amounts">
                        <div className="amount-row">
                          <span>Original Amount:</span>
                          <span>₹{originalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="amount-row fee">
                          <span>Cancellation Fee ({percentage}%):</span>
                          <span>₹{amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="amount-row refund">
                          <span>Refund Amount:</span>
                          <span>₹{refundAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-confirm-btn"
                onClick={handleCancelBooking}
              >
                Confirm Cancellation
              </button>
              <button 
                className="cancel-abort-btn"
                onClick={() => setShowCancellationModal(false)}
              >
                Keep My Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings; 