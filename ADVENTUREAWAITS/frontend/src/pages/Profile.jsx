import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import EditProfileModal from '../components/EditProfileModal';
import NotificationsModal from '../components/NotificationsModal';
import SecurityModal from '../components/SecurityModal';
import '../styles/Profile.css';

const Profile = () => {
  const { user, favorites, bookings, removeFromFavorites, cancelBooking, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites');
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  
  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    // Check if this is a new login session
    const isNewLogin = sessionStorage.getItem('newLogin') === 'true';
    if (isNewLogin) {
      setShowWelcome(true);
      // Reset the flag
      sessionStorage.removeItem('newLogin');
      
      // Hide welcome message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);
  
  // Handler for removing a favorite
  const handleRemoveFavorite = (itemId, type) => {
    removeFromFavorites(itemId, type);
  };
  
  // Handler for cancelling a booking
  const handleCancelBooking = (bookingId) => {
    cancelBooking(bookingId);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Log out handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  if (!user) {
    return null; // Don't render anything if user is not logged in (will redirect)
  }
  
  return (
    <div className="app-container">
      <div id="star-background" className="star-background"></div>
      <Header />
      
      <main className="main-content profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <img src={user.photoURL} alt="Profile" />
            </div>
            <h1 className="profile-name">{user.displayName}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-meta">
              <div className="profile-meta-item">
                <i className="fas fa-calendar-check"></i>
                <span>{bookings.filter(b => b.status !== 'cancelled').length} Active Bookings</span>
              </div>
              <div className="profile-meta-item">
                <i className="fas fa-heart"></i>
                <span>{favorites.length} Favorites</span>
              </div>
              <div className="profile-meta-item">
                <i className="fas fa-clock"></i>
                <span>Member since {formatDate(user.createdAt || new Date())}</span>
              </div>
            </div>
          </div>
          
          <div className="profile-tabs">
            <button 
              className={`profile-tab ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <i className="fas fa-heart"></i> Favorites
            </button>
            <button 
              className={`profile-tab ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <i className="fas fa-calendar-check"></i> My Bookings
            </button>
            <button 
              className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fas fa-cog"></i> Settings
            </button>
          </div>
          
          <div className="profile-content">
            {showWelcome && (
              <div className="welcome-message">
                <div className="welcome-content">
                  <i className="fas fa-user-check"></i>
                  <h2>Welcome, {user.displayName || 'Traveler'}!</h2>
                  <p>You're successfully logged in to Adventure Awaits</p>
                </div>
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className="favorites-section">
                <h2>My Favorite Destinations</h2>
                {favorites.length > 0 ? (
                  <div className="favorites-grid">
                    {favorites.map(item => (
                      <div className="favorite-card" key={`${item.id}-${item.type}`}>
                        <div className="favorite-image">
                          <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                          <span className="favorite-type">{item.type}</span>
                          <button 
                            className="remove-favorite-btn"
                            onClick={() => handleRemoveFavorite(item.id, item.type)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="favorite-details">
                          <h3 className="favorite-name">{item.name}</h3>
                          <p className="favorite-location">
                            <i className="fas fa-map-marker-alt"></i> {item.location}
                          </p>
                          <div className="favorite-footer">
                            <span className="favorite-date">Added on {formatDate(item.addedAt)}</span>
                            <Link to={`/state/${item.stateId}/${item.type}/${item.id}`} className="view-favorite-btn">
                              <i className="fas fa-eye"></i> View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-message">
                    <i className="far fa-heart"></i>
                    <h3>No favorites yet</h3>
                    <p>You haven't added any favorites yet. Explore destinations and add some to your favorites.</p>
                    <Link to="/" className="explore-btn">Explore Destinations</Link>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'bookings' && (
              <div className="bookings-section">
                <h2>My Bookings</h2>
                {bookings.length > 0 ? (
                  <div className="bookings-list">
                    {bookings.map(booking => (
                      <div key={booking.id} className={`booking-card ${booking.status}`}>
                        <div className="booking-image">
                          <img src={booking.image || '/placeholder.jpg'} alt={booking.name} />
                          <div className={`booking-status ${booking.status}`}>
                            {booking.status}
                          </div>
                        </div>
                        <div className="booking-details">
                          <h3 className="booking-name">{booking.name}</h3>
                          <p className="booking-location">
                            <i className="fas fa-map-marker-alt"></i> {booking.location}
                          </p>
                          <div className="booking-dates">
                            <div className="date-group">
                              <span className="date-label">Check-in</span>
                              <span className="date-value">{booking.checkIn}</span>
                            </div>
                            <div className="date-group">
                              <span className="date-label">Check-out</span>
                              <span className="date-value">{booking.checkOut}</span>
                            </div>
                          </div>
                          <p className="booking-guests">
                            <i className="fas fa-user"></i> {booking.guests} Guests
                          </p>
                        </div>
                        <div className="booking-actions">
                          <Link to={`/state/${booking.stateId}/${booking.type}/${booking.itemId}`} className="booking-btn view-btn">
                            <i className="fas fa-eye"></i> Details
                          </Link>
                          {booking.status === 'confirmed' && (
                            <button 
                              className="booking-btn cancel-btn"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <i className="fas fa-times"></i> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-message">
                    <i className="far fa-calendar-times"></i>
                    <h3>No bookings yet</h3>
                    <p>You haven't made any bookings yet. Explore destinations and book your next adventure.</p>
                    <Link to="/" className="explore-btn">Explore Destinations</Link>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="settings-section">
                <h2>Account Settings</h2>
                <div className="settings-grid">
                  <div className="settings-card">
                    <div className="settings-icon">
                      <i className="fas fa-user-edit"></i>
                    </div>
                    <div className="settings-details">
                      <h3>Edit Profile</h3>
                      <p>Update your personal information and profile picture</p>
                      <button 
                        className="settings-btn"
                        onClick={() => setShowEditProfileModal(true)}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                  
                  <div className="settings-card">
                    <div className="settings-icon">
                      <i className="fas fa-bell"></i>
                    </div>
                    <div className="settings-details">
                      <h3>Notifications</h3>
                      <p>Manage your notification preferences and alerts</p>
                      <button 
                        className="settings-btn"
                        onClick={() => setShowNotificationsModal(true)}
                      >
                        Notification Settings
                      </button>
                    </div>
                  </div>
                  
                  <div className="settings-card">
                    <div className="settings-icon">
                      <i className="fas fa-lock"></i>
                    </div>
                    <div className="settings-details">
                      <h3>Security</h3>
                      <p>Update your password and security settings</p>
                      <button 
                        className="settings-btn"
                        onClick={() => setShowSecurityModal(true)}
                      >
                        Security Settings
                      </button>
                    </div>
                  </div>
                  
                  <div className="settings-card">
                    <div className="settings-icon">
                      <i className="fas fa-sign-out-alt"></i>
                    </div>
                    <div className="settings-details">
                      <h3>Logout</h3>
                      <p>Sign out from your account on this device</p>
                      <button className="settings-btn danger" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Modals */}
      <EditProfileModal 
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
      
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
      
      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </div>
  );
};

export default Profile; 