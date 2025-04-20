import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { preferencesAPI } from '../services/api';
import '../styles/Modals.css';

const NotificationsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Default notification settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketing: false,
    bookingUpdates: true,
    dealAlerts: true,
    tripReminders: true,
    accountActivity: true,
    newsletter: false,
    smsNotifications: false,
    promotions: false
  });

  // Fetch user's notification settings on modal open
  useEffect(() => {
    if (isOpen && user) {
      fetchNotificationSettings();
    }
  }, [isOpen, user]);

  const fetchNotificationSettings = async () => {
    setLoadingSettings(true);
    try {
      // In a real app, this would fetch from the backend
      // For this example, we'll simulate a successful API call
      // and use default values or localStorage values
      
      // Check if we have settings in localStorage
      const storedSettings = localStorage.getItem('notificationSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        // Simulate API call
        // const response = await preferencesAPI.getNotificationSettings();
        // setSettings(response.data);
        
        // For demo, we'll use default settings
        // and also save to localStorage for persistence
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load your notification settings. Please try again.'
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // In a real app, this would update the backend
      // await preferencesAPI.updateNotificationSettings(settings);
      
      // For this example, we'll just save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      setMessage({
        type: 'success',
        text: 'Notification settings updated successfully!'
      });
      
      // Wait a moment before closing
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update settings. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Notification Settings</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {message.text && (
            <div className={`notification ${message.type}`}>
              {message.text}
            </div>
          )}
          
          {loadingSettings ? (
            <div className="loading-container">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading your preferences...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="preferences-form">
              <div className="settings-section">
                <h3>Notification Methods</h3>
                <p className="section-description">
                  Choose how you want to be notified
                </p>
                
                <div className="toggle-group">
                  <div className="toggle-item">
                    <label htmlFor="emailNotifications" className="toggle-label">
                      <i className="fas fa-envelope"></i> Email Notifications
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        name="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  
                  <div className="toggle-item">
                    <label htmlFor="pushNotifications" className="toggle-label">
                      <i className="fas fa-bell"></i> Push Notifications
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="pushNotifications"
                        name="pushNotifications"
                        checked={settings.pushNotifications}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  
                  <div className="toggle-item">
                    <label htmlFor="smsNotifications" className="toggle-label">
                      <i className="fas fa-sms"></i> SMS Notifications
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        name="smsNotifications"
                        checked={settings.smsNotifications}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>Notification Types</h3>
                <p className="section-description">
                  Select the types of notifications you want to receive
                </p>
                
                <div className="toggle-group">
                  <div className="toggle-item">
                    <label htmlFor="bookingUpdates" className="toggle-label">
                      <i className="fas fa-calendar-check"></i> Booking Updates
                      <span className="label-description">Updates about your reservations and bookings</span>
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="bookingUpdates"
                        name="bookingUpdates"
                        checked={settings.bookingUpdates}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  
                  <div className="toggle-item">
                    <label htmlFor="dealAlerts" className="toggle-label">
                      <i className="fas fa-tags"></i> Deal Alerts
                      <span className="label-description">Special offers and limited-time deals</span>
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="dealAlerts"
                        name="dealAlerts"
                        checked={settings.dealAlerts}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  
                  <div className="toggle-item">
                    <label htmlFor="tripReminders" className="toggle-label">
                      <i className="fas fa-plane-departure"></i> Trip Reminders
                      <span className="label-description">Reminders about upcoming trips</span>
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="tripReminders"
                        name="tripReminders"
                        checked={settings.tripReminders}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  
                  <div className="toggle-item">
                    <label htmlFor="accountActivity" className="toggle-label">
                      <i className="fas fa-user-shield"></i> Account Activity
                      <span className="label-description">Login attempts and security notifications</span>
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="accountActivity"
                        name="accountActivity"
                        checked={settings.accountActivity}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  
                  <div className="toggle-item">
                    <label htmlFor="newsletter" className="toggle-label">
                      <i className="fas fa-newspaper"></i> Newsletter
                      <span className="label-description">Weekly travel inspiration and news</span>
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="newsletter"
                        name="newsletter"
                        checked={settings.newsletter}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  
                  <div className="toggle-item">
                    <label htmlFor="promotions" className="toggle-label">
                      <i className="fas fa-gift"></i> Promotions
                      <span className="label-description">Promotional offers from our partners</span>
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="promotions"
                        name="promotions"
                        checked={settings.promotions}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  
                  <div className="toggle-item">
                    <label htmlFor="marketing" className="toggle-label">
                      <i className="fas fa-ad"></i> Marketing
                      <span className="label-description">Marketing emails and personalized recommendations</span>
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="marketing"
                        name="marketing"
                        checked={settings.marketing}
                        onChange={handleToggleChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                >
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal; 