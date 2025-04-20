const Restaurant = require('../models/restaurant.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res, next) => {
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
  let query = Restaurant.find(JSON.parse(queryStr));

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
  const total = await Restaurant.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const restaurants = await query;

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
    count: restaurants.length,
    pagination,
    data: restaurants
  });
});

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(
      new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: restaurant
  });
});

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);

  res.status(201).json({
    success: true,
    data: restaurant
  });
});

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = asyncHandler(async (req, res, next) => {
  let restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(
      new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
    );
  }

  restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: restaurant
  });
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(
      new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
    );
  }

  await restaurant.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search restaurants
// @route   GET /api/restaurants/search
// @access  Public
exports.searchRestaurants = asyncHandler(async (req, res, next) => {
  const { city, state, cuisine, priceRange, vegetarian, vegan, date, time, partySize } = req.query;

  // Build search query
  const searchQuery = {};

  // Location filter (city or state)
  if (city) {
    searchQuery['address.city'] = { $regex: city, $options: 'i' };
  }

  if (state) {
    searchQuery['address.state'] = { $regex: state, $options: 'i' };
  }

  // Cuisine filter
  if (cuisine) {
    const cuisineList = cuisine.split(',');
    searchQuery.cuisine = { $in: cuisineList };
  }

  // Price range filter
  if (priceRange) {
    searchQuery.priceRange = priceRange;
  }

  // Dietary preferences filter
  if (vegetarian === 'true') {
    searchQuery['dietaryOptions.vegetarian'] = true;
  }

  if (vegan === 'true') {
    searchQuery['dietaryOptions.vegan'] = true;
  }

  // Find restaurants that match the search criteria
  const restaurants = await Restaurant.find(searchQuery)
    .select('name address featuredImage rating cuisine priceRange estimatedCostForTwo');

  // Filter results for availability if date/time/partySize provided
  // Note: In a real application, you'd need to check availability against existing bookings
  
  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants
  });
});

// @desc    Get top rated restaurants
// @route   GET /api/restaurants/top-rated
// @access  Public
exports.getTopRatedRestaurants = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  
  const restaurants = await Restaurant.find({ rating: { $gte: 4 } })
    .sort({ rating: -1 })
    .limit(limit)
    .select('name address featuredImage rating cuisine priceRange');
  
  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants
  });
});

// @desc    Get restaurants by state
// @route   GET /api/restaurants/by-state/:state
// @access  Public
exports.getRestaurantsByState = asyncHandler(async (req, res, next) => {
  const { state } = req.params;
  
  const restaurants = await Restaurant.find({ 'address.state': state })
    .select('name address featuredImage rating cuisine priceRange');
  
  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants
  });
});

// @desc    Get restaurants by cuisine
// @route   GET /api/restaurants/by-cuisine/:cuisine
// @access  Public
exports.getRestaurantsByCuisine = asyncHandler(async (req, res, next) => {
  const { cuisine } = req.params;
  
  const restaurants = await Restaurant.find({ cuisine: cuisine })
    .select('name address featuredImage rating cuisine priceRange');
  
  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants
  });
}); 