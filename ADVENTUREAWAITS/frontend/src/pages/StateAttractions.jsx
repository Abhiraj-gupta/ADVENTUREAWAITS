import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CardList from '../components/CardList';
import PageTransition from '../components/PageTransition';
import { states, getStateData } from '../data';
import '../styles/StateCategoryPage.css';

const StateAttractions = () => {
  const { stateId } = useParams();
  const navigate = useNavigate();
  
  // Find the state data
  const stateInfo = states.find(state => state.id === stateId);
  const stateData = getStateData(stateId);
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // If state not found, navigate back to home
    if (!stateInfo) {
      navigate('/');
    }
    
    // Create stars effect
    createStars();
  }, [stateInfo, navigate]);
  
  if (!stateInfo) {
    return <div className="loading">Loading...</div>;
  }
  
  // Function to create stars in the background
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

  return (
    <div className="app-container">
      <div id="star-background" className="star-background"></div>
      <Header />
      
      <PageTransition>
        <div className="state-category-page">
          <div className="category-navigation">
            <Link to={`/state/${stateId}`} className="back-button">
              <i className="fas fa-arrow-left"></i>
              <span>Back to {stateInfo.name}</span>
            </Link>
            
            <div className="category-tabs">
              <Link to={`/state/${stateId}/hotels`} className="category-tab">
                <i className="fas fa-hotel"></i>
                <span>Hotels</span>
              </Link>
              <Link to={`/state/${stateId}/restaurants`} className="category-tab">
                <i className="fas fa-utensils"></i>
                <span>Restaurants</span>
              </Link>
              <Link to={`/state/${stateId}/attractions`} className="category-tab active">
                <i className="fas fa-mountain"></i>
                <span>Attractions</span>
              </Link>
            </div>
          </div>
          
          <div className="category-banner attraction-banner">
            <div className="banner-content">
              <h1><i className="fas fa-mountain"></i> Attractions in {stateInfo.name}</h1>
              <p>Explore the must-visit sights and experiences</p>
            </div>
          </div>
          
          <div className="category-content">
            <CardList 
              items={stateData.attractions} 
              category="attractions"
              stateId={stateId}
            />
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default StateAttractions; 