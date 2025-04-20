const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth.routes');
const bookingRoutes = require('./booking.routes');
const budgetRoutes = require('./budget.routes');
const favoritesRoutes = require('./favorites.routes');

// Mount routers
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/bookings', bookingRoutes);
router.use('/api/v1/budgets', budgetRoutes);
router.use('/api/v1/favorites', favoritesRoutes);

module.exports = router; 