const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Models
const Round = require('./models/Round');

// Initialize Express
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Get all rounds
app.get('/api/rounds', async (req, res) => {
  try {
    const rounds = await Round.find().sort({ date: -1 });
    res.json(rounds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get round by clientId
app.get('/api/rounds/:clientId', async (req, res) => {
  try {
    const round = await Round.findOne({ clientId: req.params.clientId });
    
    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }
    
    res.json(round);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update round
app.post('/api/rounds', async (req, res) => {
  try {
    const { clientId } = req.body;
    
    // Check if round already exists
    let round = await Round.findOne({ clientId });
    
    if (round) {
      // Update existing round
      round = await Round.findOneAndUpdate(
        { clientId },
        req.body,
        { new: true }
      );
    } else {
      // Create new round
      round = new Round(req.body);
      await round.save();
    }
    
    res.json(round);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete round
app.delete('/api/rounds/:clientId', async (req, res) => {
  try {
    const round = await Round.findOneAndDelete({ clientId: req.params.clientId });
    
    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }
    
    res.json({ message: 'Round deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    // For a single user app, you could just store settings in a separate collection
    const settings = await mongoose.model('Settings').findOne() || { units: 'meters' };
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings
app.post('/api/settings', async (req, res) => {
  try {
    const Settings = mongoose.model('Settings', new mongoose.Schema({
      units: { type: String, default: 'meters' }
    }));
    
    let settings = await Settings.findOne();
    
    if (settings) {
      settings = await Settings.findOneAndUpdate(
        {},
        req.body,
        { new: true }
      );
    } else {
      settings = new Settings(req.body);
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sync status endpoint
app.get('/api/sync/status', async (req, res) => {
  try {
    res.json({
      lastSynced: new Date(),
      status: 'online'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));