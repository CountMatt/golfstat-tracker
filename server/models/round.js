// server/models/Round.js
const mongoose = require('mongoose');

const HoleSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  par: {
    type: Number,
    required: true,
    default: 4
  },
  score: {
    type: Number,
    default: 0
  },
  fairwayHit: {
    type: String,
    enum: ['hit', 'left', 'right', null],
    default: null
  },
  teeClub: {
    type: String,
    default: ''
  },
  girHit: {
    type: Boolean,
    default: false
  },
  greenPosition: {
    type: String,
    enum: [
      'long-left', 'long', 'long-right',
      'left', 'center', 'right',
      'short-left', 'short', 'short-right',
      null
    ],
    default: null
  },
  approachDistance: {
    type: Number,
    default: 0
  },
  approachClub: {
    type: String,
    default: ''
  },
  firstPuttDistance: {
    type: Number,
    default: 0
  },
  firstPuttRemaining: {
    type: Number,
    default: 0
  },
  putts: {
    type: Number,
    default: 0
  },
  upAndDownAttempt: {
    type: Boolean,
    default: false
  },
  upAndDownSuccess: {
    type: Boolean,
    default: false
  },
  fromSand: {
    type: Boolean,
    default: false
  }
});

const RoundSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  courseName: {
    type: String,
    required: true
  },
  holeCount: {
    type: Number,
    required: true,
    default: 18
  },
  holes: [HoleSchema],
  clientId: {
    type: String,
    required: true
  }, // Using the original ID from localStorage to support syncing
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add some virtual properties for stats
RoundSchema.virtual('totalScore').get(function() {
  return this.holes.reduce((total, hole) => total + hole.score, 0);
});

RoundSchema.virtual('totalPar').get(function() {
  return this.holes.reduce((total, hole) => total + hole.par, 0);
});

RoundSchema.virtual('toPar').get(function() {
  return this.totalScore - this.totalPar;
});

// Set toJSON option to include virtuals
RoundSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Round', RoundSchema);