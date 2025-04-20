import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CardList from '../components/CardList';
import { getStateData } from '../data';
import { states } from '../data/states';
import '../styles/HomePage.css';

const HomePage = () => {
  const [selectedState, setSelectedState] = useState('uttar-pradesh');
  const [visibleSections, setVisibleSections] = useState({
    hotels: false,
    restaurants: false,
    attractions: false
  });
  
  // Format the price range to remove rupee symbols
  const formatPriceRange = (priceRange) => {
    if (!priceRange) return '';
    // Replace all variants of rupee symbols including Unicode characters
    return priceRange.replace(/[₹₨र]/g, '').trim();
  };
  
  // Generate stars based on rating value
  const generateStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star"></i>
        ))}
        {hasHalfStar && <i className="fas fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star"></i>
        ))}
      </>
    );
  };
  
  // Helper function to convert state.js ID format to index.js format
  const convertStateIdFormat = (stateId) => {
    // Convert hyphen format to camelCase
    if (stateId === 'kerala' || stateId === 'odisha' || stateId === 'gujarat') {
      return stateId;
    } else if (stateId === 'jammu-kashmir') {
      return 'jammuKashmir';
    } else if (stateId === 'himachal-pradesh') {
      return 'himachalPradesh';
    } else if (stateId === 'uttar-pradesh') {
      return 'uttarPradesh';
    }
    return stateId;
  };
  
  // Use convertStateIdFormat for data retrieval
  const stateData = getStateData(convertStateIdFormat(selectedState));
  
  // Refs for scroll animations
  const hotelsRef = useRef(null);
  const restaurantsRef = useRef(null);
  const attractionsRef = useRef(null);
  
  // Create stars on component mount and set up observers
  useEffect(() => {
    createStars();
    
    // Set up intersection observer for animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          
          if (sectionId === 'home-hotels-section') {
            setVisibleSections(prev => ({ ...prev, hotels: true }));
          } else if (sectionId === 'home-restaurants-section') {
            setVisibleSections(prev => ({ ...prev, restaurants: true }));
          } else if (sectionId === 'home-attractions-section') {
            setVisibleSections(prev => ({ ...prev, attractions: true }));
          }
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    if (hotelsRef.current) observer.observe(hotelsRef.current);
    if (restaurantsRef.current) observer.observe(restaurantsRef.current);
    if (attractionsRef.current) observer.observe(attractionsRef.current);
    
    return () => {
      if (hotelsRef.current) observer.unobserve(hotelsRef.current);
      if (restaurantsRef.current) observer.unobserve(restaurantsRef.current);
      if (attractionsRef.current) observer.unobserve(attractionsRef.current);
    };
  }, []);
  
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
  
  // Add this useEffect for scroll-triggered animations
  useEffect(() => {
    const handleScrollAnimation = () => {
      const scrollElements = document.querySelectorAll('.scroll-fade-in');
      
      scrollElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('visible');
        }
      });
    };
    
    window.addEventListener('scroll', handleScrollAnimation);
    // Trigger once on load
    handleScrollAnimation();
    
    return () => window.removeEventListener('scroll', handleScrollAnimation);
  }, []);
  
  // Add this function to your HomePage component
  const handleAddToFavorites = (type, id, stateId) => {
    // Get existing favorites from localStorage
    const existingFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Check if the item is already in favorites
    const isAlreadyFavorite = existingFavorites.some(
      item => item.type === type && item.id === id && item.stateId === stateId
    );
    
    if (isAlreadyFavorite) {
      alert('This item is already in your favorites!');
      return;
    }
    
    // Add the new favorite
    const newFavorite = {
      type,
      id,
      stateId,
      date: new Date().toISOString(),
      // Also save basic info for easy display
      name: type === 'hotel' 
        ? stateData.hotels.find(h => h.id === id)?.name 
        : type === 'restaurant' 
          ? stateData.restaurants.find(r => r.id === id)?.name
          : stateData.attractions.find(a => a.id === id)?.name,
      image: type === 'hotel' 
        ? stateData.hotels.find(h => h.id === id)?.image 
        : type === 'restaurant' 
          ? stateData.restaurants.find(r => r.id === id)?.image
          : stateData.attractions.find(a => a.id === id)?.image,
    };
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify([...existingFavorites, newFavorite]));
    
    // Show a confirmation
    alert(`Added to your favorites!`);
  };
  
  return (
    <main className="main-content home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-title-top">Discover the Wonders of</span>
            <span className="hero-title-main">Incredible India</span>
          </h1>
          <p className="hero-tagline">
            <span className="project-name">Adventure Awaits</span> 
            <span className="tagline-text">in every corner, from Himalayan peaks to Kerala's backwaters</span>
          </p>
          <button className="hero-cta" onClick={() => document.getElementById('explore-states-section').scrollIntoView({ behavior: 'smooth' })}>
            Explore Now <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
      
      {/* Explore States Section (3 columns, 2 rows grid) */}
      <div id="explore-states-section" className="explore-states-section">
        <h2>Explore States</h2>
        <div className="explore-states-grid">
          {states.map((state) => (
            <Link
              key={state.id}
              to={`/state/${convertStateIdFormat(state.id)}`}
              className="explore-state-card"
            >
                <h3>{state.name}</h3>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="category-rows">
        {/* Hotels Section - with booking buttons */}
        <div 
          ref={hotelsRef} 
          id="home-hotels-section" 
          className={`category-row ${visibleSections.hotels ? 'animate-in' : ''}`}
        >
          <div className="row-header">
            <div className="section-icon hotel-icon">
              <i className="fas fa-hotel"></i>
            </div>
            <div className="section-title">
              <h2>Hotels & Accommodations</h2>
              <p>Find comfortable stays for your journey</p>
            </div>
            <div className="view-all-link">
              <Link to={`/state/${convertStateIdFormat(selectedState)}#hotels`} className="view-all-btn">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
          
          <div className="grid-container">
            {/* First row of 3 hotels */}
            <div className="grid-row">
              {stateData.hotels.slice(0, 3).map(hotel => (
                <div key={hotel.id} className="grid-item">
                  <div className="item-card">
                    <div className="item-image">
                      <img src={hotel.image} alt={hotel.name} />
                    </div>
                    <div className="item-content">
                      <h3>{hotel.name}</h3>
                      <p className="item-location">{hotel.location}</p>
                      <div className="item-rating">
                        <span className="rating-value">{hotel.rating}</span>
                        <span className="rating-stars">{generateStars(hotel.rating)}</span>
                      </div>
                      <p className="item-price">{formatPriceRange(hotel.priceRange)}</p>
                      <div className="item-actions">
                        <Link 
                          to={`/state/${convertStateIdFormat(selectedState)}/hotel/${hotel.id}`} 
                          className="item-view-btn"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/hotel-booking/${hotel.id}?state=${convertStateIdFormat(selectedState)}`} 
                          className="item-book-btn"
                        >
                          Book Now
                        </Link>
                      </div>
                      <div className="item-actions secondary-actions">
                        <button 
                          className="add-favorite-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            // We'll implement this function later
                            handleAddToFavorites('hotel', hotel.id, convertStateIdFormat(selectedState));
                          }}
                        >
                          <i className="far fa-heart"></i> Add to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Second row of 3 hotels */}
            <div className="grid-row">
              {stateData.hotels.slice(3, 6).map(hotel => (
                <div key={hotel.id} className="grid-item">
                  <div className="item-card">
                    <div className="item-image">
                      <img src={hotel.image} alt={hotel.name} />
                    </div>
                    <div className="item-content">
                      <h3>{hotel.name}</h3>
                      <p className="item-location">{hotel.location}</p>
                      <div className="item-rating">
                        <span className="rating-value">{hotel.rating}</span>
                        <span className="rating-stars">{generateStars(hotel.rating)}</span>
                      </div>
                      <p className="item-price">{formatPriceRange(hotel.priceRange)}</p>
                      <div className="item-actions">
                        <Link 
                          to={`/state/${convertStateIdFormat(selectedState)}/hotel/${hotel.id}`} 
                          className="item-view-btn"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/hotel-booking/${hotel.id}?state=${convertStateIdFormat(selectedState)}`} 
                          className="item-book-btn"
                        >
                          Book Now
                        </Link>
                      </div>
                      <div className="item-actions secondary-actions">
                        <button 
                          className="add-favorite-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToFavorites('hotel', hotel.id, convertStateIdFormat(selectedState));
                          }}
                        >
                          <i className="far fa-heart"></i> Add to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Restaurants Section - with reservation buttons */}
        <div 
          ref={restaurantsRef} 
          id="home-restaurants-section" 
          className={`category-row ${visibleSections.restaurants ? 'animate-in' : ''}`}
        >
          <div className="row-header">
            <div className="section-icon restaurant-icon">
              <i className="fas fa-utensils"></i>
            </div>
            <div className="section-title">
              <h2>Restaurants & Dining</h2>
              <p>Discover delicious local cuisine and dining options</p>
            </div>
            <div className="view-all-link">
              <Link to={`/state/${convertStateIdFormat(selectedState)}#restaurants`} className="view-all-btn">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
          
          <div className="grid-container">
            {/* First row of 3 restaurants */}
            <div className="grid-row">
              {stateData.restaurants.slice(0, 3).map(restaurant => (
                <div key={restaurant.id} className="grid-item">
                  <div className="item-card">
                    <div className="item-image">
                      <img src={restaurant.image} alt={restaurant.name} />
                    </div>
                    <div className="item-content">
                      <h3>{restaurant.name}</h3>
                      <p className="item-location">{restaurant.location}</p>
                      <div className="item-rating">
                        <span className="rating-value">{restaurant.rating}</span>
                        <span className="rating-stars">{generateStars(restaurant.rating)}</span>
                      </div>
                      <p className="item-cuisine">{restaurant.cuisine}</p>
                      <p className="item-price">{formatPriceRange(restaurant.priceRange)}</p>
                      <div className="item-actions">
                        <Link 
                          to={`/state/${convertStateIdFormat(selectedState)}/restaurant/${restaurant.id}`} 
                          className="item-view-btn"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/restaurant-booking/${restaurant.id}?state=${convertStateIdFormat(selectedState)}`} 
                          className="item-book-btn restaurant-btn"
                        >
                          Reserve Table
                        </Link>
                      </div>
                      <div className="item-actions secondary-actions">
                        <button 
                          className="add-favorite-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToFavorites('restaurant', restaurant.id, convertStateIdFormat(selectedState));
                          }}
                        >
                          <i className="far fa-heart"></i> Add to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Second row of 3 restaurants */}
            <div className="grid-row">
              {stateData.restaurants.slice(3, 6).map(restaurant => (
                <div key={restaurant.id} className="grid-item">
                  <div className="item-card">
                    <div className="item-image">
                      <img src={restaurant.image} alt={restaurant.name} />
                    </div>
                    <div className="item-content">
                      <h3>{restaurant.name}</h3>
                      <p className="item-location">{restaurant.location}</p>
                      <div className="item-rating">
                        <span className="rating-value">{restaurant.rating}</span>
                        <span className="rating-stars">{generateStars(restaurant.rating)}</span>
                      </div>
                      <p className="item-cuisine">{restaurant.cuisine}</p>
                      <p className="item-price">{formatPriceRange(restaurant.priceRange)}</p>
                      <div className="item-actions">
                        <Link 
                          to={`/state/${convertStateIdFormat(selectedState)}/restaurant/${restaurant.id}`} 
                          className="item-view-btn"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/restaurant-booking/${restaurant.id}?state=${convertStateIdFormat(selectedState)}`} 
                          className="item-book-btn restaurant-btn"
                        >
                          Reserve Table
                        </Link>
                      </div>
                      <div className="item-actions secondary-actions">
                        <button 
                          className="add-favorite-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToFavorites('restaurant', restaurant.id, convertStateIdFormat(selectedState));
                          }}
                        >
                          <i className="far fa-heart"></i> Add to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Attractions Section - with ticket booking buttons */}
        <div 
          ref={attractionsRef} 
          id="home-attractions-section" 
          className={`category-row ${visibleSections.attractions ? 'animate-in' : ''}`}
        >
          <div className="row-header">
            <div className="section-icon attraction-icon">
              <i className="fas fa-mountain"></i>
            </div>
            <div className="section-title">
              <h2>Tourist Attractions</h2>
              <p>Explore the must-visit sights and experiences</p>
            </div>
            <div className="view-all-link">
              <Link to={`/state/${convertStateIdFormat(selectedState)}#attractions`} className="view-all-btn">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
          
          <div className="grid-container">
            {/* First row of 3 attractions */}
            <div className="grid-row">
              {stateData.attractions.slice(0, 3).map(attraction => (
                <div key={attraction.id} className="grid-item">
                  <div className="item-card">
                    <div className="item-image">
                      <img src={attraction.image} alt={attraction.name} />
                    </div>
                    <div className="item-content">
                      <h3>{attraction.name}</h3>
                      <p className="item-location">{attraction.location}</p>
                      <div className="item-rating">
                        <span className="rating-value">{attraction.rating}</span>
                        <span className="rating-stars">{generateStars(attraction.rating)}</span>
                      </div>
                      <p className="item-entry-fee">{attraction.entryFee}</p>
                      <div className="item-actions">
                        <Link 
                          to={`/state/${convertStateIdFormat(selectedState)}/attraction/${attraction.id}`} 
                          className="item-view-btn"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/attraction-booking/${attraction.id}?state=${convertStateIdFormat(selectedState)}`} 
                          className="item-book-btn attraction-btn"
                        >
                          Book Tickets
                        </Link>
                      </div>
                      <div className="item-actions secondary-actions">
                        <button 
                          className="add-favorite-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToFavorites('attraction', attraction.id, convertStateIdFormat(selectedState));
                          }}
                        >
                          <i className="far fa-heart"></i> Add to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Second row of 3 attractions */}
            <div className="grid-row">
              {stateData.attractions.slice(3, 6).map(attraction => (
                <div key={attraction.id} className="grid-item">
                  <div className="item-card">
                    <div className="item-image">
                      <img src={attraction.image} alt={attraction.name} />
                    </div>
                    <div className="item-content">
                      <h3>{attraction.name}</h3>
                      <p className="item-location">{attraction.location}</p>
                      <div className="item-rating">
                        <span className="rating-value">{attraction.rating}</span>
                        <span className="rating-stars">{generateStars(attraction.rating)}</span>
                      </div>
                      <p className="item-entry-fee">{attraction.entryFee}</p>
                      <div className="item-actions">
                        <Link 
                          to={`/state/${convertStateIdFormat(selectedState)}/attraction/${attraction.id}`} 
                          className="item-view-btn"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/attraction-booking/${attraction.id}?state=${convertStateIdFormat(selectedState)}`} 
                          className="item-book-btn attraction-btn"
                        >
                          Book Tickets
                        </Link>
                      </div>
                      <div className="item-actions secondary-actions">
                        <button 
                          className="add-favorite-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToFavorites('attraction', attraction.id, convertStateIdFormat(selectedState));
                          }}
                        >
                          <i className="far fa-heart"></i> Add to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Budget Tracker Section */}
        <div 
          id="home-budget-section" 
          className={`category-row budget-section ${visibleSections.attractions ? 'animate-in' : ''}`}
        >
          <div className="row-header">
            <div className="section-icon budget-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="section-title">
              <h2>Budget Tracker</h2>
              <p>Plan and manage your travel expenses</p>
            </div>
          </div>
          
          <BudgetCalculator />
        </div>
      </div>
    </main>
  );
};

// BudgetCalculator Component
const BudgetCalculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: '',
    travelers: '',
    duration: '',
    accommodation: 'mid-range',
    transportation: 'train',
    food: 'mid-range'
  });
  
  const [statePricing, setStatePricing] = useState(null);
  const [totalBudget, setTotalBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch pricing data when destination changes
  useEffect(() => {
    if (formData.destination) {
      fetchPricingData(formData.destination);
    }
  }, [formData.destination]);
  
  // Fetch pricing data from backend
  const fetchPricingData = async (state) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/budgets/pricing/${state}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pricing data');
      }
      
      const data = await response.json();
      setStatePricing(data.data);
    } catch (err) {
      console.error('Error fetching pricing data:', err);
      setError('Unable to fetch pricing data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate the budget when form data or pricing data changes
  useEffect(() => {
    if (statePricing && formData.travelers && formData.duration) {
      calculateBudget();
    }
  }, [formData, statePricing]);
  
  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    if (name === 'travelers' || name === 'duration') {
      parsedValue = value === '' ? '' : parseInt(value) || 0;
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };
  
  // Calculate the total budget using real pricing data
  const calculateBudget = () => {
    if (!statePricing) return;
    
    const travelers = parseInt(formData.travelers) || 0;
    const duration = parseInt(formData.duration) || 0;
    
    if (travelers <= 0 || duration <= 0) {
      setTotalBudget(0);
      return;
    }
    
    // Calculate accommodation cost
    const accommodationCost = statePricing.accommodation[formData.accommodation]?.price * duration * travelers || 0;
    
    // Calculate transportation cost (one-time cost)
    const transportationCost = statePricing.transportation[formData.transportation]?.price * travelers || 0;
    
    // Calculate food cost
    const foodCost = statePricing.food[formData.food]?.price * duration * travelers || 0;
    
    // Calculate activities (estimate as 20% of other costs)
    const activitiesCost = Math.round((accommodationCost + transportationCost + foodCost) * 0.2);
    
    // Calculate total
    const total = accommodationCost + transportationCost + foodCost + activitiesCost;
    
    setTotalBudget(total);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.destination || !formData.travelers || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }
    
    const travelers = parseInt(formData.travelers);
    const duration = parseInt(formData.duration);
    
    if (travelers <= 0 || duration <= 0) {
      setError('Number of travelers and duration must be greater than zero');
      return;
    }
    
    if (!statePricing) {
      setError('Pricing data is not available. Please try again.');
      return;
    }
    
    // Calculate costs using real pricing data
    const accommodationCost = statePricing.accommodation[formData.accommodation].price * duration * travelers;
    const transportationCost = statePricing.transportation[formData.transportation].price * travelers;
    const foodCost = statePricing.food[formData.food].price * duration * travelers;
    const activitiesCost = Math.round((accommodationCost + transportationCost + foodCost) * 0.2);
    
    // Prepare budget data for results page
    const budgetData = {
      destination: formData.destination,
      destinationName: formData.destination === 'jammuKashmir' ? 'Jammu & Kashmir' : 
                       formData.destination === 'himachalPradesh' ? 'Himachal Pradesh' :
                       formData.destination === 'uttarPradesh' ? 'Uttar Pradesh' :
                       formData.destination.charAt(0).toUpperCase() + formData.destination.slice(1),
      travelers: travelers,
      duration: duration,
      accommodation: formData.accommodation,
      accommodationDesc: statePricing.accommodation[formData.accommodation].description,
      transportation: formData.transportation,
      transportationDesc: statePricing.transportation[formData.transportation].description,
      food: formData.food,
      foodDesc: statePricing.food[formData.food].description,
      // Start date (today) and end date (today + duration)
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      // Budget breakdown
      accommodationTotal: accommodationCost,
      accommodationPerDay: statePricing.accommodation[formData.accommodation].price,
      transportationTotal: transportationCost,
      transportationPerPerson: statePricing.transportation[formData.transportation].price,
      foodTotal: foodCost,
      foodPerDay: statePricing.food[formData.food].price,
      activitiesTotal: activitiesCost,
      // Total budget
      totalBudget: accommodationCost + transportationCost + foodCost + activitiesCost,
      // Recommendations
      hotelRecommendations: statePricing.recommendations.hotels,
      restaurantRecommendations: statePricing.recommendations.restaurants
    };

    // Navigate to budget results page with the budget data
    navigate('/budget-results', { 
      state: { 
        budgetData: budgetData
      } 
    });
  };

  return (
    <div className="budget-tracker">
      <h3 className="budget-tracker-title">Budget Planner</h3>
      
      {error && <div className="budget-error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="budget-grid-form">
        {/* First row - 3 columns */}
        <div className="budget-grid-row">
          <div className="budget-grid-cell">
            <label>Destination</label>
            <select
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              required
              className="budget-select"
            >
              <option value="">Select State</option>
              <option value="kerala">Kerala</option>
              <option value="jammuKashmir">Jammu & Kashmir</option>
              <option value="himachalPradesh">Himachal Pradesh</option>
              <option value="gujarat">Gujarat</option>
              <option value="uttarPradesh">Uttar Pradesh</option>
              <option value="odisha">Odisha</option>
            </select>
          </div>

          <div className="budget-grid-cell">
            <label>Number of Travelers</label>
            <input
              type="number" 
              name="travelers" 
              min="1" 
              value={formData.travelers} 
              onChange={handleInputChange}
              required
              className="budget-input"
            />
          </div>
          
          <div className="budget-grid-cell">
            <label>Duration (days)</label>
            <input
              type="number" 
              name="duration" 
              min="1" 
              value={formData.duration} 
              onChange={handleInputChange}
              required
              className="budget-input"
            />
          </div>
        </div>

        {/* Second row - 3 columns */}
        <div className="budget-grid-row">
          <div className="budget-grid-cell">
            <label>Accommodation</label>
            <select 
              name="accommodation"
              value={formData.accommodation}
              onChange={handleInputChange}
              required
              className="budget-select"
            >
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
            {statePricing && (
              <div className="option-description">
                {statePricing.accommodation[formData.accommodation]?.description}
              </div>
            )}
          </div>
          
          <div className="budget-grid-cell">
            <label>Transportation</label>
            <select 
              name="transportation"
              value={formData.transportation}
              onChange={handleInputChange}
              required
              className="budget-select"
            >
              <option value="flight">Flight</option>
              <option value="train">Train</option>
              <option value="bus">Bus</option>
              <option value="car">Car</option>
            </select>
            {statePricing && (
              <div className="option-description">
                {statePricing.transportation[formData.transportation]?.description}
              </div>
            )}
          </div>
          
          <div className="budget-grid-cell">
            <label>Food</label>
            <select 
              name="food" 
              value={formData.food} 
              onChange={handleInputChange}
              required
              className="budget-select"
            >
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="premium">Premium</option>
            </select>
            {statePricing && (
              <div className="option-description">
                {statePricing.food[formData.food]?.description}
              </div>
            )}
          </div>
        </div>

        <div className="budget-result-section">
          <div className="budget-amount-container">
            <span className="budget-label">Estimated Budget:</span>
            {isLoading ? (
              <span className="budget-amount">Loading...</span>
            ) : (
              <span className="budget-amount">₹{totalBudget.toLocaleString('en-IN')}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className="budget-submit-btn" 
            disabled={isLoading || totalBudget === 0}
          >
            Generate Detailed Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomePage;
