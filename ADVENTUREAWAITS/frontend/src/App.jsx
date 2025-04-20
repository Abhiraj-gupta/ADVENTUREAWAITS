import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingPage from './components/LoadingPage';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import StateDetails from './pages/StateDetails';
import HotelDetails from './pages/HotelDetails';
import RestaurantDetails from './pages/RestaurantDetails';
import AttractionDetails from './pages/AttractionDetails';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import Favorites from './pages/Favorites';
import BudgetTracker from './pages/BudgetTracker';
import Login from './pages/Login';
import ExploreStates from './pages/ExploreStates';
import BudgetResults from './pages/BudgetResults';
import HotelBooking from './pages/HotelBooking';
import RestaurantBooking from './pages/RestaurantBooking';
import AttractionBooking from './pages/AttractionBooking';
import SavedBudgets from './pages/SavedBudgets';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import './styles/theme.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-container">
          <div id="star-background" className="star-background"></div>
          <ScrollToTop />
          <Header />
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/state/:stateId" element={<StateDetails />} />
              <Route path="/state/:stateId/hotel/:hotelId" element={<HotelDetails />} />
              <Route path="/state/:stateId/restaurant/:restaurantId" element={<RestaurantDetails />} />
              <Route path="/state/:stateId/attraction/:attractionId" element={<AttractionDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/budget-tracker" element={<BudgetTracker />} />
              <Route path="/saved-budgets" element={<SavedBudgets />} />
              <Route path="/login" element={<Login />} />
              <Route path="/explore-states" element={<ExploreStates />} />
              <Route path="/budget-results" element={<BudgetResults />} />
              <Route path="/hotel-booking/:hotelId" element={<HotelBooking />} />
              <Route path="/restaurant-booking/:restaurantId" element={<RestaurantBooking />} />
              <Route path="/attraction-booking/:attractionId" element={<AttractionBooking />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
