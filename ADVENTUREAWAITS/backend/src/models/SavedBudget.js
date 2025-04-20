const mongoose = require('mongoose');

const SavedBudgetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for your budget'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: [true, 'Please specify a destination']
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please specify an end date']
  },
  travelers: {
    type: Number,
    required: [true, 'Please specify number of travelers'],
    min: [1, 'There must be at least 1 traveler']
  },
  totalBudget: {
    type: Number,
    required: [true, 'Please specify the total budget']
  },
  expenses: [{
    category: {
      type: String,
      enum: ['accommodation', 'food', 'transportation', 'activities', 'shopping', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  accommodationBudget: {
    type: Number,
    default: 0
  },
  transportationBudget: {
    type: Number,
    default: 0
  },
  foodBudget: {
    type: Number,
    default: 0
  },
  activitiesBudget: {
    type: Number,
    default: 0
  },
  otherBudget: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  costPerPerson: {
    type: Number,
    default: function() {
      return this.travelers > 0 ? this.totalBudget / this.travelers : 0;
    }
  },
  costPerDay: {
    type: Number,
    default: function() {
      if (!this.startDate || !this.endDate) return 0;
      const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
      return days > 0 ? this.totalBudget / days : 0;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps when updating
SavedBudgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate duration of trip
SavedBudgetSchema.methods.getDuration = function() {
  if (!this.startDate || !this.endDate) return 0;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
};

module.exports = mongoose.model('SavedBudget', SavedBudgetSchema); 