const express = require('express');
const { 
  getShotsByRound,
  getShotsByHole,
  createShot,
  updateShot,
  deleteShot,
  getDistanceToGreen
} = require('../controllers/shotController');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getShotsByRound)
  .post(protect, createShot);

router
  .route('/:id')
  .put(protect, updateShot)
  .delete(protect, deleteShot);

router
  .route('/holes/:holeNumber')
  .get(protect, getShotsByHole);

router
  .route('/holes/:holeNumber/distance-to-green')
  .get(protect, getDistanceToGreen);

module.exports = router;