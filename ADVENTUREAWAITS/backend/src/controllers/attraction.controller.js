const Attraction = require('../models/attraction.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all attractions
// @route   GET /api/attractions
// @access  Public
exports.getAttractions = asyncHandler(async (req, res, next) => {
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
  let query = Attraction.find(JSON.parse(queryStr));

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
  const total = await Attraction.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const attractions = await query;

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
    count: attractions.length,
    pagination,
    data: attractions
  });
});

// @desc    Get single attraction
// @route   GET /api/attractions/:id
// @access  Public
exports.getAttraction = asyncHandler(async (req, res, next) => {
  const attraction = await Attraction.findById(req.params.id);

  if (!attraction) {
    return next(
      new ErrorResponse(`Attraction not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: attraction
  });
});

// @desc    Create new attraction
// @route   POST /api/attractions
// @access  Private/Admin
exports.createAttraction = asyncHandler(async (req, res, next) => {
  const attraction = await Attraction.create(req.body);

  res.status(201).json({
    success: true,
    data: attraction
  });
});

// @desc    Update attraction
// @route   PUT /api/attractions/:id
// @access  Private/Admin
exports.updateAttraction = asyncHandler(async (req, res, next) => {
  let attraction = await Attraction.findById(req.params.id);

  if (!attraction) {
    return next(
      new ErrorResponse(`Attraction not found with id of ${req.params.id}`, 404)
    );
  }

  attraction = await Attraction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: attraction
  });
});

// @desc    Delete attraction
// @route   DELETE /api/attractions/:id
// @access  Private/Admin
exports.deleteAttraction = asyncHandler(async (req, res, next) => {
  const attraction = await Attraction.findById(req.params.id);

  if (!attraction) {
    return next(
      new ErrorResponse(`Attraction not found with id of ${req.params.id}`, 404)
    );
  }

  await attraction.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search attractions
// @route   GET /api/attractions/search
// @access  Public
exports.searchAttractions = asyncHandler(async (req, res, next) => {
  const { city, state, category, date, minPrice, maxPrice, wheelchairAccessible } = req.query;

  // Build search query
  const searchQuery = {};

  // Location filter (city or state)
  if (city) {
    searchQuery['address.city'] = { $regex: city, $options: 'i' };
  }

  if (state) {
    searchQuery['address.state'] = { $regex: state, $options: 'i' };
  }

  // Category filter
  if (category) {
    const categoryList = category.split(',');
    searchQuery.category = { $in: categoryList };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    searchQuery['ticketPrice.adult'] = {};
    
    if (minPrice) {
      searchQuery['ticketPrice.adult'].$gte = parseInt(minPrice);
    }
    
    if (maxPrice) {
      searchQuery['ticketPrice.adult'].$lte = parseInt(maxPrice);
    }
  }

  // Accessibility filter
  if (wheelchairAccessible === 'true') {
    searchQuery['facilities.wheelchairAccessible'] = true;
  }

  // Find attractions that match the search criteria
  const attractions = await Attraction.find(searchQuery)
    .select('name address featuredImage rating category ticketPrice');

  // If date is provided, check operating hours
  // Note: In a real application, you'd need to check if the attraction is open on the given date
  
  res.status(200).json({
    success: true,
    count: attractions.length,
    data: attractions
  });
});

// @desc    Get top rated attractions
// @route   GET /api/attractions/top-rated
// @access  Public
exports.getTopRatedAttractions = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  
  const attractions = await Attraction.find({ rating: { $gte: 4 } })
    .sort({ rating: -1 })
    .limit(limit)
    .select('name address featuredImage rating category');
  
  res.status(200).json({
    success: true,
    count: attractions.length,
    data: attractions
  });
});

// @desc    Get attractions by state
// @route   GET /api/attractions/by-state/:state
// @access  Public
exports.getAttractionsByState = asyncHandler(async (req, res, next) => {
  const { state } = req.params;
  
  const attractions = await Attraction.find({ 'address.state': state })
    .select('name address featuredImage rating category');
  
  res.status(200).json({
    success: true,
    count: attractions.length,
    data: attractions
  });
});

// @desc    Get attractions by category
// @route   GET /api/attractions/by-category/:category
// @access  Public
exports.getAttractionsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  
  const attractions = await Attraction.find({ category })
    .select('name address featuredImage rating category');
  
  res.status(200).json({
    success: true,
    count: attractions.length,
    data: attractions
  });
}); 