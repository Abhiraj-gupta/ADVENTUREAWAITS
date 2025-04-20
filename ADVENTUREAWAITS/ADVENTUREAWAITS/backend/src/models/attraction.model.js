const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Attraction name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Attraction description is required']
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
  category: {
    type: String,
    enum: ['historical', 'nature', 'adventure', 'cultural', 'religious', 'entertainment', 'wildlife', 'beach', 'mountain', 'other'],
    required: [true, 'Category is required']
  },
  ticketPrice: {
    adult: {
      type: Number,
      required: true
    },
    child: {
      type: Number,
      required: true
    },
    senior: {
      type: Number,
      default: function() {
        return this.adult * 0.8; // 20% discount for seniors
      }
    },
    foreigner: Number
  },
  ticketTypes: [{
    name: {
      type: String,
      enum: ['standard', 'premium', 'vip', 'guidedTour'],
      required: true
    },
    description: String,
    priceMultiplier: {
      type: Number,
      default: 1.0
    },
    benefits: [String]
  }],
  facilities: {
    parking: {
      type: Boolean,
      default: true
    },
    restrooms: {
      type: Boolean,
      default: true
    },
    foodOptions: {
      type: Boolean,
      default: false
    },
    giftShop: {
      type: Boolean,
      default: false
    },
    accessibility: {
      type: Boolean,
      default: true
    },
    guidedTours: {
      type: Boolean,
      default: false
    },
    photography: {
      type: Boolean,
      default: true
    },
    audioGuide: {
      type: Boolean,
      default: false
    },
    additional: [String]
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  bestTimeToVisit: {
    season: {
      type: String,
      enum: ['spring', 'summer', 'monsoon', 'autumn', 'winter', 'all year']
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night', 'any']
    },
    monthsFrom: Number,
    monthsTo: Number
  },
  duration: {
    type: Number, // Duration in hours
    default: 2
  },
  restrictions: {
    minAge: Number,
    maxAge: Number,
    physicalRequirements: String,
    dressCode: String,
    additional: [String]
  },
  policies: {
    cancellation: String,
    photography: String,
    additional: [String]
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
  highlights: [String],
  nearbyAttractions: [{
    attraction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attraction'
    },
    distance: Number // in kilometers
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
attractionSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 4;
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Default operating hours if not provided
attractionSchema.pre('save', function(next) {
  const defaultTime = { open: '09:00', close: '17:00' };
  
  if (!this.operatingHours) {
    this.operatingHours = {
      monday: defaultTime,
      tuesday: defaultTime,
      wednesday: defaultTime,
      thursday: defaultTime,
      friday: defaultTime,
      saturday: defaultTime,
      sunday: defaultTime
    };
  }
  
  if (!this.ticketTypes || this.ticketTypes.length === 0) {
    this.ticketTypes = [
      {
        name: 'standard',
        description: 'Regular admission ticket',
        priceMultiplier: 1.0,
        benefits: ['Basic access to all public areas']
      }
    ];
  }
  
  next();
});

const Attraction = mongoose.model('Attraction', attractionSchema);

module.exports = Attraction; 