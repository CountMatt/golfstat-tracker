const Shot = require('../models/Shot');
const Round = require('../models/Round');
const Course = require('../models/Course');
const { calculateDistance } = require('../utils/geoCalculations');

// @desc    Get all shots for a specific round
// @route   GET /api/rounds/:roundId/shots
// @access  Private
exports.getShotsByRound = async (req, res) => {
  try {
    const round = await Round.findById(req.params.roundId);
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: `Round not found with id of ${req.params.roundId}`
      });
    }
    
    // Make sure user owns the round
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access shots for this round'
      });
    }
    
    const shots = await Shot.find({ round: req.params.roundId }).sort({ hole: 1, shotNumber: 1 });
    
    res.status(200).json({
      success: true,
      count: shots.length,
      data: shots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get shots for a specific hole in a round
// @route   GET /api/rounds/:roundId/holes/:holeNumber/shots
// @access  Private
exports.getShotsByHole = async (req, res) => {
  try {
    const round = await Round.findById(req.params.roundId);
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: `Round not found with id of ${req.params.roundId}`
      });
    }
    
    // Make sure user owns the round
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access shots for this round'
      });
    }
    
    const shots = await Shot.find({ 
      round: req.params.roundId,
      hole: req.params.holeNumber
    }).sort({ shotNumber: 1 });
    
    res.status(200).json({
      success: true,
      count: shots.length,
      data: shots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new shot
// @route   POST /api/rounds/:roundId/shots
// @access  Private
exports.createShot = async (req, res) => {
  try {
    const round = await Round.findById(req.params.roundId);
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: `Round not found with id of ${req.params.roundId}`
      });
    }
    
    // Make sure user owns the round
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to add shots to this round'
      });
    }
    
    req.body.round = req.params.roundId;
    
    // If endLocation is missing, use GPS coordinates from req.body
    if (!req.body.endLocation && req.body.gpsCoordinates) {
      req.body.endLocation = {
        type: 'Point',
        coordinates: [req.body.gpsCoordinates.longitude, req.body.gpsCoordinates.latitude]
      };
      delete req.body.gpsCoordinates;
    }
    
    // Calculate distance if not provided
    if (!req.body.distance && req.body.startLocation && req.body.endLocation) {
      req.body.distance = calculateDistance(
        req.body.startLocation.coordinates[1], // startLat
        req.body.startLocation.coordinates[0], // startLng
        req.body.endLocation.coordinates[1],   // endLat
        req.body.endLocation.coordinates[0]    // endLng
      );
    }
    
    const shot = await Shot.create(req.body);
    
    res.status(201).json({
      success: true,
      data: shot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update shot
// @route   PUT /api/shots/:id
// @access  Private
exports.updateShot = async (req, res) => {
  try {
    let shot = await Shot.findById(req.params.id);
    
    if (!shot) {
      return res.status(404).json({
        success: false,
        message: `Shot not found with id of ${req.params.id}`
      });
    }
    
    // Check if user owns the round this shot belongs to
    const round = await Round.findById(shot.round);
    
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this shot'
      });
    }
    
    // Calculate distance if coordinates changed
    if ((req.body.startLocation || req.body.endLocation) && !req.body.distance) {
      const startLocation = req.body.startLocation || shot.startLocation;
      const endLocation = req.body.endLocation || shot.endLocation;
      
      req.body.distance = calculateDistance(
        startLocation.coordinates[1], // startLat
        startLocation.coordinates[0], // startLng
        endLocation.coordinates[1],   // endLat
        endLocation.coordinates[0]    // endLng
      );
    }
    
    shot = await Shot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: shot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete shot
// @route   DELETE /api/shots/:id
// @access  Private
exports.deleteShot = async (req, res) => {
  try {
    const shot = await Shot.findById(req.params.id);
    
    if (!shot) {
      return res.status(404).json({
        success: false,
        message: `Shot not found with id of ${req.params.id}`
      });
    }
    
    // Check if user owns the round this shot belongs to
    const round = await Round.findById(shot.round);
    
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this shot'
      });
    }
    
    await shot.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get distance to green
// @route   GET /api/rounds/:roundId/holes/:holeNumber/distance-to-green
// @access  Private
exports.getDistanceToGreen = async (req, res) => {
  try {
    const { roundId, holeNumber } = req.params;
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude coordinates'
      });
    }
    
    const round = await Round.findById(roundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: `Round not found with id of ${roundId}`
      });
    }
    
    // Make sure user owns the round
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this information'
      });
    }
    
    // Get course and find the specific hole
    const course = await Course.findById(round.course);
    const hole = course.holes.find(h => h.number === parseInt(holeNumber));
    
    if (!hole) {
      return res.status(404).json({
        success: false,
        message: `Hole ${holeNumber} not found in this course`
      });
    }
    
    // Calculate distance from current position to green
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      hole.greenLocation.coordinates[1],
      hole.greenLocation.coordinates[0]
    );
    
    res.status(200).json({
      success: true,
      data: {
        distanceToGreen: parseFloat(distance.toFixed(1)),
        units: 'yards' // or meters, depending on your preference
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};