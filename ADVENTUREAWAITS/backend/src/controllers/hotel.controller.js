const Hotel = require('../models/hotel.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getHotels = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Hotel.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Hotel.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const hotels = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: hotels.length,
    pagination,
    data: hotels
  });
});

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return next(
      new ErrorResponse(`Hotel not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: hotel
  });
});

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private/Admin
exports.createHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.create(req.body);

  res.status(201).json({
    success: true,
    data: hotel
  });
});

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private/Admin
exports.updateHotel = asyncHandler(async (req, res, next) => {
  let hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return next(
      new ErrorResponse(`Hotel not found with id of ${req.params.id}`, 404)
    );
  }

  hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: hotel
  });
});

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
exports.deleteHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return next(
      new ErrorResponse(`Hotel not found with id of ${req.params.id}`, 404)
    );
  }

  await hotel.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search hotels
// @route   GET /api/hotels/search
// @access  Public
exports.searchHotels = asyncHandler(async (req, res, next) => {
  const { city, state, checkIn, checkOut, guests, rooms, priceRange, starRating, amenities } = req.query;

  // Build search query
  const searchQuery = {};

  // Location filter (city or state)
  if (city) {
    searchQuery['address.city'] = { $regex: city, $options: 'i' };
  }

  if (state) {
    searchQuery['address.state'] = { $regex: state, $options: 'i' };
  }

  // Price range filter
  if (priceRange) {
    searchQuery.priceRange = priceRange;
  }

  // Star rating filter
  if (starRating) {
    searchQuery.starRating = parseInt(starRating);
  }

  // Amenities filter
  if (amenities) {
    const amenitiesList = amenities.split(',');
    searchQuery['amenities.general'] = { $in: amenitiesList };
  }

  // Find hotels that match the search criteria
  const hotels = await Hotel.find(searchQuery)
    .select('name address featuredImage rating starRating priceRange roomTypes');

  // Filter results for room availability if check-in/check-out dates provided
  // Note: In a real application, you'd need to check room availability against existing bookings
  
  res.status(200).json({
    success: true,
    count: hotels.length,
    data: hotels
  });
});

// @desc    Get top rated hotels
// @route   GET /api/hotels/top-rated
// @access  Public
exports.getTopRatedHotels = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  
  const hotels = await Hotel.find({ rating: { $gte: 4 } })
    .sort({ rating: -1 })
    .limit(limit)
    .select('name address featuredImage rating starRating');
  
  res.status(200).json({
    success: true,
    count: hotels.length,
    data: hotels
  });
});

// @desc    Get hotels by state
// @route   GET /api/hotels/by-state/:state
// @access  Public
exports.getHotelsByState = asyncHandler(async (req, res, next) => {
  const { state } = req.params;
  
  const hotels = await Hotel.find({ 'address.state': state })
    .select('name address featuredImage rating starRating');
  
  res.status(200).json({
    success: true,
    count: hotels.length,
    data: hotels
  });
}); 