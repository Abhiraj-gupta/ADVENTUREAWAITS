import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { states } from '../data/states';
import '../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredStates, setFilteredStates] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Filter states based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStates([]);
    } else {
      const filtered = states.filter(state =>
        state.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStates(filtered);
    }
  }, [searchQuery]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-profile')) {
        setShowProfileMenu(false);
      }
      if (!event.target.closest('.search-container') && searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleStateSelect = (stateId) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/state/${stateId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') return;
    
    // Try to find an exact match first (case insensitive)
    const exactMatch = states.find(
      state => state.name.toLowerCase() === searchQuery.toLowerCase()
    );
    
    if (exactMatch) {
      // Navigate to the exact match immediately
      handleStateSelect(exactMatch.id);
      return;
    }
    
    // If no exact match, try partial matches in name
    const nameMatches = states.filter(state => 
      state.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (nameMatches.length > 0) {
      // Navigate to the first partial name match
      handleStateSelect(nameMatches[0].id);
      return;
    }
    
    // If no name matches, try description matches
    const descriptionMatches = states.filter(state => 
      state.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (descriptionMatches.length > 0) {
      // Navigate to the first description match
      handleStateSelect(descriptionMatches[0].id);
      return;
    }
    
    // If no matches at all, go to explore states
    navigate(`/explore-states?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="header main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-wrapper">
            <div className="logo-circle">
              <div className="logo-inner">
                <div className="chevron-logo">
                  <div className="chevron chevron-top"></div>
                  <div className="chevron chevron-bottom"></div>
                </div>
              </div>
              <div className="logo-glow"></div>
            </div>
            <div className="logo-text">
              <span className="adventure">Adventure</span>
              <span className="awaits">AWAITS</span>
            </div>
          </div>
        </Link>

        <div className="header-right">
          <div className="search-container" ref={searchRef}>
            <form className="search-bar" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="search-input"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
              />
              <button type="submit" className="search-button">
                <i className="fas fa-search"></i>
              </button>
            </form>
            
            {showSuggestions && filteredStates.length > 0 && (
              <div className="search-suggestions">
                {filteredStates.map(state => (
                  <div 
                    key={state.id} 
                    className="suggestion-item"
                    onClick={() => handleStateSelect(state.id)}
                  >
                    <i className="fas fa-map-marker-alt"></i>
                    <div className="suggestion-info">
                      <span className="suggestion-name">{state.name}</span>
                      <span className="suggestion-desc">{state.description.substring(0, 50)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="auth-container">
            {user ? (
              <div className="user-profile">
                <button 
                  className="profile-button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <img 
                    src={user.photoURL || 'https://via.placeholder.com/32'} 
                    alt="Profile" 
                    className="profile-image"
                  />
                  <span className="user-name">{user.displayName}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                {showProfileMenu && (
                  <div className="profile-menu">
                    <Link to="/profile" className="profile-option">
                      <i className="fas fa-user"></i>
                      Profile
                    </Link>
                    <Link to="/bookings" className="profile-option">
                      <i className="fas fa-calendar-check"></i>
                      My Bookings
                    </Link>
                    <Link to="/favorites" className="profile-option">
                      <i className="fas fa-heart"></i>
                      My Favorites
                    </Link>
                    <Link to="/budget-tracker" className="profile-option">
                      <i className="fas fa-wallet"></i>
                      Budget Tracker
                    </Link>
                    <Link to="/saved-budgets" className="profile-option">
                      <i className="fas fa-file-invoice-dollar"></i>
                      Saved Budgets
                    </Link>
                    <button className="profile-option logout" onClick={logout}>
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-button">
                <i className="fas fa-user"></i>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

