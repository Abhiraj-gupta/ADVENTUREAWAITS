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
  category: {
    type: String,
    enum: ['Historical', 'Religious', 'Adventure', 'Nature', 'Entertainment', 'Museum', 'Beach', 'Wildlife', 'Cultural', 'Others'],
    required: [true, 'Category is required']
  },
  ticketPrice: {
    adult: {
      type: Number,
      required: [true, 'Adult ticket price is required'],
      min: 0
    },
    child: {
      type: Number,
      default: 0,
      min: 0
    },
    senior: {
      type: Number,
      default: 0,
      min: 0
    },
    foreign: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  ticketTypes: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    benefits: [String]
  }],
  operatingHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    holidayHours: String,
    specialHours: [{
      date: Date,
      open: String,
      close: String,
      closed: Boolean,
      note: String
    }]
  },
  bestTimeToVisit: {
    season: {
      type: [String],
      enum: ['Summer', 'Monsoon', 'Winter', 'Spring', 'Autumn', 'Year-round']
    },
    timeOfDay: {
      type: [String],
      enum: ['Morning', 'Afternoon', 'Evening', 'Night']
    },
    months: [String],
    notes: String
  },
  activities: [{
    name: String,
    description: String,
    duration: String,
    price: Number,
    availability: String
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
    foodAndBeverages: {
      type: Boolean,
      default: true
    },
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    guidedTours: {
      type: Boolean,
      default: false
    },
    giftShop: {
      type: Boolean,
      default: false
    },
    audioGuide: {
      type: Boolean,
      default: false
    },
    firstAid: {
      type: Boolean,
      default: true
    },
    lockers: {
      type: Boolean,
      default: false
    },
    additional: [String]
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
    visitDate: Date,
    date: {
      type: Date,
      default: Date.now
    },
    categories: {
      experience: {
        type: Number,
        min: 1,
        max: 5
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5
      },
      facilities: {
        type: Number,
        min: 1,
        max: 5
      },
      value: {
        type: Number,
        min: 1,
        max: 5
      },
      service: {
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
  entryRequirements: {
    idProof: {
      type: Boolean,
      default: false
    },
    dressCode: String,
    restrictions: [String],
    notes: String
  },
  tips: [String],
  history: String,
  significance: String,
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
attractionSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 4;
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for category ratings
attractionSchema.virtual('categoryRatings').get(function() {
  if (this.reviews.length === 0) {
    return {
      experience: 4,
      cleanliness: 4,
      facilities: 4,
      value: 4,
      service: 4
    };
  }
  
  const categories = ['experience', 'cleanliness', 'facilities', 'value', 'service'];
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

// Set default ticket types if none provided
attractionSchema.pre('save', function(next) {
  if (!this.ticketTypes || this.ticketTypes.length === 0) {
    this.ticketTypes = [
      {
        name: 'Standard',
        description: 'Basic entry ticket',
        price: this.ticketPrice.adult || 500,
        benefits: ['Entry to main attractions']
      },
      {
        name: 'Premium',
        description: 'Enhanced experience with additional benefits',
        price: (this.ticketPrice.adult || 500) * 1.5,
        benefits: ['Entry to main attractions', 'Skip-the-line access', 'Souvenir']
      },
      {
        name: 'VIP',
        description: 'Ultimate experience with exclusive access',
        price: (this.ticketPrice.adult || 500) * 2.5,
        benefits: ['Entry to main attractions', 'Skip-the-line access', 'Guided tour', 'Exclusive areas access', 'Souvenir pack', 'Refreshments']
      }
    ];
  }
  next();
});

const Attraction = mongoose.model('Attraction', attractionSchema);

module.exports = Attraction; 