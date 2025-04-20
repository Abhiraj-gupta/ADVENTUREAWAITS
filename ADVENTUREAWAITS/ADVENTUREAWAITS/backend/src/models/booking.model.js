const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookingType: {
      type: String,
      enum: ['hotel', 'restaurant', 'attraction'],
      required: true
    },
    itemId: {
      type: String,
      required: true
    },
    stateId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      default: function() {
        // If booking type is hotel, endDate is required. Otherwise, default to startDate
        if (this.bookingType === 'hotel') {
          return null; // Will trigger validation error if not provided
        }
        return this.startDate;
      }
    },
    // Hotel specific fields
    roomType: {
      type: String,
      enum: ['standard', 'deluxe', 'suite'],
      required: function() {
        return this.bookingType === 'hotel';
      }
    },
    rooms: {
      type: Number,
      min: 1,
      required: function() {
        return this.bookingType === 'hotel';
      }
    },
    guests: {
      type: Number,
      min: 1,
      required: function() {
        return this.bookingType === 'hotel';
      }
    },
    // Restaurant specific fields
    time: {
      type: String,
      required: function() {
        return this.bookingType === 'restaurant';
      }
    },
    people: {
      type: Number,
      min: 1,
      required: function() {
        return this.bookingType === 'restaurant';
      }
    },
    occasion: {
      type: String,
      enum: ['none', 'birthday', 'anniversary', 'business', 'other'],
      default: 'none'
    },
    specialRequests: {
      type: String,
      maxlength: 500
    },
    // Attraction specific fields
    ticketType: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      default: 'standard',
      required: function() {
        return this.bookingType === 'attraction';
      }
    },
    adultTickets: {
      type: Number,
      min: 0,
      default: 0
    },
    childTickets: {
      type: Number,
      min: 0,
      default: 0
    },
    seniorTickets: {
      type: Number,
      min: 0,
      default: 0
    },
    totalTickets: {
      type: Number,
      min: 1,
      required: function() {
        return this.bookingType === 'attraction' && 
               this.adultTickets + this.childTickets + this.seniorTickets === 0;
      }
    },
    guidedTour: {
      type: Boolean,
      default: false
    },
    // Common fields
    totalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'completed'],
      default: 'confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'paid'
    },
    notes: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// Virtual field to check if booking is in the past
BookingSchema.virtual('isPast').get(function() {
  return new Date(this.startDate) < new Date();
});

// Make virtuals available when converted to JSON
BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', BookingSchema); 