const express = require('express');
const {
  createBooking,
  getBookings,
  getUpcomingBookings,
  getPastBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  deleteBooking
} = require('../controllers/booking.controller');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Booking routes
router.route('/')
  .get(getBookings)
  .post(createBooking);

router.get('/upcoming', getUpcomingBookings);
router.get('/past', getPastBookings);

router.route('/:id')
  .get(getBooking)
  .put(updateBooking)
  .delete(deleteBooking);

router.put('/:id/cancel', cancelBooking);

module.exports = router; 