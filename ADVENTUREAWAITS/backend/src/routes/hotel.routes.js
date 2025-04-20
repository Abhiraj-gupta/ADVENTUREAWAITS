const express = require('express');
const {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  searchHotels,
  getTopRatedHotels,
  getHotelsByState
} = require('../controllers/hotel.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Special routes
router.get('/search', searchHotels);
router.get('/top-rated', getTopRatedHotels);
router.get('/by-state/:state', getHotelsByState);

// Standard CRUD routes
router
  .route('/')
  .get(getHotels)
  .post(protect, authorize('admin'), createHotel);

router
  .route('/:id')
  .get(getHotel)
  .put(protect, authorize('admin'), updateHotel)
  .delete(protect, authorize('admin'), deleteHotel);

module.exports = router; 