import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
  try {
    const storedUser = localStorage.getItem('user');

    // Parse only if storedUser is actually valid JSON
    if (storedUser && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser));
    }
  } catch (err) {
    console.error('Failed to parse stored user:', err);
    localStorage.removeItem('user'); // clear invalid value
  }

  setLoading(false);
}, []);

  // Save favorites/bookings to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  // ✅ REGISTER (MongoDB backend)
  const signUpWithEmail = async (email, password, name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) throw new Error(data.message || 'Registration failed');

      const userWithToken = {
        ...data.user,
        token: data.token
      };

      localStorage.setItem('user', JSON.stringify(userWithToken));
      setUser(userWithToken);

      return data.user;
    } catch (err) {
      console.error('Signup failed:', err.message);
      throw err;
    }
  };

  // ✅ LOGIN (MongoDB backend)
  const signInWithEmail = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) throw new Error(data.message || 'Login failed');

      const userWithToken = {
        ...data.user,
        token: data.token
      };

      localStorage.setItem('user', JSON.stringify(userWithToken));
      setUser(userWithToken);


      return data.user;
    } catch (err) {
      console.error('Login failed:', err.message);
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const addToFavorites = (item) => {
    if (!user) return false;

    const exists = favorites.some(fav => fav.id === item.id && fav.type === item.type);
    if (!exists) {
      const newFavorites = [...favorites, { ...item, addedAt: new Date().toISOString() }];
      setFavorites(newFavorites);
      return true;
    }
    return false;
  };

  const removeFromFavorites = (itemId, type) => {
    if (!user) return false;
    const updated = favorites.filter(f => !(f.id === itemId && f.type === type));
    setFavorites(updated);
    return true;
  };

  const isInFavorites = (itemId, type) => {
    return favorites.some(item => item.id === itemId && item.type === type);
  };

  const addBooking = async (bookingData) => {
  if (!user || !user.token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`  // optional, if using JWT
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Failed to save booking');

    setBookings([...bookings, data.booking]); // update local state
    return data.booking._id;

  } catch (err) {
    console.error('Failed to save booking:', err);
    throw err;
  }
};


  const cancelBooking = (bookingId) => {
    const updated = bookings.filter(b => b.id !== bookingId);
    setBookings(updated);
    return true;
  };

  const value = {
    user,
    loading,
    favorites,
    bookings,
    signUpWithEmail,
    signInWithEmail,
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
