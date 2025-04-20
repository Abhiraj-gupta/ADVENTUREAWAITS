const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Restaurant description is required']
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
    }
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
  cuisineType: {
    type: [String],
    required: [true, 'Cuisine type is required']
  },
  priceRange: {
    type: String,
    enum: ['budget', 'moderate', 'expensive', 'luxury'],
    default: 'moderate'
  },
  averageCostForTwo: {
    type: Number,
    required: [true, 'Average cost is required']
  },
  menuItems: [{
    name: String,
    description: String,
    category: String,
    price: Number,
    isVegetarian: Boolean,
    isSignature: Boolean,
    image: String
  }],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  features: {
    takeaway: {
      type: Boolean,
      default: true
    },
    delivery: {
      type: Boolean,
      default: false
    },
    reservation: {
      type: Boolean,
      default: true
    },
    outdoor: {
      type: Boolean,
      default: false
    },
    indoor: {
      type: Boolean,
      default: true
    },
    parking: {
      type: Boolean,
      default: false
    },
    wifi: {
      type: Boolean,
      default: false
    },
    bar: {
      type: Boolean,
      default: false
    },
    liveMusic: {
      type: Boolean,
      default: false
    },
    privateArea: {
      type: Boolean,
      default: false
    },
    acceptsCard: {
      type: Boolean,
      default: true
    },
    additional: [String]
  },
  reservationDetails: {
    maxPartySize: {
      type: Number,
      default: 10
    },
    minAdvanceHours: {
      type: Number,
      default: 1
    },
    maxAdvanceDays: {
      type: Number,
      default: 30
    },
    timeSlotDuration: {
      type: Number,
      default: 120 // minutes
    }
  },
  policies: {
    cancellation: String,
    children: String,
    dresscode: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
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
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
restaurantSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 4;
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Default operating hours if not provided
restaurantSchema.pre('save', function(next) {
  const defaultTime = { open: '12:00', close: '22:00' };
  
  if (!this.operatingHours) {
    this.operatingHours = {
      monday: defaultTime,
      tuesday: defaultTime,
      wednesday: defaultTime,
      thursday: defaultTime,
      friday: { open: '12:00', close: '23:00' },
      saturday: { open: '12:00', close: '23:00' },
      sunday: { open: '12:00', close: '22:00' }
    };
  }
  
  next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant; 