import React, { useState } from 'react';
import Modal from './Modal';
import '../styles/CustomerSupport.css';

const CustomerSupport = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    type: 'question'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, send data to backend
    console.log('Support request:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        message: '',
        type: 'question'
      });
    }, 3000);
  };

  return (
    <div className="customer-support">
      <button 
        className="support-button"
        onClick={() => setShowModal(true)}
      >
        <i className="fas fa-headset"></i>
        <span>Customer Support</span>
      </button>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="How Can We Help You?"
      >
        {submitted ? (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <h3>Thank you for reaching out!</h3>
            <p>We've received your message and will get back to you as soon as possible.</p>
          </div>
        ) : (
          <form className="support-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="type">How can we help?</label>
              <select 
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="question">I have a question</option>
                <option value="feedback">I want to provide feedback</option>
                <option value="issue">I'm experiencing an issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input 
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Your Message</label>
              <textarea 
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>
            
            <button type="submit" className="submit-button">
              <i className="fas fa-paper-plane"></i> Send Message
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CustomerSupport;
