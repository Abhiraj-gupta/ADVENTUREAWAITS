const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [100, 'Description cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0, 'Amount cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Accommodation', 'Food', 'Transportation', 'Activities', 'Shopping', 'Miscellaneous']
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Other'],
    default: 'Cash'
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
});

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    enum: ['Accommodation', 'Food', 'Transportation', 'Activities', 'Shopping', 'Miscellaneous']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
    min: [0, 'Amount cannot be negative']
  }
});

const BudgetSchema = new mongoose.Schema({
  tripName: {
    type: String,
    required: [true, 'Please add a trip name'],
    trim: true,
    maxlength: [50, 'Trip name cannot be more than 50 characters']
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
  totalBudget: {
    type: Number,
    required: [true, 'Please add a total budget'],
    min: [0, 'Budget cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  categories: [CategorySchema],
  expenses: [ExpenseSchema],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate trip duration in days
BudgetSchema.virtual('tripDuration').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Calculate total expenses
BudgetSchema.virtual('totalExpenses').get(function() {
  return this.expenses.reduce((total, expense) => total + expense.amount, 0);
});

// Calculate remaining budget
BudgetSchema.virtual('remainingBudget').get(function() {
  return this.totalBudget - this.totalExpenses;
});

// Calculate daily budget
BudgetSchema.virtual('dailyBudget').get(function() {
  if (this.tripDuration === 0) return 0;
  return this.totalBudget / this.tripDuration;
});

// Calculate average daily spend
BudgetSchema.virtual('averageDailySpend').get(function() {
  if (this.tripDuration === 0) return 0;
  return this.totalExpenses / this.tripDuration;
});

// Calculate spending by category
BudgetSchema.virtual('spendingByCategory').get(function() {
  const spending = {};
  this.categories.forEach(cat => {
    spending[cat.name] = {
      allocated: cat.amount,
      spent: 0,
      remaining: cat.amount
    };
  });

  this.expenses.forEach(expense => {
    if (spending[expense.category]) {
      spending[expense.category].spent += expense.amount;
      spending[expense.category].remaining = spending[expense.category].allocated - spending[expense.category].spent;
    }
  });

  return spending;
});

// Set toJSON and toObject options
BudgetSchema.set('toJSON', { virtuals: true });
BudgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', BudgetSchema); 