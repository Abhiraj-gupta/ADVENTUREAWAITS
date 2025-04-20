const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Hotel description is required']
  },
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: String,
    country: {
      type: String,
      default: 'India'
    },
    landmark: String
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  starRating: {
    type: Number,
    min: 1,
    max: 7,
    required: [true, 'Star rating is required']
  },
  images: [String],
  featuredImage: String,
  rooms: [{
    type: {
      type: String,
      enum: ['standard', 'deluxe', 'suite', 'executive', 'family', 'presidential'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    pricePerNight: {
      type: Number,
      required: true
    },
    capacity: {
      adults: {
        type: Number,
        default: 2
      },
      children: {
        type: Number,
        default: 0
      }
    },
    amenities: [String],
    images: [String],
    size: String, // in sq. ft. or sq. meters
    bedType: {
      type: String,
      enum: ['single', 'twin', 'double', 'queen', 'king', 'multiple']
    },
    quantity: {
      type: Number,
      default: 5
    }
  }],
  amenities: {
    wifi: {
      type: Boolean,
      default: true
    },
    parking: {
      type: Boolean,
      default: true
    },
    pool: {
      type: Boolean,
      default: false
    },
    gym: {
      type: Boolean,
      default: false
    },
    spa: {
      type: Boolean,
      default: false
    },
    restaurant: {
      type: Boolean,
      default: false
    },
    roomService: {
      type: Boolean,
      default: true
    },
    bar: {
      type: Boolean,
      default: false
    },
    airConditioning: {
      type: Boolean,
      default: true
    },
    conferenceRoom: {
      type: Boolean,
      default: false
    },
    laundry: {
      type: Boolean,
      default: true
    },
    additional: [String]
  },
  policies: {
    checkIn: {
      type: String,
      default: '14:00'
    },
    checkOut: {
      type: String,
      default: '11:00'
    },
    cancellation: String,
    children: String,
    pets: {
      allowed: {
        type: Boolean,
        default: false
      },
      policy: String
    },
    extraBed: {
      available: {
        type: Boolean,
        default: true
      },
      charges: Number
    }
  },
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: true
    },
    accessibleBathroom: {
      type: Boolean,
      default: false
    },
    elevator: {
      type: Boolean,
      default: true
    },
    additional: [String]
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  nearbyAttractions: [{
    name: String,
    distance: Number, // in kilometers
    description: String
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  popularity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
hotelSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 4;
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for lowest price
hotelSchema.virtual('lowestPrice').get(function() {
  if (!this.rooms || this.rooms.length === 0) return 0;
  return Math.min(...this.rooms.map(room => room.pricePerNight));
});

// Add default room types if none provided
hotelSchema.pre('save', function(next) {
  if (!this.rooms || this.rooms.length === 0) {
    this.rooms = [
      {
        type: 'standard',
        name: 'Standard Room',
        description: 'Comfortable room with essential amenities',
        pricePerNight: 3000,
        capacity: { adults: 2, children: 1 },
        amenities: ['TV', 'Air Conditioning', 'Free WiFi'],
        bedType: 'double',
        quantity: 10
      },
      {
        type: 'deluxe',
        name: 'Deluxe Room',
        description: 'Spacious room with premium amenities',
        pricePerNight: 4500,
        capacity: { adults: 2, children: 2 },
        amenities: ['TV', 'Air Conditioning', 'Free WiFi', 'Mini Bar', 'Coffee Maker'],
        bedType: 'king',
        quantity: 5
      }
    ];
  }
  next();
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel; 