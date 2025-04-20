const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['hotel', 'restaurant', 'attraction'],
    required: [true, 'Booking type is required']
  },
  // Hotel specific fields
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  checkInDate: Date,
  checkOutDate: Date,
  roomType: String,
  numberOfRooms: {
    type: Number,
    min: 1
  },
  numberOfGuests: {
    adults: {
      type: Number,
      min: 1
    },
    children: {
      type: Number,
      default: 0
    }
  },
  // Restaurant specific fields
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  reservationDate: Date,
  reservationTime: String,
  partySize: {
    type: Number,
    min: 1
  },
  occasion: String,
  specialRequests: String,
  // Attraction specific fields
  attraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attraction'
  },
  visitDate: Date,
  ticketType: String,
  tickets: {
    adult: {
      type: Number,
      default: 0
    },
    child: {
      type: Number,
      default: 0
    },
    senior: {
      type: Number,
      default: 0
    }
  },
  guidedTour: {
    type: Boolean,
    default: false
  },
  // Common fields
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'partial'],
    default: 'paid'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  cancellationReason: String,
  cancellationDate: Date,
  refundAmount: Number,
  notes: String
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual fields for related data
bookingSchema.virtual('itemDetails').get(function() {
  if (this.type === 'hotel' && this.hotel) {
    return this.populated('hotel') || this.hotel;
  } else if (this.type === 'restaurant' && this.restaurant) {
    return this.populated('restaurant') || this.restaurant;
  } else if (this.type === 'attraction' && this.attraction) {
    return this.populated('attraction') || this.attraction;
  }
  return null;
});

// Add methods for booking-related operations
bookingSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  
  // Calculate refund amount based on cancellation policies
  // This would be implemented based on business rules
  
  return this.save();
};

bookingSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

// Add a pre-save hook to validate type-specific fields
bookingSchema.pre('save', function(next) {
  if (this.type === 'hotel') {
    if (!this.hotel || !this.checkInDate || !this.checkOutDate || !this.roomType) {
      return next(new Error('Hotel bookings require hotel, check-in date, check-out date, and room type'));
    }
  } else if (this.type === 'restaurant') {
    if (!this.restaurant || !this.reservationDate || !this.reservationTime || !this.partySize) {
      return next(new Error('Restaurant bookings require restaurant, reservation date, time, and party size'));
    }
  } else if (this.type === 'attraction') {
    if (!this.attraction || !this.visitDate) {
      return next(new Error('Attraction bookings require attraction and visit date'));
    }
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 