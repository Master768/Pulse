/**
 * PREDICTION ROUTES
 * 
 * This file handles endpoints for retrieving ML-generated insights.
 * These routes are used by the Frontend Dashboard to display score trends 
 * and specific performance markers.
 */

const express = require('express');
const router = express.Router();
const { getLatestPrediction, getPredictionHistory } = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');

// Fetches the most recent Pulse Score and primary insights
router.get('/latest', protect, getLatestPrediction);

// Fetches a history of scores for rendering charts and graphs
router.get('/history', protect, getPredictionHistory);

module.exports = router;

