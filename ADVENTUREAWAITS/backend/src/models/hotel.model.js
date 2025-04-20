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
  images: [String],
  featuredImage: String,
  starRating: {
    type: Number,
    min: 1,
    max: 7,
    required: [true, 'Star rating is required']
  },
  priceRange: {
    type: String,
    enum: ['Budget', 'Economy', 'Mid-range', 'Luxury', 'Ultra-luxury'],
    required: [true, 'Price range is required']
  },
  roomTypes: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    amenities: [String],
    images: [String],
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    size: {
      type: String,
      required: true
    },
    bedType: {
      type: String,
      required: true
    },
    view: String
  }],
  amenities: {
    general: [String],
    room: [String],
    bathroom: [String],
    food: [String],
    cleaning: [String]
  },
  facilities: {
    pool: {
      type: Boolean,
      default: false
    },
    spa: {
      type: Boolean,
      default: false
    },
    gym: {
      type: Boolean,
      default: false
    },
    restaurant: {
      type: Boolean,
      default: false
    },
    bar: {
      type: Boolean,
      default: false
    },
    roomService: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: true
    },
    wifi: {
      type: Boolean,
      default: true
    },
    conferenceRoom: {
      type: Boolean,
      default: false
    },
    businessCenter: {
      type: Boolean,
      default: false
    },
    airportShuttle: {
      type: Boolean,
      default: false
    },
    conciergeService: {
      type: Boolean,
      default: false
    },
    childrenActivities: {
      type: Boolean,
      default: false
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
    pets: {
      type: Boolean,
      default: false
    },
    cancellation: String,
    extraBed: {
      available: {
        type: Boolean,
        default: true
      },
      charge: {
        type: Number,
        default: 1000
      }
    },
    paymentOptions: [String]
  },
  nearbyAttractions: [{
    name: String,
    distance: String,
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
    stayDate: Date,
    date: {
      type: Date,
      default: Date.now
    },
    roomType: String,
    categories: {
      cleanliness: {
        type: Number,
        min: 1,
        max: 5
      },
      comfort: {
        type: Number,
        min: 1,
        max: 5
      },
      staff: {
        type: Number,
        min: 1,
        max: 5
      },
      value: {
        type: Number,
        min: 1,
        max: 5
      },
      location: {
        type: Number,
        min: 1,
        max: 5
      },
      wifi: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  }],
  contact: {
    phone: String,
    email: String,
    website: String
  },
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

// Virtual for category ratings
hotelSchema.virtual('categoryRatings').get(function() {
  if (this.reviews.length === 0) {
    return {
      cleanliness: 4,
      comfort: 4,
      staff: 4,
      value: 4,
      location: 4,
      wifi: 4
    };
  }
  
  const categories = ['cleanliness', 'comfort', 'staff', 'value', 'location', 'wifi'];
  const result = {};
  
  categories.forEach(category => {
    const validReviews = this.reviews.filter(review => 
      review.categories && review.categories[category]
    );
    
    if (validReviews.length > 0) {
      const sum = validReviews.reduce((total, review) => 
        total + review.categories[category], 0
      );
      result[category] = Math.round((sum / validReviews.length) * 10) / 10;
    } else {
      result[category] = 4;
    }
  });
  
  return result;
});

// Set default room types if none provided
hotelSchema.pre('save', function(next) {
  if (!this.roomTypes || this.roomTypes.length === 0) {
    this.roomTypes = [
      {
        name: 'Standard Room',
        description: 'Comfortable room with basic amenities',
        price: 3000,
        capacity: 2,
        amenities: ['TV', 'Air Conditioning', 'Private Bathroom', 'Free Wifi'],
        quantity: 10,
        size: '25 sq m',
        bedType: 'Queen',
        view: 'City'
      },
      {
        name: 'Deluxe Room',
        description: 'Spacious room with additional amenities',
        price: 4500,
        capacity: 2,
        amenities: ['TV', 'Air Conditioning', 'Private Bathroom', 'Free Wifi', 'Mini Bar', 'Work Desk'],
        quantity: 8,
        size: '32 sq m',
        bedType: 'King',
        view: 'Garden'
      },
      {
        name: 'Suite',
        description: 'Luxury suite with separate living area',
        price: 7500,
        capacity: 4,
        amenities: ['TV', 'Air Conditioning', 'Private Bathroom', 'Free Wifi', 'Mini Bar', 'Work Desk', 'Separate Living Area', 'Jacuzzi'],
        quantity: 4,
        size: '45 sq m',
        bedType: 'King',
        view: 'Premium'
      }
    ];
  }
  next();
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel; 