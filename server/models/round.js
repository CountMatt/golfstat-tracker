// models/Round.js
const mongoose = require('mongoose');

const holeSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  par: { type: Number, required: true },
  score: { type: Number, required: true },
  fairwayHit: { type: String, enum: ['hit', 'left', 'right', null] },
  teeClub: String,
  girHit: Boolean,
  greenPosition: String,
  approachDistance: Number,
  approachClub: String,
  firstPuttDistance: Number,
  firstPuttRemaining: Number,
  putts: Number,
  upAndDownAttempt: Boolean,
  upAndDownSuccess: Boolean,
  fromSand: Boolean
});

const roundSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true }, // ID from localStorage
  date: { type: Date, required: true },
  courseName: { type: String, required: true },
  holeCount: { type: Number, default: 18 },
  holes: [holeSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Round', roundSchema);