import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Adventure Awaits</h3>
          <p>Discover the beauty of incredible India with our curated travel experiences.</p>
          <div className="social-icons-container">
            <div className="social-icons-group">
              <p className="developer-name">Abhiraj Gupta</p>
              <div className="social-icons">
                <a href="#" className="social-icon"><i className="fab fa-x"></i></a>
                <a href="https://www.instagram.com/abhiraj_gupta1/" className="social-icon"><i className="fab fa-instagram"></i></a>
                <a href="https://www.linkedin.com/in/abhiraj-gupta-1b33a528a/" className="social-icon"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
            <div className="social-icons-group">
              <p className="developer-name">Aditya Sirohi</p>
              <div className="social-icons">

                <a href="https://x.com/AdityaS99083206" className="social-icon"><i className="fab fa-x"></i></a>
                <a href="https://www.instagram.com/aditya_aadi_1601/" className="social-icon"><i className="fab fa-instagram"></i></a>
                <a href="https://www.linkedin.com/in/aditya-sirohi-304583281/" className="social-icon"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explore-states">Explore States</Link></li>
            <li><Link to="/profile">My Profile</Link></li>
            <li><Link to="/bookings">My Bookings</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Top Destinations</h3>
          <ul className="footer-links">
            <li><Link to="/state/uttarPradesh">Uttar Pradesh</Link></li>
            <li><Link to="/state/kerala">Kerala</Link></li>
            <li><Link to="/state/gujarat">Gujarat</Link></li>
            <li><Link to="/state/himachalPradesh">Himachal Pradesh</Link></li>
            <li><Link to="/state/odisha">Odisha</Link></li>
            <li><Link to="/state/jammuKashmir">Jammu & Kashmir</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Customer Support</h3>
          <div className="support-details">
            <div className="support-item">
              <i className="fas fa-map-marker-alt"></i>
              <p>Bennett University, Greater Noida</p>
            </div>
            <div className="support-item">
              <i className="fas fa-phone-alt"></i>
              <p><a href="tel:+919140470230">+91 9140470230</a></p>
            </div>
            <div className="support-item">
              <i className="fas fa-envelope"></i>
              <p><a href="mailto:dwexabhiraj01@gmail.com">dwexabhiraj01@gmail.com</a></p>
            </div>
            <div className="support-hours">
              <p>Hours: 9:00 AM - 6:00 PM (Mon-Sat)</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Adventure Awaits. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
