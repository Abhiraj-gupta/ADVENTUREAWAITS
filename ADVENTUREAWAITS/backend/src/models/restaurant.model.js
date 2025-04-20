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
  cuisine: {
    type: [String],
    required: [true, 'Cuisine type is required']
  },
  priceRange: {
    type: String,
    enum: ['₹', '₹₹', '₹₹₹', '₹₹₹₹'],
    default: '₹₹'
  },
  estimatedCostForTwo: {
    type: Number,
    default: 1200
  },
  menuItems: [{
    name: String,
    description: String,
    price: Number,
    category: String,
    isVegetarian: Boolean,
    isVegan: Boolean,
    isGlutenFree: Boolean,
    spicyLevel: {
      type: Number,
      min: 0,
      max: 3
    },
    isPopular: Boolean,
    image: String
  }],
  menuCategories: [{
    name: String,
    description: String,
    image: String
  }],
  mealTypes: {
    breakfast: {
      type: Boolean,
      default: false
    },
    lunch: {
      type: Boolean,
      default: true
    },
    dinner: {
      type: Boolean,
      default: true
    },
    brunch: {
      type: Boolean,
      default: false
    },
    snacks: {
      type: Boolean,
      default: false
    }
  },
  dietaryOptions: {
    vegetarian: {
      type: Boolean,
      default: true
    },
    vegan: {
      type: Boolean,
      default: false
    },
    glutenFree: {
      type: Boolean,
      default: false
    },
    jain: {
      type: Boolean,
      default: false
    },
    halal: {
      type: Boolean,
      default: false
    },
    kosher: {
      type: Boolean,
      default: false
    }
  },
  operatingHours: {
    monday: {
      open: { type: String, default: '11:00' },
      close: { type: String, default: '23:00' },
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, default: '11:00' },
      close: { type: String, default: '23:00' },
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, default: '11:00' },
      close: { type: String, default: '23:00' },
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, default: '11:00' },
      close: { type: String, default: '23:00' },
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, default: '11:00' },
      close: { type: String, default: '00:00' },
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, default: '11:00' },
      close: { type: String, default: '00:00' },
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '11:00' },
      close: { type: String, default: '23:00' },
      closed: { type: Boolean, default: false }
    }
  },
  facilities: {
    parking: {
      type: Boolean,
      default: true
    },
    outdoor: {
      type: Boolean,
      default: false
    },
    airConditioned: {
      type: Boolean,
      default: true
    },
    wifi: {
      type: Boolean,
      default: true
    },
    liveMusic: {
      type: Boolean,
      default: false
    },
    rooftop: {
      type: Boolean,
      default: false
    },
    smoking: {
      type: Boolean,
      default: false
    },
    alcoholServed: {
      type: Boolean,
      default: false
    },
    familyFriendly: {
      type: Boolean,
      default: true
    },
    privateParty: {
      type: Boolean,
      default: false
    }
  },
  reservationRequired: {
    type: Boolean,
    default: false
  },
  reservationSettings: {
    maxPartySize: {
      type: Number,
      default: 20
    },
    minAdvanceHours: {
      type: Number,
      default: 1
    },
    maxAdvanceDays: {
      type: Number,
      default: 30
    },
    availableTimeSlots: [String],
    specialOccasions: {
      type: Boolean,
      default: true
    }
  },
  paymentOptions: {
    cash: {
      type: Boolean,
      default: true
    },
    creditCard: {
      type: Boolean,
      default: true
    },
    debitCard: {
      type: Boolean,
      default: true
    },
    upi: {
      type: Boolean,
      default: true
    },
    wallets: {
      type: Boolean,
      default: true
    }
  },
  delivery: {
    available: {
      type: Boolean,
      default: true
    },
    platforms: [String],
    minOrderAmount: {
      type: Number,
      default: 0
    },
    deliveryRadius: {
      type: Number,
      default: 5
    }
  },
  takeaway: {
    type: Boolean,
    default: true
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
    visitDate: Date,
    date: {
      type: Date,
      default: Date.now
    },
    categories: {
      food: {
        type: Number,
        min: 1,
        max: 5
      },
      service: {
        type: Number,
        min: 1,
        max: 5
      },
      ambience: {
        type: Number,
        min: 1,
        max: 5
      },
      value: {
        type: Number,
        min: 1,
        max: 5
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    recommendedDishes: [String],
    photos: [String]
  }],
  contact: {
    phone: String,
    email: String,
    website: String
  },
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
    zomato: String,
    swiggy: String
  },
  established: Number,
  chefSpecial: [String],
  offers: [{
    title: String,
    description: String,
    validFrom: Date,
    validUntil: Date,
    code: String,
    discountPercentage: Number,
    minOrderValue: Number,
    isActive: {
      type: Boolean,
      default: true
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
restaurantSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 4;
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for category ratings
restaurantSchema.virtual('categoryRatings').get(function() {
  if (this.reviews.length === 0) {
    return {
      food: 4,
      service: 4,
      ambience: 4,
      value: 4,
      cleanliness: 4
    };
  }
  
  const categories = ['food', 'service', 'ambience', 'value', 'cleanliness'];
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

// Set default time slots if none provided
restaurantSchema.pre('save', function(next) {
  if (!this.reservationSettings.availableTimeSlots || this.reservationSettings.availableTimeSlots.length === 0) {
    this.reservationSettings.availableTimeSlots = [
      '12:00', '12:30', '13:00', '13:30', '14:00', 
      '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
    ];
  }
  next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant; 