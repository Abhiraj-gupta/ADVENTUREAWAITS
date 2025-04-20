import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import '../styles/Modals.css';

const SecurityModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30 // minutes
  });

  // Fetch security settings on component mount
  useEffect(() => {
    if (isOpen) {
      fetchSecuritySettings();
    }
  }, [isOpen]);

  const fetchSecuritySettings = async () => {
    try {
      // In a real app, this would fetch from the backend
      // For this example, we'll check localStorage
      
      const storedSettings = localStorage.getItem('securitySettings');
      if (storedSettings) {
        setSecuritySettings(JSON.parse(storedSettings));
      } else {
        // Save default settings to localStorage
        localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load your security settings.'
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match.'
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long.'
      });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // In a real app, this would call the backend API
      // await authAPI.updatePassword(passwordForm);
      
      // For this example, we'll just simulate success
      setMessage({
        type: 'success',
        text: 'Password updated successfully!'
      });
      
      // Clear the form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // In a real app, this would update the backend
      // await preferencesAPI.updateSecuritySettings(securitySettings);
      
      // For this example, we'll just save to localStorage
      localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
      
      setMessage({
        type: 'success',
        text: 'Security settings updated successfully!'
      });
    } catch (error) {
      console.error('Error updating security settings:', error);
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
          <h2>Security Settings</h2>
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
          
          <div className="security-sections">
            <div className="settings-section">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="security-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="password-requirements">
                  <p>Password must:</p>
                  <ul>
                    <li className={passwordForm.newPassword.length >= 8 ? 'valid' : ''}>
                      <i className={`fas ${passwordForm.newPassword.length >= 8 ? 'fa-check' : 'fa-times'}`}></i>
                      Be at least 8 characters long
                    </li>
                    <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'valid' : ''}>
                      <i className={`fas ${/[A-Z]/.test(passwordForm.newPassword) ? 'fa-check' : 'fa-times'}`}></i>
                      Include at least one uppercase letter
                    </li>
                    <li className={/[0-9]/.test(passwordForm.newPassword) ? 'valid' : ''}>
                      <i className={`fas ${/[0-9]/.test(passwordForm.newPassword) ? 'fa-check' : 'fa-times'}`}></i>
                      Include at least one number
                    </li>
                    <li className={/[!@#$%^&*]/.test(passwordForm.newPassword) ? 'valid' : ''}>
                      <i className={`fas ${/[!@#$%^&*]/.test(passwordForm.newPassword) ? 'fa-check' : 'fa-times'}`}></i>
                      Include at least one special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
                
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Update Password'}
                </button>
              </form>
            </div>
            
            <div className="settings-section">
              <h3>Account Security</h3>
              <form onSubmit={handleSecuritySettingsSubmit} className="security-form">
                <div className="toggle-group">
                  <div className="toggle-item">
                    <label htmlFor="twoFactorEnabled" className="toggle-label">
                      <i className="fas fa-shield-alt"></i> Two-Factor Authentication
                      <span className="label-description">Add an extra layer of security to your account</span>
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="twoFactorEnabled"
                        name="twoFactorEnabled"
                        checked={securitySettings.twoFactorEnabled}
                        onChange={handleSettingChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  
                  <div className="toggle-item">
                    <label htmlFor="loginNotifications" className="toggle-label">
                      <i className="fas fa-bell"></i> Login Notifications
                      <span className="label-description">Get notified about new logins to your account</span>
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="loginNotifications"
                        name="loginNotifications"
                        checked={securitySettings.loginNotifications}
                        onChange={handleSettingChange}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                  <select
                    id="sessionTimeout"
                    name="sessionTimeout"
                    value={securitySettings.sessionTimeout}
                    onChange={handleSettingChange}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Save Security Settings'}
                </button>
              </form>
            </div>
            
            <div className="settings-section danger-zone">
              <h3>Danger Zone</h3>
              <div className="danger-actions">
                <div className="danger-action">
                  <div className="danger-info">
                    <h4>Deactivate Account</h4>
                    <p>Temporarily disable your account. You can reactivate it later.</p>
                  </div>
                  <button className="btn-warning">
                    Deactivate
                  </button>
                </div>
                
                <div className="danger-action">
                  <div className="danger-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data. This cannot be undone.</p>
                  </div>
                  <button className="btn-danger">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal; 