import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthForm.css';

const AuthForm = ({ type, onSuccess, switchForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, login } = useAuth();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (type === 'signup') {
        if (!formData.name.trim()) {
          throw new Error('Name is required');
        }
        await signup(formData.email, formData.password, formData.name);
      } else {
        await login(formData.email, formData.password);
      }
      
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-form-container">
      {error && (
        <div className="auth-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        {type === 'signup' && (
          <div className="form-group">
            <label htmlFor="name">
              <i className="fas fa-user"></i>
              <span>Full Name</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">
            <i className="fas fa-envelope"></i>
            <span>Email Address</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">
            <i className="fas fa-lock"></i>
            <span>Password</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            minLength="6"
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-submit-button"
          disabled={loading}
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <>
              {type === 'signup' ? (
                <><i className="fas fa-user-plus"></i> Sign Up</>
              ) : (
                <><i className="fas fa-sign-in-alt"></i> Sign In</>
              )}
            </>
          )}
        </button>
      </form>
      
      <div className="form-switch">
        {type === 'signin' ? (
          <p>
            Don't have an account? 
            <button type="button" onClick={switchForm}>Sign Up</button>
          </p>
        ) : (
          <p>
            Already have an account? 
            <button type="button" onClick={switchForm}>Sign In</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
