const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    match: [
      /^(\+\d{1,3}[- ]?)?\d{10}$/,
      'Please add a valid phone number'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favorites: {
    hotels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel'
    }],
    restaurants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    }],
    attractions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attraction'
    }]
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Add favorite
userSchema.methods.addFavorite = async function(type, itemId) {
  if (!['hotels', 'restaurants', 'attractions'].includes(type)) {
    throw new Error('Invalid favorite type');
  }
  
  if (!this.favorites[type].includes(itemId)) {
    this.favorites[type].push(itemId);
    await this.save();
  }
  
  return this.favorites;
};

// Remove favorite
userSchema.methods.removeFavorite = async function(type, itemId) {
  if (!['hotels', 'restaurants', 'attractions'].includes(type)) {
    throw new Error('Invalid favorite type');
  }
  
  this.favorites[type] = this.favorites[type].filter(
    id => id.toString() !== itemId.toString()
  );
  
  await this.save();
  
  return this.favorites;
};

// Check if item is in favorites
userSchema.methods.isInFavorites = function(type, itemId) {
  if (!['hotels', 'restaurants', 'attractions'].includes(type)) {
    return false;
  }
  
  return this.favorites[type].some(id => id.toString() === itemId.toString());
};

const User = mongoose.model('User', userSchema);

module.exports = User; 