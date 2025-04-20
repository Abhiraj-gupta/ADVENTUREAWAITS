import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  // Flag to determine if we should use mock auth
  const useMockAuth = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  // Load user data from localStorage when component mounts
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    const storedBookings = localStorage.getItem('bookings');
    
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    if (storedBookings) setBookings(JSON.parse(storedBookings));
    
    let unsubscribe = () => {};
    
    // If we're using real Firebase auth
    if (!useMockAuth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        // Create a custom user object with additional fields
        if (user) {
          const customUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Guest User',
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Guest')}&background=random`,
            createdAt: user.metadata?.creationTime || new Date().toISOString()
          };
          setUser(customUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    } else {
      // Check if user data exists in localStorage for mock auth
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }

    return unsubscribe;
  }, [useMockAuth]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  const signUpWithEmail = async (email, password, name) => {
    try {
      if (useMockAuth) {
        // Mock signup for development
        const mockUser = {
          uid: 'mock-uid-' + Math.random().toString(36).substring(2, 9),
          email: email,
          displayName: name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      } else {
        // Real Firebase signup
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with display name
        await updateProfile(result.user, {
          displayName: name
        });
        
        // Create a custom user object
        const customUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          createdAt: result.user.metadata.creationTime
        };
        
        setUser(customUser);
        return customUser;
      }
    } catch (error) {
      console.error('Error signing up with email:', error.code, error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      if (useMockAuth) {
        // Mock sign in for development
        // For demo purposes, any email/password combination works
        const mockUser = {
          uid: 'mock-uid-' + Math.random().toString(36).substring(2, 9),
          email: email,
          displayName: email.split('@')[0],
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      } else {
        // Real Firebase sign in
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Error signing in with email:', error.code, error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (useMockAuth) {
        // Mock Google sign in
        const mockUser = {
          uid: 'mock-google-uid-' + Math.random().toString(36).substring(2, 9),
          email: 'mockgoogle@example.com',
          displayName: 'Google User',
          photoURL: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff',
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      } else {
        // Real Google sign in
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error.code, error.message);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      if (useMockAuth) {
        // Mock GitHub sign in
        const mockUser = {
          uid: 'mock-github-uid-' + Math.random().toString(36).substring(2, 9),
          email: 'mockgithub@example.com',
          displayName: 'GitHub User',
          photoURL: 'https://ui-avatars.com/api/?name=GitHub+User&background=24292e&color=fff',
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      } else {
        // Real GitHub sign in
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error('Error signing in with GitHub:', error.code, error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (useMockAuth) {
        // Mock logout
        localStorage.removeItem('mockUser');
        setUser(null);
      } else {
        // Real logout
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Add a destination to favorites
  const addToFavorites = (item) => {
    if (!user) return false;
    
    // Check if already in favorites
    const exists = favorites.some(fav => 
      fav.id === item.id && fav.type === item.type
    );
    
    if (!exists) {
      const newFavorites = [...favorites, { ...item, addedAt: new Date().toISOString() }];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites)); // Ensure immediate save
      return true;
    }
    return false;
  };

  // Remove a destination from favorites
  const removeFromFavorites = (item) => {
    if (!user) return false;
    
    const newFavorites = favorites.filter(
      fav => !(fav.id === item.id && fav.type === item.type)
    );
    
    if (newFavorites.length !== favorites.length) {
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites)); // Ensure immediate save
      return true;
    }
    return false;
  };

  // Check if an item is in favorites
  const isInFavorites = (itemId, type) => {
    return favorites.some(item => item.id === itemId && item.type === type);
  };
  
  // Add a booking
  const addBooking = (booking) => {
    if (!user) return;
    
    const newBooking = {
      ...booking, 
      id: `booking-${Date.now()}`,
      bookedAt: new Date().toISOString(),
      status: 'confirmed'
    };
    
    setBookings([...bookings, newBooking]);
    return newBooking.id;
  };
  
  // Cancel a booking
  const cancelBooking = (bookingId) => {
    if (!user) return;
    
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    
    if (updatedBookings.length !== bookings.length) {
      setBookings(updatedBookings);
      return true;
    }
    return false;
  };

  const value = {
    user,
    loading,
    favorites,
    bookings,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithGithub,
    logout,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    addBooking,
    cancelBooking
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 