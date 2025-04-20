import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { states } from '../data/states';
import '../styles/ExploreStates.css';
import Footer from '../components/Footer';
import ImageWithFallback from '../components/ImageWithFallback';

const ExploreStates = () => {
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [filteredStates, setFilteredStates] = useState(states);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle search input changes
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Update URL with search query
    if (query.trim() !== '') {
      navigate(`/explore-states?search=${encodeURIComponent(query)}`, { replace: true });
    } else {
      navigate('/explore-states', { replace: true });
    }
  };

  // Filter states based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStates(states);
    } else {
      // Try to find an exact match first (case insensitive)
      const exactMatch = states.find(
        state => state.name.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (exactMatch) {
        // Navigate to the exact match immediately
        navigate(`/state/${exactMatch.id}`);
        return;
      }
      
      // Try partial matches in name
      const nameMatches = states.filter(state => 
        state.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (nameMatches.length === 1) {
        // If only one name match, navigate directly
        navigate(`/state/${nameMatches[0].id}`);
        return;
      }
      
      // Otherwise just show the filtered results
      setFilteredStates(nameMatches.length > 0 ? nameMatches : states.filter(
        state => state.description.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  }, [searchQuery, navigate]);

  // Initialize search query from URL
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  return (
    <div className="app-container">
      <div id="star-background" className="star-background"></div>
      <Header />
      
      <main className="main-content explore-states-page">
        <div className="explore-container">
          <div className="explore-header">
            <h1 className="explore-title">Explore Indian States</h1>
            <p className="explore-subtitle">Discover the diverse beauty and rich heritage of India's magnificent states</p>
            
            <div className="states-search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search for a state..."
                value={searchQuery}
                onChange={handleSearch}
                autoFocus={urlSearchQuery !== ''}
              />
            </div>
          </div>
          
          {filteredStates.length === 0 ? (
            <div className="no-states-found">
              <i className="fas fa-map-marked-alt"></i>
              <h2>No states found</h2>
              <p>We couldn't find any states matching your search criteria.</p>
              <button className="reset-search" onClick={() => {
                setSearchQuery('');
                navigate('/explore-states', { replace: true });
              }}>
                Clear search
              </button>
            </div>
          ) : (
            <div className="states-grid">
              {filteredStates.map((state) => (
                <Link 
                  to={`/state/${state.id}`} 
                  key={state.id}
                  className="state-card"
                >
                  <div className="state-image">
                    <ImageWithFallback
                      src={state.image} 
                      alt={state.name}
                      className="state-img" 
                    />
                    <div className="state-overlay"></div>
                  </div>
                  <div className="state-info">
                    <h2 className="state-name">{state.name}</h2>
                    <p className="state-description">{state.description}</p>
                    <button className="state-explore-btn">
                      <span>Explore</span>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExploreStates; 