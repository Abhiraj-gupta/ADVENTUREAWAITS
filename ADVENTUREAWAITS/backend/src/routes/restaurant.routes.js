const express = require('express');
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurants,
  getTopRatedRestaurants,
  getRestaurantsByState,
  getRestaurantsByCuisine
} = require('../controllers/restaurant.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Special routes
router.get('/search', searchRestaurants);
router.get('/top-rated', getTopRatedRestaurants);
router.get('/by-state/:state', getRestaurantsByState);
router.get('/by-cuisine/:cuisine', getRestaurantsByCuisine);

// Standard CRUD routes
router
  .route('/')
  .get(getRestaurants)
  .post(protect, authorize('admin'), createRestaurant);

router
  .route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('admin'), updateRestaurant)
  .delete(protect, authorize('admin'), deleteRestaurant);

module.exports = router; 