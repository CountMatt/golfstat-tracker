const mongoose = require('mongoose');

const HoleResultSchema = new mongoose.Schema({
  holeNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 18
  },
  par: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  fairwayHit: {
    type: Boolean,
    default: null
  },
  gir: {
    type: Boolean,
    default: false
  },
  putts: {
    type: Number,
    default: 0
  },
  chips: {
    type: Number,
    default: 0
  },
  penalties: {
    type: Number,
    default: 0
  }
});

const RoundSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  player: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  holeResults: [HoleResultSchema],
  totalScore: {
    type: Number
  },
  completed: {
    type: Boolean,
    default: false
  },
  weather: {
    temperature: Number,
    windSpeed: Number,
    conditions: String
  },
  notes: {
    type: String
  }
});

// Calculate total score before saving
RoundSchema.pre('save', function(next) {
  if (this.holeResults && this.holeResults.length > 0) {
    this.totalScore = this.holeResults.reduce((sum, hole) => sum + hole.score, 0);
  }
  next();
});

module.exports = mongoose.model('Round', RoundSchema);