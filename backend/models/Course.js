const mongoose = require('mongoose');

const HoleSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    min: 1,
    max: 18
  },
  par: {
    type: Number,
    required: true,
    min: 3,
    max: 5
  },
  distance: {
    type: Number,
    required: true
  },
  hcp: {
    type: Number,
    min: 1,
    max: 18
  },
  greenLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a course name'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  holes: [HoleSchema],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geographic searches
HoleSchema.index({ greenLocation: '2dsphere' });

module.exports = mongoose.model('Course', CourseSchema);