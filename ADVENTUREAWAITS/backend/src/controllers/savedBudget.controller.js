const SavedBudget = require('../models/SavedBudget');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all saved budgets for a user
 * @route   GET /api/v1/saved-budgets
 * @access  Private
 */
exports.getSavedBudgets = asyncHandler(async (req, res, next) => {
  const savedBudgets = await SavedBudget.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: savedBudgets.length,
    data: savedBudgets
  });
});

/**
 * @desc    Get single saved budget
 * @route   GET /api/v1/saved-budgets/:id
 * @access  Private
 */
exports.getSavedBudget = asyncHandler(async (req, res, next) => {
  const savedBudget = await SavedBudget.findById(req.params.id);

  if (!savedBudget) {
    return next(new ErrorResponse(`Saved budget not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the saved budget
  if (savedBudget.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this saved budget`, 401));
  }

  res.status(200).json({
    success: true,
    data: savedBudget
  });
});

/**
 * @desc    Create new saved budget
 * @route   POST /api/v1/saved-budgets
 * @access  Private
 */
exports.createSavedBudget = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Validate dates
  if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
    return next(new ErrorResponse('End date cannot be before start date', 400));
  }

  const savedBudget = await SavedBudget.create(req.body);

  res.status(201).json({
    success: true,
    data: savedBudget
  });
});

/**
 * @desc    Update saved budget
 * @route   PUT /api/v1/saved-budgets/:id
 * @access  Private
 */
exports.updateSavedBudget = asyncHandler(async (req, res, next) => {
  let savedBudget = await SavedBudget.findById(req.params.id);

  if (!savedBudget) {
    return next(new ErrorResponse(`Saved budget not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the saved budget
  if (savedBudget.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this saved budget`, 401));
  }

  // Validate dates if they are being updated
  if (req.body.startDate && req.body.endDate && 
      new Date(req.body.endDate) < new Date(req.body.startDate)) {
    return next(new ErrorResponse('End date cannot be before start date', 400));
  }

  savedBudget = await SavedBudget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: savedBudget
  });
});

/**
 * @desc    Delete saved budget
 * @route   DELETE /api/v1/saved-budgets/:id
 * @access  Private
 */
exports.deleteSavedBudget = asyncHandler(async (req, res, next) => {
  const savedBudget = await SavedBudget.findById(req.params.id);

  if (!savedBudget) {
    return next(new ErrorResponse(`Saved budget not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the saved budget
  if (savedBudget.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this saved budget`, 401));
  }

  await savedBudget.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get saved budget summary statistics
 * @route   GET /api/v1/saved-budgets/summary
 * @access  Private
 */
exports.getSavedBudgetSummary = asyncHandler(async (req, res, next) => {
  const savedBudgets = await SavedBudget.find({ user: req.user.id });
  
  if (savedBudgets.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        totalSavedBudgets: 0,
        totalSpent: 0,
        averageBudget: 0,
        popularDestinations: [],
        recentBudgets: []
      }
    });
  }

  // Calculate total spent across all budgets
  const totalSpent = savedBudgets.reduce((total, budget) => total + budget.totalBudget, 0);
  
  // Calculate average budget
  const averageBudget = totalSpent / savedBudgets.length;
  
  // Find popular destinations
  const destinationCounts = {};
  savedBudgets.forEach(budget => {
    destinationCounts[budget.destination] = (destinationCounts[budget.destination] || 0) + 1;
  });
  
  const popularDestinations = Object.entries(destinationCounts)
    .map(([destination, count]) => ({ destination, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Get 5 most recent budgets
  const recentBudgets = savedBudgets
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(budget => ({
      id: budget._id,
      name: budget.name,
      destination: budget.destination,
      totalBudget: budget.totalBudget,
      createdAt: budget.createdAt
    }));
  
  res.status(200).json({
    success: true,
    data: {
      totalSavedBudgets: savedBudgets.length,
      totalSpent,
      averageBudget,
      popularDestinations,
      recentBudgets
    }
  });
}); 