import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../styles/Login.css';

const Login = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub } = useAuth();
  const [authType, setAuthType] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authType === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        // Register with email and password
        await signUpWithEmail(email, password, name);
        setSuccess(true);
        // Set flag for welcome message
        sessionStorage.setItem('newLogin', 'true');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        // Sign in with email and password
        await signInWithEmail(email, password);
        setSuccess(true);
        // Set flag for welcome message
        sessionStorage.setItem('newLogin', 'true');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccess(true);
      // Set flag for welcome message
      sessionStorage.setItem('newLogin', 'true');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGithub();
      setSuccess(true);
      // Set flag for welcome message
      sessionStorage.setItem('newLogin', 'true');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Parse Firebase auth error messages
  const getAuthErrorMessage = (errorCode) => {
    console.log("Firebase error code:", errorCode);
    
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/email-already-in-use':
        return 'Email already in use';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completing authentication';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not allowed. Please contact support.';
      case 'auth/internal-error':
        return 'An internal authentication error occurred. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/auth/invalid-api-key':
      case 'auth/invalid-api-key':
        return 'Authentication configuration error. Please contact support.';
      case 'auth/app-deleted':
      case 'auth/app-not-authorized':
      case 'auth/argument-error':
      case 'auth/invalid-credential':
      case 'auth/invalid-continue-uri':
      case 'auth/invalid-tenant-id': 
        return 'Authentication configuration error. Please contact support.';
      default:
        return `Authentication error (${errorCode || 'unknown'}). Please try again or contact support.`;
    }
  };

  return (
    <div className="app-container">
      <div id="star-background" className="star-background"></div>
      <Header />
      
      <main className="main-content login-page">
        <div className="login-container">
          <div className="login-tabs">
            <button 
              className={`tab-btn ${authType === 'signin' ? 'active' : ''}`}
              onClick={() => setAuthType('signin')}
            >
              Sign In
            </button>
            <button 
              className={`tab-btn ${authType === 'signup' ? 'active' : ''}`}
              onClick={() => setAuthType('signup')}
            >
              Sign Up
            </button>
          </div>
          
          <div className="auth-form-container">
            <h1 className="auth-title">{authType === 'signin' ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="auth-subtitle">
              {authType === 'signin' 
                ? 'Sign in to access your account and continue your journey' 
                : 'Join us to start planning your next adventure'}
            </p>
            
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">Authentication successful! Redirecting...</div>}
            
            <form className="auth-form" onSubmit={handleSubmit}>
              {authType === 'signup' && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-with-icon">
                    <i className="fas fa-user"></i>
                    <input 
                      type="text" 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading || success}
                      required 
                    />
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || success}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <i className="fas fa-lock"></i>
                  <input 
                    type="password" 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || success}
                    required 
                  />
                </div>
              </div>
              
              {authType === 'signup' && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <i className="fas fa-lock"></i>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading || success}
                      required 
                    />
                  </div>
                </div>
              )}
              
              {authType === 'signin' && (
                <div className="forgot-password">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>
              )}
              
              <button 
                type="submit" 
                className="auth-submit-btn" 
                disabled={loading || success}
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : success ? (
                  <i className="fas fa-check"></i>
                ) : (
                  authType === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
            
            <div className="auth-divider">
              <span>or continue with</span>
            </div>
            
            <div className="social-auth-buttons">
              <button 
                className="social-auth-btn google-btn" 
                onClick={handleGoogleSignIn}
                disabled={loading || success}
              >
                <i className="fab fa-google"></i>
                <span>Google</span>
              </button>
              
              <button 
                className="social-auth-btn github-btn" 
                onClick={handleGithubSignIn}
                disabled={loading || success}
              >
                <i className="fab fa-github"></i>
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login; 