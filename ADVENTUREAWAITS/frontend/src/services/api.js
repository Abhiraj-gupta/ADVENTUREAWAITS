import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookie-based auth
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle authentication errors
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.get('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
};

// User preferences API endpoints
export const preferencesAPI = {
  getNotificationSettings: () => api.get('/preferences/notifications'),
  updateNotificationSettings: (settings) => api.put('/preferences/notifications', settings),
  getSecuritySettings: () => api.get('/preferences/security'),
  updateSecuritySettings: (settings) => api.put('/preferences/security', settings),
};

// Favorites API endpoints
export const favoritesAPI = {
  getFavorites: () => api.get('/favorites'),
  addToFavorites: (type, id) => api.post(`/favorites/${type}/${id}`),
  removeFromFavorites: (type, id) => api.delete(`/favorites/${type}/${id}`),
  isInFavorites: (type, id) => api.get(`/favorites/${type}/${id}`),
};

// Bookings API endpoints
export const bookingsAPI = {
  getAllBookings: () => api.get('/bookings'),
  getUpcomingBookings: () => api.get('/bookings/upcoming'),
  getPastBookings: () => api.get('/bookings/past'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  cancelBooking: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
};

// Saved Budget API endpoints
export const savedBudgetAPI = {
  getSavedBudgets: () => api.get('/saved-budgets'),
  getSavedBudget: (id) => api.get(`/saved-budgets/${id}`),
  createSavedBudget: (budgetData) => api.post('/saved-budgets', budgetData),
  updateSavedBudget: (id, budgetData) => api.put(`/saved-budgets/${id}`, budgetData),
  deleteSavedBudget: (id) => api.delete(`/saved-budgets/${id}`),
  getSavedBudgetSummary: () => api.get('/saved-budgets/summary'),
};

export default api; 