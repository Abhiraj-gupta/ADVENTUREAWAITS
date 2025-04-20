const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');
const Restaurant = require('../models/restaurant.model');
const Attraction = require('../models/attraction.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'favorites.hotels',
      select: 'name address featuredImage rating starRating'
    })
    .populate({
      path: 'favorites.restaurants',
      select: 'name address featuredImage rating cuisine'
    })
    .populate({
      path: 'favorites.attractions',
      select: 'name address featuredImage rating category'
    });

  res.status(200).json({
    success: true,
    data: user.favorites
  });
});

// @desc    Add to favorites
// @route   POST /api/favorites/:type/:id
// @access  Private
exports.addToFavorites = asyncHandler(async (req, res, next) => {
  const { type, id } = req.params;
  
  // Validate type
  if (!['hotels', 'restaurants', 'attractions'].includes(type)) {
    return next(new ErrorResponse(`Invalid favorite type: ${type}`, 400));
  }
  
  // Check if item exists
  let Model;
  if (type === 'hotels') {
    Model = Hotel;
  } else if (type === 'restaurants') {
    Model = Restaurant;
  } else {
    Model = Attraction;
  }
  
  const item = await Model.findById(id);
  
  if (!item) {
    return next(new ErrorResponse(`No ${type.slice(0, -1)} found with id ${id}`, 404));
  }
  
  // Add to favorites
  const user = await User.findById(req.user.id);
  await user.addFavorite(type, id);
  
  res.status(200).json({
    success: true,
    data: user.favorites
  });
});

// @desc    Remove from favorites
// @route   DELETE /api/favorites/:type/:id
// @access  Private
exports.removeFromFavorites = asyncHandler(async (req, res, next) => {
  const { type, id } = req.params;
  
  // Validate type
  if (!['hotels', 'restaurants', 'attractions'].includes(type)) {
    return next(new ErrorResponse(`Invalid favorite type: ${type}`, 400));
  }
  
  // Remove from favorites
  const user = await User.findById(req.user.id);
  await user.removeFavorite(type, id);
  
  res.status(200).json({
    success: true,
    data: user.favorites
  });
});

// @desc    Check if item is in favorites
// @route   GET /api/favorites/:type/:id
// @access  Private
exports.isInFavorites = asyncHandler(async (req, res, next) => {
  const { type, id } = req.params;
  
  // Validate type
  if (!['hotels', 'restaurants', 'attractions'].includes(type)) {
    return next(new ErrorResponse(`Invalid favorite type: ${type}`, 400));
  }
  
  // Check if in favorites
  const user = await User.findById(req.user.id);
  const isInFavorites = user.isInFavorites(type, id);
  
  res.status(200).json({
    success: true,
    data: {
      isInFavorites
    }
  });
}); 