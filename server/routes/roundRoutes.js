// server/routes/roundRoutes.js
const express = require('express');
const router = express.Router();
const Round = require('../models/round');

// Get all rounds
router.get('/', async (req, res) => {
  try {
    const rounds = await Round.find().sort({ date: -1 });
    res.json(rounds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific round
router.get('/:id', async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }
    res.json(round);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a round by client ID
router.get('/client/:clientId', async (req, res) => {
  try {
    const round = await Round.findOne({ clientId: req.params.clientId });
    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }
    res.json(round);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new round
router.post('/', async (req, res) => {
  try {
    const round = new Round(req.body);
    const newRound = await round.save();
    res.status(201).json(newRound);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a round
router.put('/:id', async (req, res) => {
  try {
    const updatedRound = await Round.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRound) {
      return res.status(404).json({ message: 'Round not found' });
    }
    res.json(updatedRound);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a round by client ID
router.put('/client/:clientId', async (req, res) => {
  try {
    // Check if round exists
    let round = await Round.findOne({ clientId: req.params.clientId });
    
    if (round) {
      // Update existing round
      round = await Round.findOneAndUpdate(
        { clientId: req.params.clientId },
        { ...req.body, lastSynced: Date.now() },
        { new: true }
      );
      res.json(round);
    } else {
      // Create new round with clientId
      const newRound = new Round({
        ...req.body,
        clientId: req.params.clientId,
        lastSynced: Date.now()
      });
      await newRound.save();
      res.status(201).json(newRound);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a round
router.delete('/:id', async (req, res) => {
  try {
    const round = await Round.findByIdAndDelete(req.params.id);
    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }
    res.json({ message: 'Round deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a round by client ID
router.delete('/client/:clientId', async (req, res) => {
  try {
    const round = await Round.findOneAndDelete({ clientId: req.params.clientId });
    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }
    res.json({ message: 'Round deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk sync endpoint - for getting the app back in sync
router.post('/sync', async (req, res) => {
  try {
    const { rounds } = req.body;
    
    if (!rounds || !Array.isArray(rounds)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    const syncResults = {
      created: 0,
      updated: 0,
      failed: 0,
      details: []
    };
    
    // Process each round
    for (const round of rounds) {
      try {
        // Skip rounds without clientId
        if (!round.clientId) {
          syncResults.failed++;
          syncResults.details.push({
            status: 'failed',
            reason: 'Missing clientId',
            round: round
          });
          continue;
        }
        
        // Check if round exists
        const existingRound = await Round.findOne({ clientId: round.clientId });
        
        if (existingRound) {
          // Update round if local changes are newer
          const localUpdateTime = new Date(round.updatedAt || 0);
          const serverUpdateTime = new Date(existingRound.updatedAt || 0);
          
          if (localUpdateTime > serverUpdateTime) {
            await Round.findOneAndUpdate(
              { clientId: round.clientId },
              { ...round, lastSynced: Date.now() }
            );
            syncResults.updated++;
            syncResults.details.push({
              status: 'updated',
              roundId: existingRound._id,
              clientId: round.clientId
            });
          } else {
            // No update needed
            syncResults.details.push({
              status: 'skipped',
              reason: 'Server data newer',
              roundId: existingRound._id,
              clientId: round.clientId
            });
          }
        } else {
          // Create new round
          const newRound = new Round({
            ...round,
            lastSynced: Date.now()
          });
          await newRound.save();
          syncResults.created++;
          syncResults.details.push({
            status: 'created',
            roundId: newRound._id,
            clientId: round.clientId
          });
        }
      } catch (roundError) {
        syncResults.failed++;
        syncResults.details.push({
          status: 'failed',
          reason: roundError.message,
          clientId: round.clientId || 'unknown'
        });
      }
    }
    
    // Return sync results
    res.json({
      success: true,
      summary: syncResults
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats across all rounds
router.get('/stats/overall', async (req, res) => {
  try {
    const rounds = await Round.find();
    
    // Base stats init
    const stats = {
      roundCount: rounds.length,
      fairwayHitPercentage: 0,
      girPercentage: 0,
      averagePutts: 0,
      upAndDownPercentage: 0,
      sandSavePercentage: 0,
      averageScoreToPar: 0
    };
    
    // Counters for calculations
    let fairwaysHit = 0;
    let fairwaysPlayed = 0;
    let greensInRegulation = 0;
    let totalPutts = 0;
    let totalHoles = 0;
    let upAndDownAttempts = 0;
    let upAndDownsSuccessful = 0;
    let sandSaveAttempts = 0;
    let sandSavesSuccessful = 0;
    let totalScoreToPar = 0;
    
    // Calculate stats for all rounds
    rounds.forEach(round => {
      const roundHoles = round.holes || [];
      totalHoles += roundHoles.length;
      
      // Track score to par
      const scoreToPar = roundHoles.reduce((sum, hole) => sum + (hole.score - hole.par), 0);
      totalScoreToPar += scoreToPar;
      
      roundHoles.forEach(hole => {
        // Fairway hit stats (exclude Par 3 holes)
        if (hole.fairwayHit !== undefined && hole.par > 3) {
          fairwaysPlayed++;
          if (hole.fairwayHit === 'hit') {
            fairwaysHit++;
          }
        }
        
        // GIR stats
        if (hole.girHit) {
          greensInRegulation++;
        }
        
        // Putting stats
        if (hole.putts) {
          totalPutts += hole.putts;
        }
        
        // Up & Down stats
        if (hole.upAndDownAttempt) {
          upAndDownAttempts++;
          if (hole.upAndDownSuccess) {
            upAndDownsSuccessful++;
          }
        }
        
        // Sand save stats
        if (hole.fromSand) {
          sandSaveAttempts++;
          if (hole.upAndDownSuccess) {
            sandSavesSuccessful++;
          }
        }
      });
    });
    
    // Calculate percentages and averages
    stats.fairwayHitPercentage = fairwaysPlayed > 0 ? (fairwaysHit / fairwaysPlayed) * 100 : 0;
    stats.girPercentage = totalHoles > 0 ? (greensInRegulation / totalHoles) * 100 : 0;
    stats.averagePutts = totalHoles > 0 ? totalPutts / totalHoles : 0;
    stats.upAndDownPercentage = upAndDownAttempts > 0 ? (upAndDownsSuccessful / upAndDownAttempts) * 100 : 0;
    stats.sandSavePercentage = sandSaveAttempts > 0 ? (sandSavesSuccessful / sandSaveAttempts) * 100 : 0;
    stats.averageScoreToPar = rounds.length > 0 ? totalScoreToPar / rounds.length : 0;
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;