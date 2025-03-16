const express = require('express');
const { 
  getRounds,
  getRound,
  createRound,
  updateRound,
  deleteRound,
  getRoundStats
} = require('../controllers/roundController');
const { protect } = require('../middleware/auth');

// Include shot routes for nested routes
const shotsRouter = require('./shots');

const router = express.Router();

// Re-route into other resource routers
router.use('/:roundId/shots', shotsRouter);

router
  .route('/')
  .get(protect, getRounds)
  .post(protect, createRound);

router
  .route('/:id')
  .get(protect, getRound)
  .put(protect, updateRound)
  .delete(protect, deleteRound);

router
  .route('/:id/stats')
  .get(protect, getRoundStats);

module.exports = router;