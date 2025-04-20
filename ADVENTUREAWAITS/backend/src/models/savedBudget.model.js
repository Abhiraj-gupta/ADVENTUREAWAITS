const mongoose = require('mongoose');

const savedBudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [50, 'Title cannot exceed 50 characters']
  },
  destination: {
    type: String,
    required: [true, 'Please add a destination'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 day']
  },
  travelers: {
    type: Number,
    required: [true, 'Please specify number of travelers'],
    min: [1, 'Number of travelers must be at least 1']
  },
  budget: {
    transportation: {
      type: Number,
      default: 0
    },
    accommodation: {
      type: Number,
      default: 0
    },
    food: {
      type: Number,
      default: 0
    },
    activities: {
      type: Number,
      default: 0
    },
    miscellaneous: {
      type: Number,
      default: 0
    }
  },
  totalBudget: {
    type: Number,
    required: [true, 'Total budget is required']
  },
  perPersonCost: {
    type: Number
  },
  perDayCost: {
    type: Number
  },
  recommendations: {
    hotels: [{
      name: String,
      description: String,
      priceRange: String,
      rating: Number,
      image: String
    }],
    restaurants: [{
      name: String,
      description: String,
      priceRange: String,
      rating: Number,
      cuisine: String,
      image: String
    }],
    attractions: [{
      name: String,
      description: String,
      price: Number,
      rating: Number,
      image: String
    }]
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to calculate duration if not provided
savedBudgetSchema.pre('save', function(next) {
  // Calculate duration if not provided and both dates exist
  if (!this.duration && this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    this.duration = diffDays;
  }

  // Calculate per person and per day costs
  if (this.totalBudget) {
    if (this.travelers && this.travelers > 0) {
      this.perPersonCost = this.totalBudget / this.travelers;
    }
    
    if (this.duration && this.duration > 0) {
      this.perDayCost = this.totalBudget / this.duration;
    }
  }
  
  next();
});

module.exports = mongoose.model('SavedBudget', savedBudgetSchema); 