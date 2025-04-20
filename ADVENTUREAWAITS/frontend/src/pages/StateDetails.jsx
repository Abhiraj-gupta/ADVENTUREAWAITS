import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CardList from '../components/CardList';
import PageTransition from '../components/PageTransition';
import { states, getStateData } from '../data';
import '../styles/StateDetails.css';
import ImageWithFallback from '../components/ImageWithFallback';
import '../styles/components/ImageWithFallback.css';

const StateDetails = () => {
  const { stateId } = useParams();
  const navigate = useNavigate();
  
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
  
  // Find the state data 
  const stateInfo = states.find(state => state.id === formattedStateId);
  const stateData = getStateData(formattedStateId);
  
  // Refs for scroll animations
  const hotelsRef = useRef(null);
  const restaurantsRef = useRef(null);
  const attractionsRef = useRef(null);
  
  // State to track which sections are visible
  const [visibleSections, setVisibleSections] = useState({
    hotels: false,
    restaurants: false,
    attractions: false
  });
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // If state not found, navigate back to home
    if (!stateInfo) {
      navigate('/');
    }
    // Handle hash navigation - add this part
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Delay to ensure content is loaded
    } 
    // Create stars effect
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
          
          if (sectionId === 'hotels-section') {
            setVisibleSections(prev => ({ ...prev, hotels: true }));
          } else if (sectionId === 'restaurants-section') {
            setVisibleSections(prev => ({ ...prev, restaurants: true }));
          } else if (sectionId === 'attractions-section') {
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

  // State highlights data - would be better to move this to the state data files
  const stateHighlights = {
    kerala: {
      title: "Kerala - God's Own Country",
      tagline: "Where nature and tradition blend in perfect harmony",
      description: "Kerala, known as God's Own Country, is famous for its emerald backwaters, lush hill stations, pristine beaches, and rich cultural heritage. The state offers a unique experience with its traditional Ayurvedic treatments, spice plantations, wildlife sanctuaries, and vibrant art forms.",
      keyAttractions: [
        "Alleppey Backwaters - Cruise through serene canals on traditional houseboats",
        "Munnar - Rolling hills covered with tea plantations and mist",
        "Kovalam - Crescent beaches with lighthouse views and Ayurvedic resorts",
        "Thekkady - Home to Periyar Wildlife Sanctuary and spice gardens",
        "Fort Kochi - Historical district with Chinese fishing nets and colonial architecture"
      ],
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/d/d9/Houseboats_Kerala.jpg",
        "https://spicetreemunnar.com/wp-content/uploads/2017/10/kerala-tourism-1024x576.jpg",
        "https://s7ap1.scene7.com/is/image/incredibleindia/1-jatayu-rock-kumarakom-kerala-2-city-hero?qlt=82&ts=1726672494503"
      ]
    },
    jammuKashmir: {
      title: "Jammu & Kashmir - Paradise on Earth",
      tagline: "Where heaven meets earth in breathtaking landscapes",
      description: "Jammu and Kashmir, often referred to as 'Paradise on Earth', is known for its stunning landscapes, from snow-capped mountains and pristine lakes to meadows carpeted with wildflowers. The region offers a blend of adventure, spirituality, and cultural experiences that captivate visitors.",
      keyAttractions: [
        "Dal Lake - Famous for its houseboats and floating gardens",
        "Gulmarg - Premier ski resort surrounded by snow-capped mountains",
        "Pahalgam - Valley of Shepherds with hiking trails and river fishing",
        "Sonamarg - Meadow of Gold with glaciers and mountain lakes",
        "Vaishno Devi Temple - One of the most revered pilgrimage sites"
      ],
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Srinagar_Dal_Lake_Photo.jpg/1280px-Srinagar_Dal_Lake_Photo.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Gulmarg_in_winter.jpg/1280px-Gulmarg_in_winter.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Pahalgam_Valley.jpg/1280px-Pahalgam_Valley.jpg"
      ]
    },
    himachalPradesh: {
      title: "Himachal Pradesh - Dev Bhoomi",
      tagline: "Where the mountains call and adventures await",
      description: "Himachal Pradesh, known as 'Dev Bhoomi' (Land of Gods), is celebrated for its majestic mountains, pristine valleys, ancient temples, and adventure opportunities. From peaceful hill stations to thrilling mountain sports, this Himalayan state offers diverse experiences year-round.",
      keyAttractions: [
        "Shimla - The former summer capital of British India with colonial charm",
        "Manali - Adventure hub with skiing, paragliding, and trekking",
        "Dharamshala - Home to the Dalai Lama and Tibetan culture",
        "Spiti Valley - Cold desert mountain valley with Buddhist monasteries",
        "Kullu - Valley of Gods known for Dussehra celebration and hot springs"
      ],
      images: [
        "https://www.authenticindiatours.com/app/uploads/2022/03/The-Queen-of-Hills-Shimla-Himachal-Pradesh-1400x550-c-default.jpg",
        "https://www.swantour.com/blogs/wp-content/uploads/2019/01/Himachal-Pradesh-in-Winters.jpg",
        "https://hblimg.mmtcdn.com/content/hubble/img/manali/mmt/destination/m_Landscape_l_400_640.jpg"
      ]
    },
    gujarat: {
      title: "Gujarat - Land of Legends",
      tagline: "Where traditions thrive and heritage shines",
      description: "Gujarat, the land of Mahatma Gandhi, is known for its vibrant culture, rich heritage, diverse geography, and entrepreneurial spirit. From the vast white expanse of Rann of Kutch to the ancient temples and wildlife sanctuaries, Gujarat offers a blend of spiritual, natural, and cultural experiences.",
      keyAttractions: [
        "Rann of Kutch - White salt desert known for Rann Utsav festival",
        "Somnath Temple - One of the 12 Jyotirlingas with stunning seaside location",
        "Gir National Park - Only home of Asiatic Lions in the world",
        "Sabarmati Ashram - Gandhi's residence during the freedom movement",
        "Dwarka - Ancient kingdom of Lord Krishna and important pilgrimage site"
      ],
      images: [
        "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=2000",
        "https://images.unsplash.com/photo-1599989848809-e211b9e1dd26?q=80&w=2000",
        "https://images.unsplash.com/photo-1590076215667-875d556ee102?q=80&w=2000"
      ]
    },
    uttarPradesh: {
      title: "Uttar Pradesh - The Heartland of India",
      tagline: "Where ancient history and spirituality converge",
      description: "Uttar Pradesh, India's most populous state, is the cradle of Indian civilization and spirituality. Home to the Taj Mahal, sacred rivers, ancient cities, and important pilgrimage sites for multiple religions, the state offers a journey through India's rich historical and cultural tapestry.",
      keyAttractions: [
        "Taj Mahal, Agra - UNESCO World Heritage site and symbol of eternal love",
        "Varanasi - One of world's oldest continuously inhabited cities with sacred ghats",
        "Ayodhya - Birthplace of Lord Rama and important pilgrimage site",
        "Prayagraj - Site of Kumbh Mela, the largest religious gathering on earth",
        "Mathura-Vrindavan - Associated with Lord Krishna's birth and childhood"
      ],
      images: [
        "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000",
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000",
        "https://images.unsplash.com/photo-1585136917228-75ee69313ed7?q=80&w=2000"
      ]
    },
    odisha: {
      title: "Odisha - India's Best Kept Secret",
      tagline: "Where temples, traditions, and natural beauty blend",
      description: "Odisha (formerly Orissa) is known for its ancient temples, pristine beaches, tribal heritage, and classical dance forms. Home to the UNESCO World Heritage Konark Sun Temple and the famous Jagannath Temple in Puri, the state offers a perfect blend of spirituality, art, and natural beauty.",
      keyAttractions: [
        "Konark Sun Temple - UNESCO site with stunning chariot-shaped architecture",
        "Jagannath Temple, Puri - One of the Char Dham pilgrimage sites",
        "Chilika Lake - Asia's largest brackish water lagoon with diverse bird life",
        "Lingaraja Temple - Ancient temple showcasing Kalinga architecture",
        "Udayagiri and Khandagiri Caves - Rock-cut caves with intricate carvings"
      ],
      images: [
        "https://images.unsplash.com/photo-1581686571009-7a4e5c36e208?q=80&w=2000",
        "https://images.unsplash.com/photo-1623604877165-0b547b191e5e?q=80&w=2000",
        "https://images.unsplash.com/photo-1607087599097-f10099a338a6?q=80&w=2000"
      ]
    }
  };

  const highlights = stateHighlights[formattedStateId] || {
    title: stateInfo.name,
    tagline: "Explore the beauty and culture",
    description: stateInfo.description,
    keyAttractions: ["Famous attractions data not available"],
    images: []
  };

  return (
    <div className="app-container">
      <div id="star-background" className="star-background"></div>
      <Header />
      
      <PageTransition>
        <div className="state-details-page">
          <div className="state-banner">
            <h1>{highlights.title}</h1>
            <p className="state-tagline">{highlights.tagline}</p>
          </div>
          
          <div className="state-description-section">
            <p className="state-description">{highlights.description}</p>
          </div>
          
          {highlights.images && highlights.images.length > 0 ? (
            <div className="state-gallery">
              {highlights.images.map((image, index) => (
                <div key={index} className="gallery-item staggered-item visible">
                  <ImageWithFallback 
                    src={image} 
                    alt={`${stateInfo.name} - ${index + 1}`} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-images-message">
              <p>Explore {stateInfo.name}'s beautiful attractions, hotels, and restaurants below.</p>
            </div>
          )}
          
          <div className="key-attractions">
            <h2>Must-Visit Attractions</h2>
            <ul className="attractions-list">
              {highlights.keyAttractions.map((attraction, index) => (
                <li key={index} className="attraction-item staggered-item visible">
                  <i className="fas fa-landmark"></i>
                  <span>{attraction}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="scroll-sections">
            {/* Hotels Section */}
            <div 
              ref={hotelsRef} 
              id="hotels-section" 
              className={`scroll-section ${visibleSections.hotels ? 'animate-in' : ''}`}
            >
              <div className="scroll-section-header">
                <div className="section-icon hotel-icon">
                  <i className="fas fa-hotel"></i>
                </div>
                <div className="section-title">
                  <h2>Hotels & Accommodations</h2>
                  <p>Find comfortable stays for your journey in {stateInfo.name}</p>
                </div>
              </div>
              
              <CardList 
                items={stateData.hotels} 
                category="hotels"
                stateId={formattedStateId}
              />
            </div>
            
            {/* Restaurants Section */}
            <div 
              ref={restaurantsRef} 
              id="restaurants-section" 
              className={`scroll-section ${visibleSections.restaurants ? 'animate-in' : ''}`}
            >
              <div className="scroll-section-header">
                <div className="section-icon restaurant-icon">
                  <i className="fas fa-utensils"></i>
                </div>
                <div className="section-title">
                  <h2>Restaurants & Dining</h2>
                  <p>Discover delicious local cuisine and dining options</p>
                </div>
              </div>
              
              <CardList 
                items={stateData.restaurants} 
                category="restaurants"
                stateId={formattedStateId}
              />
            </div>
            
            {/* Attractions Section */}
            <div 
              ref={attractionsRef} 
              id="attractions-section" 
              className={`scroll-section ${visibleSections.attractions ? 'animate-in' : ''}`}
            >
              <div className="scroll-section-header">
                <div className="section-icon attraction-icon">
                  <i className="fas fa-mountain"></i>
                </div>
                <div className="section-title">
                  <h2>Tourist Attractions</h2>
                  <p>Explore the must-visit sights and experiences</p>
                </div>
              </div>
              
              <CardList 
                items={stateData.attractions} 
                category="attractions"
                stateId={formattedStateId}
              />
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default StateDetails; 