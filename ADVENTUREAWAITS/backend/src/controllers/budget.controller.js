const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const SavedBudget = require('../models/SavedBudget');

/**
 * @desc    Get all budgets for a user
 * @route   GET /api/v1/budgets
 * @access  Private
 */
exports.getBudgets = asyncHandler(async (req, res, next) => {
  const budgets = await SavedBudget.find({ user: req.user.id });
  
  res.status(200).json({
    success: true,
    count: budgets.length,
    data: budgets
  });
});

/**
 * @desc    Get single budget
 * @route   GET /api/v1/budgets/:id
 * @access  Private
 */
exports.getBudget = asyncHandler(async (req, res, next) => {
  const budget = await SavedBudget.findById(req.params.id);
  
  if (!budget) {
    return next(new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the budget
  if (budget.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this budget`, 401));
  }
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Create new budget
 * @route   POST /api/v1/budgets
 * @access  Private
 */
exports.createBudget = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;
  
  const budget = await SavedBudget.create(req.body);
  
  res.status(201).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Update budget
 * @route   PUT /api/v1/budgets/:id
 * @access  Private
 */
exports.updateBudget = asyncHandler(async (req, res, next) => {
  let budget = await SavedBudget.findById(req.params.id);
  
  if (!budget) {
    return next(new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the budget
  if (budget.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this budget`, 401));
  }
  
  budget = await SavedBudget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Delete budget
 * @route   DELETE /api/v1/budgets/:id
 * @access  Private
 */
exports.deleteBudget = asyncHandler(async (req, res, next) => {
  const budget = await SavedBudget.findById(req.params.id);
  
  if (!budget) {
    return next(new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the budget
  if (budget.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this budget`, 401));
  }
  
  await budget.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Add expense to budget
 * @route   POST /api/v1/budgets/:id/expenses
 * @access  Private
 */
exports.addExpense = asyncHandler(async (req, res, next) => {
  let budget = await SavedBudget.findById(req.params.id);
  
  if (!budget) {
    return next(new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the budget
  if (budget.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to add expenses to this budget`, 401));
  }
  
  budget.expenses.push(req.body);
  await budget.save();
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Update expense
 * @route   PUT /api/v1/budgets/:id/expenses/:expenseId
 * @access  Private
 */
exports.updateExpense = asyncHandler(async (req, res, next) => {
  let budget = await SavedBudget.findById(req.params.id);
  
  if (!budget) {
    return next(new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the budget
  if (budget.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update expenses in this budget`, 401));
  }
  
  // Find expense index
  const expenseIndex = budget.expenses.findIndex(
    expense => expense._id.toString() === req.params.expenseId
  );
  
  if (expenseIndex === -1) {
    return next(new ErrorResponse(`Expense not found with id of ${req.params.expenseId}`, 404));
  }
  
  // Update expense
  budget.expenses[expenseIndex] = { 
    ...budget.expenses[expenseIndex].toObject(), 
    ...req.body 
  };
  
  await budget.save();
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Delete expense
 * @route   DELETE /api/v1/budgets/:id/expenses/:expenseId
 * @access  Private
 */
exports.deleteExpense = asyncHandler(async (req, res, next) => {
  let budget = await SavedBudget.findById(req.params.id);
  
  if (!budget) {
    return next(new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the budget
  if (budget.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete expenses from this budget`, 401));
  }
  
  // Filter out expense
  budget.expenses = budget.expenses.filter(
    expense => expense._id.toString() !== req.params.expenseId
  );
  
  await budget.save();
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Get budget summary statistics
 * @route   GET /api/v1/budgets/summary
 * @access  Private
 */
exports.getBudgetSummary = asyncHandler(async (req, res, next) => {
  // Get all user budgets
  const budgets = await SavedBudget.find({ user: req.user.id });

  // Calculate total spent
  const totalBudgeted = budgets.reduce((total, budget) => {
    return total + (budget.totalBudget || 0);
  }, 0);

  // Calculate total expenses
  const totalExpenses = budgets.reduce((total, budget) => {
    const expenseTotal = budget.expenses.reduce((sum, expense) => {
      return sum + (expense.amount || 0);
    }, 0);
    return total + expenseTotal;
  }, 0);

  // Count destinations
  const destinations = [...new Set(budgets.map(budget => budget.destination))];
  
  // Get upcoming trips
  const today = new Date();
  const upcomingTrips = budgets.filter(budget => {
    if (!budget.startDate) return false;
    const startDate = new Date(budget.startDate);
    return startDate > today;
  });

  res.status(200).json({
    success: true,
    data: {
      totalBudgeted,
      totalExpenses,
      destinationCount: destinations.length,
      totalTrips: budgets.length,
      upcomingTrips: upcomingTrips.length
    }
  });
});

/**
 * @desc    Get pricing data for a specific state
 * @route   GET /api/v1/budgets/pricing/:state
 * @access  Public
 */
exports.getStatePricing = asyncHandler(async (req, res, next) => {
  const { state } = req.params;
  
  // Static pricing data for different states
  const pricingData = {
    kerala: {
      accommodation: {
        budget: { price: 1200, description: 'Basic homestays and budget hotels' },
        'mid-range': { price: 3000, description: 'Comfortable 3-star hotels and resorts' },
        luxury: { price: 8000, description: 'Premium 5-star hotels and luxury resorts' }
      },
      transportation: {
        flight: { price: 5000, description: 'Round-trip domestic flights' },
        train: { price: 800, description: 'AC train tickets to major destinations' },
        bus: { price: 400, description: 'State transport or private bus services' },
        car: { price: 1800, description: 'Self-drive rentals or taxi services' }
      },
      food: {
        budget: { price: 400, description: 'Local eateries and street food' },
        'mid-range': { price: 1000, description: 'Casual restaurants with Kerala specialties' },
        premium: { price: 2000, description: 'Fine dining experiences and resort restaurants' }
      },
      recommendations: {
        hotels: [
          { name: 'Coconut Bay Resort', location: 'Kochi', priceRange: '₹3,000 - ₹5,000' },
          { name: 'Kumarakom Lake Resort', location: 'Kumarakom', priceRange: '₹8,000 - ₹15,000' },
          { name: 'Leela Kovalam', location: 'Kovalam', priceRange: '₹7,000 - ₹12,000' }
        ],
        restaurants: [
          { name: 'Grand Pavilion', location: 'Kochi', cuisine: 'Traditional Kerala' },
          { name: 'Karavalli', location: 'Trivandrum', cuisine: 'Seafood' },
          { name: 'Amma\'s Kitchen', location: 'Munnar', cuisine: 'Vegetarian' }
        ]
      }
    },
    jammuKashmir: {
      accommodation: {
        budget: { price: 1500, description: 'Simple guesthouses and budget hotels' },
        'mid-range': { price: 3500, description: 'Standard hotels with mountain views' },
        luxury: { price: 9000, description: 'Luxury houseboats and premium resorts' }
      },
      transportation: {
        flight: { price: 6000, description: 'Flights to Srinagar/Jammu' },
        train: { price: 1200, description: 'Train to Jammu with connecting transport' },
        bus: { price: 600, description: 'Long-distance bus services' },
        car: { price: 2000, description: 'Private car hire with driver' }
      },
      food: {
        budget: { price: 350, description: 'Street food and local dhabas' },
        'mid-range': { price: 900, description: 'Standard restaurants with Kashmiri cuisine' },
        premium: { price: 1800, description: 'Deluxe restaurants and resort dining' }
      },
      recommendations: {
        hotels: [
          { name: 'Vivanta Dal View', location: 'Srinagar', priceRange: '₹9,000 - ₹15,000' },
          { name: 'Khyber Himalayan Resort', location: 'Gulmarg', priceRange: '₹12,000 - ₹20,000' },
          { name: 'Houseboat Welcom', location: 'Dal Lake', priceRange: '₹6,000 - ₹10,000' }
        ],
        restaurants: [
          { name: 'Ahdoos', location: 'Srinagar', cuisine: 'Wazwan' },
          { name: 'Mughal Darbar', location: 'Srinagar', cuisine: 'Kashmiri' },
          { name: 'Shamyana', location: 'Pahalgam', cuisine: 'Multi-cuisine' }
        ]
      }
    },
    himachalPradesh: {
      accommodation: {
        budget: { price: 1200, description: 'Affordable guesthouses and homestays' },
        'mid-range': { price: 3000, description: 'Comfortable hotels with mountain views' },
        luxury: { price: 7500, description: 'Luxury resorts and heritage properties' }
      },
      transportation: {
        flight: { price: 5500, description: 'Flights to Shimla/Dharamshala/Kullu' },
        train: { price: 950, description: 'Trains to foothills with connecting transport' },
        bus: { price: 500, description: 'HRTC and private bus services' },
        car: { price: 1800, description: 'Self-drive rentals or taxi services' }
      },
      food: {
        budget: { price: 350, description: 'Local dhabas and small eateries' },
        'mid-range': { price: 800, description: 'Standard restaurants with Himachali cuisine' },
        premium: { price: 1600, description: 'Resort dining and fine dining options' }
      },
      recommendations: {
        hotels: [
          { name: 'The Oberoi Cecil', location: 'Shimla', priceRange: '₹12,000 - ₹20,000' },
          { name: 'The Himalayan', location: 'Manali', priceRange: '₹8,000 - ₹14,000' },
          { name: 'Fortune Resort', location: 'McLeodganj', priceRange: '₹5,000 - ₹8,000' }
        ],
        restaurants: [
          { name: 'Cafe Illiterati', location: 'Dharamshala', cuisine: 'Fusion' },
          { name: 'Johnson\'s Cafe', location: 'Manali', cuisine: 'Continental & Indian' },
          { name: 'Cafe Sol', location: 'Shimla', cuisine: 'Multi-cuisine' }
        ]
      }
    },
    uttarPradesh: {
      accommodation: {
        budget: { price: 1000, description: 'Budget hotels and dharamshalas' },
        'mid-range': { price: 2800, description: 'Standard hotels in good locations' },
        luxury: { price: 7000, description: 'Heritage hotels and luxury properties' }
      },
      transportation: {
        flight: { price: 4500, description: 'Flights to Lucknow/Varanasi/Agra' },
        train: { price: 700, description: 'Extensive rail network across the state' },
        bus: { price: 400, description: 'State and private bus services' },
        car: { price: 1500, description: 'Rental cars with driver' }
      },
      food: {
        budget: { price: 300, description: 'Local street food and small restaurants' },
        'mid-range': { price: 700, description: 'Standard restaurants with UP specialties' },
        premium: { price: 1500, description: 'Fine dining with authentic Awadhi cuisine' }
      },
      recommendations: {
        hotels: [
          { name: 'Taj Hotel', location: 'Lucknow', priceRange: '₹7,000 - ₹12,000' },
          { name: 'The Gateway Hotel', location: 'Varanasi', priceRange: '₹5,000 - ₹9,000' },
          { name: 'ITC Mughal', location: 'Agra', priceRange: '₹8,000 - ₹15,000' }
        ],
        restaurants: [
          { name: 'Tunday Kababi', location: 'Lucknow', cuisine: 'Awadhi' },
          { name: 'Baati Chokha', location: 'Varanasi', cuisine: 'Regional UP' },
          { name: 'Pind Balluchi', location: 'Agra', cuisine: 'North Indian' }
        ]
      }
    },
    gujarat: {
      accommodation: {
        budget: { price: 1100, description: 'Budget hotels and guest houses' },
        'mid-range': { price: 2800, description: 'Comfortable 3-star hotels' },
        luxury: { price: 7000, description: 'Luxury hotels and heritage properties' }
      },
      transportation: {
        flight: { price: 4500, description: 'Flights to Ahmedabad/Rajkot/Vadodara' },
        train: { price: 800, description: 'Well-connected rail network' },
        bus: { price: 450, description: 'State transport and private services' },
        car: { price: 1600, description: 'Car rentals with good highway infrastructure' }
      },
      food: {
        budget: { price: 300, description: 'Street food and thali places' },
        'mid-range': { price: 700, description: 'Standard restaurants with Gujarati cuisine' },
        premium: { price: 1400, description: 'Fine dining with authentic specialties' }
      },
      recommendations: {
        hotels: [
          { name: 'The House of MG', location: 'Ahmedabad', priceRange: '₹5,000 - ₹9,000' },
          { name: 'Sarovar Portico', location: 'Rajkot', priceRange: '₹3,000 - ₹5,000' },
          { name: 'The Gateway Hotel', location: 'Vadodara', priceRange: '₹6,000 - ₹10,000' }
        ],
        restaurants: [
          { name: 'Agashiye', location: 'Ahmedabad', cuisine: 'Traditional Gujarati' },
          { name: 'Gordhan Thal', location: 'Rajkot', cuisine: 'Kathiyawadi' },
          { name: 'Mandap', location: 'Vadodara', cuisine: 'Gujarati Thali' }
        ]
      }
    },
    odisha: {
      accommodation: {
        budget: { price: 1000, description: 'Budget hotels and guesthouses' },
        'mid-range': { price: 2500, description: 'Standard hotels near attractions' },
        luxury: { price: 6000, description: 'Luxury resorts and heritage properties' }
      },
      transportation: {
        flight: { price: 4800, description: 'Flights to Bhubaneswar/Jharsuguda' },
        train: { price: 750, description: 'Well-connected rail network' },
        bus: { price: 400, description: 'State and private bus operators' },
        car: { price: 1500, description: 'Taxi services and car rentals' }
      },
      food: {
        budget: { price: 300, description: 'Local eateries and street food' },
        'mid-range': { price: 700, description: 'Restaurants with Odia cuisine' },
        premium: { price: 1400, description: 'Fine dining with seafood specialties' }
      },
      recommendations: {
        hotels: [
          { name: 'Mayfair Lagoon', location: 'Bhubaneswar', priceRange: '₹7,000 - ₹12,000' },
          { name: 'Swosti Premium', location: 'Puri', priceRange: '₹4,000 - ₹8,000' },
          { name: 'Toshali Sands', location: 'Puri', priceRange: '₹3,500 - ₹6,000' }
        ],
        restaurants: [
          { name: 'Dalma', location: 'Bhubaneswar', cuisine: 'Odia' },
          { name: 'Kanika', location: 'Puri', cuisine: 'Seafood' },
          { name: 'Wildgrass', location: 'Konark', cuisine: 'Multi-cuisine' }
        ]
      }
    }
  };
  
  // Return pricing for the requested state or default to UP if not found
  const statePricing = pricingData[state] || pricingData.uttarPradesh;
  
  res.status(200).json({
    success: true,
    data: statePricing
  });
}); 