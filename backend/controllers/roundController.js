const Round = require('../models/Round');
const Course = require('../models/Course');

// @desc    Get all rounds for logged in user
// @route   GET /api/rounds
// @access  Private
exports.getRounds = async (req, res) => {
  try {
    const rounds = await Round.find({ player: req.user.id })
      .populate('course', 'name location')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: rounds.length,
      data: rounds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single round
// @route   GET /api/rounds/:id
// @access  Private
exports.getRound = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id)
      .populate('course', 'name location holes');

    if (!round) {
      return res.status(404).json({
        success: false,
        message: `Round not found with id of ${req.params.id}`
      });
    }

    // Make sure the round belongs to logged in user
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this round'
      });
    }

    res.status(200).json({
      success: true,
      data: round
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new round
// @route   POST /api/rounds
// @access  Private
exports.createRound = async (req, res) => {
  try {
    // Add user to req.body
    req.body.player = req.user.id;

    // Check if course exists
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found with id of ${req.body.course}`
      });
    }

    const round = await Round.create(req.body);

    res.status(201).json({
      success: true,
      data: round
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update round
// @route   PUT /api/rounds/:id
// @access  Private
exports.updateRound = async (req, res) => {
  try {
    let round = await Round.findById(req.params.id);

    if (!round) {
      return res.status(404).json({
        success: false,
        message: `Round not found with id of ${req.params.id}`
      });
    }

    // Make sure user owns the round
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this round`
      });
    }

    round = await Round.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: round
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete round
// @route   DELETE /api/rounds/:id
// @access  Private
exports.deleteRound = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);

    if (!round) {
      return res.status(404).json({
        success: false,
        message: `Round not found with id of ${req.params.id}`
      });
    }

    // Make sure user owns the round
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this round`
      });
    }

    await round.deleteOne();

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

// @desc    Get round statistics
// @route   GET /api/rounds/:id/stats
// @access  Private
exports.getRoundStats = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);

    if (!round) {
      return res.status(404).json({
        success: false,
        message: `Round not found with id of ${req.params.id}`
      });
    }

    // Make sure user owns the round
    if (round.player.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to access this round`
      });
    }


    // Calculate statistics
    const totalHoles = round.holeResults.length;
    const fairwaysHit = round.holeResults.filter(hole => hole.fairwayHit === true).length;
    const fairwaysPlayed = round.holeResults.filter(hole => hole.fairwayHit !== null).length;
    const fairwayHitPercentage = fairwaysPlayed > 0 ? (fairwaysHit / fairwaysPlayed) * 100 : 0;
    
    const greensInRegulation = round.holeResults.filter(hole => hole.gir).length;
    const girPercentage = totalHoles > 0 ? (greensInRegulation / totalHoles) * 100 : 0;
    
    const totalPutts = round.holeResults.reduce((sum, hole) => sum + hole.putts, 0);
    const puttsPerHole = totalHoles > 0 ? totalPutts / totalHoles : 0;
    
    const totalChips = round.holeResults.reduce((sum, hole) => sum + hole.chips, 0);
    const chipsPerHole = totalHoles > 0 ? totalChips / totalHoles : 0;
    
    const totalPenalties = round.holeResults.reduce((sum, hole) => sum + hole.penalties, 0);
    
    // Calculate score in relation to par
    const course = await Course.findById(round.course);
    const totalPar = course ? course.holes.reduce((sum, hole) => sum + hole.par, 0) : 0;
    const scoreRelativeToPar = round.totalScore - totalPar;
    
    const stats = {
      totalScore: round.totalScore,
      scoreRelativeToPar,
      fairwayHitPercentage: parseFloat(fairwayHitPercentage.toFixed(1)),
      fairwaysHit,
      fairwaysPlayed,
      girPercentage: parseFloat(girPercentage.toFixed(1)),
      greensInRegulation,
      totalPutts,
      puttsPerHole: parseFloat(puttsPerHole.toFixed(1)),
      totalChips,
      chipsPerHole: parseFloat(chipsPerHole.toFixed(1)),
      totalPenalties
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};