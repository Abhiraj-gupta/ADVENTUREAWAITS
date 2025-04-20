const Booking = require('../models/booking.model');
const Hotel = require('../models/hotel.model');
const Restaurant = require('../models/restaurant.model'); 
const Attraction = require('../models/attraction.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  // Add user ID to request body
  req.body.user = req.user.id;
  
  // Validate booking type and related data
  const { type } = req.body;
  
  let itemModel, itemId;
  
  if (type === 'hotel') {
    itemModel = Hotel;
    itemId = req.body.hotel;
  } else if (type === 'restaurant') {
    itemModel = Restaurant;
    itemId = req.body.restaurant;
  } else if (type === 'attraction') {
    itemModel = Attraction;
    itemId = req.body.attraction;
  } else {
    return next(new ErrorResponse('Invalid booking type', 400));
  }
  
  // Check if the item (hotel, restaurant, attraction) exists
  const item = await itemModel.findById(itemId);
  
  if (!item) {
    return next(new ErrorResponse(`No ${type} found with id ${itemId}`, 404));
  }
  
  // Create booking
  const booking = await Booking.create(req.body);
  
  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res, next) => {
  // Only return bookings for the logged-in user unless user is admin
  let query;
  
  if (req.user.role === 'admin') {
    query = Booking.find();
  } else {
    query = Booking.find({ user: req.user.id });
  }
  
  // Add population based on booking type
  query = query
    .populate({
      path: 'hotel',
      select: 'name address rating starRating featuredImage'
    })
    .populate({
      path: 'restaurant',
      select: 'name address rating cuisine featuredImage'
    })
    .populate({
      path: 'attraction',
      select: 'name address rating category featuredImage'
    });
  
  const bookings = await query;
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get upcoming bookings
// @route   GET /api/bookings/upcoming
// @access  Private
exports.getUpcomingBookings = asyncHandler(async (req, res, next) => {
  const currentDate = new Date();
  
  // Find bookings where dates are in the future and status is confirmed
  const query = {
    user: req.user.id,
    status: 'confirmed',
    $or: [
      { checkInDate: { $gte: currentDate } },
      { reservationDate: { $gte: currentDate } },
      { visitDate: { $gte: currentDate } }
    ]
  };
  
  const bookings = await Booking.find(query)
    .populate({
      path: 'hotel',
      select: 'name address rating starRating featuredImage'
    })
    .populate({
      path: 'restaurant',
      select: 'name address rating cuisine featuredImage'
    })
    .populate({
      path: 'attraction',
      select: 'name address rating category featuredImage'
    });
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get past bookings
// @route   GET /api/bookings/past
// @access  Private
exports.getPastBookings = asyncHandler(async (req, res, next) => {
  const currentDate = new Date();
  
  // Find bookings where dates are in the past or status is completed/cancelled
  const query = {
    user: req.user.id,
    $or: [
      { status: { $in: ['completed', 'cancelled'] } },
      { 
        $and: [
          { status: 'confirmed' },
          { 
            $or: [
              { checkOutDate: { $lt: currentDate } },
              { reservationDate: { $lt: currentDate } },
              { visitDate: { $lt: currentDate } }
            ] 
          }
        ]
      }
    ]
  };
  
  const bookings = await Booking.find(query)
    .populate({
      path: 'hotel',
      select: 'name address rating starRating featuredImage'
    })
    .populate({
      path: 'restaurant',
      select: 'name address rating cuisine featuredImage'
    })
    .populate({
      path: 'attraction',
      select: 'name address rating category featuredImage'
    });
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: 'hotel',
      select: 'name address rating starRating images roomTypes policies'
    })
    .populate({
      path: 'restaurant',
      select: 'name address rating cuisine images operatingHours'
    })
    .populate({
      path: 'attraction',
      select: 'name address rating category images ticketPrice operatingHours'
    });
  
  if (!booking) {
    return next(new ErrorResponse(`No booking found with id ${req.params.id}`, 404));
  }
  
  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this booking', 401));
  }
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return next(new ErrorResponse(`No booking found with id ${req.params.id}`, 404));
  }
  
  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this booking', 401));
  }
  
  // Check if booking is already cancelled or completed
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return next(new ErrorResponse('Cannot update a booking that is cancelled or completed', 400));
  }
  
  // Update booking
  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  let booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return next(new ErrorResponse(`No booking found with id ${req.params.id}`, 404));
  }
  
  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to cancel this booking', 401));
  }
  
  // Check if booking is already cancelled or completed
  if (booking.status === 'cancelled') {
    return next(new ErrorResponse('Booking is already cancelled', 400));
  }
  
  if (booking.status === 'completed') {
    return next(new ErrorResponse('Cannot cancel a completed booking', 400));
  }
  
  // Calculate cancellation fee and refund amount based on booking type and policies
  let refundAmount = 0;
  const totalPrice = booking.totalPrice;
  
  // Calculate days until booking
  let daysUntilBooking;
  
  if (booking.type === 'hotel' && booking.checkInDate) {
    daysUntilBooking = Math.floor((booking.checkInDate - new Date()) / (1000 * 60 * 60 * 24));
  } else if (booking.type === 'restaurant' && booking.reservationDate) {
    daysUntilBooking = Math.floor((booking.reservationDate - new Date()) / (1000 * 60 * 60 * 24));
  } else if (booking.type === 'attraction' && booking.visitDate) {
    daysUntilBooking = Math.floor((booking.visitDate - new Date()) / (1000 * 60 * 60 * 24));
  } else {
    daysUntilBooking = 0;
  }
  
  // Set refund amount based on days until booking
  if (daysUntilBooking > 7) {
    // Full refund if cancellation is more than 7 days in advance
    refundAmount = totalPrice;
  } else if (daysUntilBooking > 3) {
    // 75% refund if cancellation is 4-7 days in advance
    refundAmount = totalPrice * 0.75;
  } else if (daysUntilBooking > 1) {
    // 50% refund if cancellation is 2-3 days in advance
    refundAmount = totalPrice * 0.5;
  } else {
    // 25% refund if cancellation is 0-1 days in advance
    refundAmount = totalPrice * 0.25;
  }
  
  // Update booking
  booking.status = 'cancelled';
  booking.cancellationReason = reason || 'No reason provided';
  booking.cancellationDate = new Date();
  booking.refundAmount = refundAmount;
  
  await booking.save();
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return next(new ErrorResponse(`No booking found with id ${req.params.id}`, 404));
  }
  
  // Make sure user is admin (only admins can permanently delete bookings)
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete bookings', 401));
  }
  
  await booking.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}); 