// server/models/Settings.js
const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  units: {
    type: String,
    enum: ['meters', 'yards'],
    default: 'meters'
  },
  lastSync: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', SettingsSchema);