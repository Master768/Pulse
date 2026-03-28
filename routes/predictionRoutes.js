const express = require('express');
const router = express.Router();
const { getLatestPrediction, getPredictionHistory } = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');

router.get('/latest', protect, getLatestPrediction);
router.get('/history', protect, getPredictionHistory);

module.exports = router;
