const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an expense title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an expense amount']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['transportation', 'accommodation', 'food', 'activities', 'shopping', 'other']
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
});

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a budget title'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Please provide a destination']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  duration: {
    type: Number,
    default: function() {
      if (this.startDate && this.endDate) {
        const diffTime = Math.abs(this.endDate - this.startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
      return 1;
    }
  },
  totalBudget: {
    type: Number,
    required: [true, 'Please provide a total budget']
  },
  numTravelers: {
    type: Number,
    required: [true, 'Please provide the number of travelers'],
    default: 1
  },
  additionalExpenses: [expenseSchema],
  transportationBudget: {
    type: Number,
    default: 0
  },
  accommodationBudget: {
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
  miscBudget: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property to calculate remaining budget
budgetSchema.virtual('remainingBudget').get(function() {
  const totalExpenses = this.additionalExpenses.reduce((acc, expense) => acc + expense.amount, 0);
  const budgetedAmount = 
    this.transportationBudget + 
    this.accommodationBudget + 
    this.foodBudget + 
    this.activitiesBudget + 
    this.miscBudget;
  
  return this.totalBudget - budgetedAmount - totalExpenses;
});

// Pre-save middleware to update duration and updatedAt
budgetSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  this.updatedAt = Date.now();
  next();
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget; 