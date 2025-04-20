const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  cancelBooking,
  getUpcomingBookings,
  getPastBookings
} = require('../controllers/booking.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.route('/upcoming')
  .get(getUpcomingBookings);

router.route('/past')
  .get(getPastBookings);

router.route('/:id')
  .get(getBooking)
  .put(updateBooking)
  .delete(authorize('admin'), deleteBooking);

router.route('/:id/cancel')
  .put(cancelBooking);

module.exports = router; 