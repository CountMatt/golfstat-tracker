const mongoose = require('mongoose');

const ShotSchema = new mongoose.Schema({
  round: {
    type: mongoose.Schema.ObjectId,
    ref: 'Round',
    required: true
  },
  hole: {
    type: Number,
    required: true,
    min: 1,
    max: 18
  },
  shotNumber: {
    type: Number,
    required: true
  },
  club: {
    type: String,
    required: true
  },
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  endLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  distance: {
    type: Number,
    required: true
  },
  direction: {
    type: String,
    enum: ['Left', 'Right', 'Straight'],
    required: true
  },
  fairwayHit: {
    type: Boolean,
    default: null
  },
  shotType: {
    type: String,
    enum: ['Tee', 'Fairway', 'Rough', 'Sand', 'Recovery', 'Chip', 'Putt', 'Penalty'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial indexes for location queries
ShotSchema.index({ startLocation: '2dsphere' });
ShotSchema.index({ endLocation: '2dsphere' });

module.exports = mongoose.model('Shot', ShotSchema);