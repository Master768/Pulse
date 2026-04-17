/**
 * PREDICTION CONTROLLER
 * 
 * This file handles the retrieval of ML-generated insights.
 * It provides endpoints for fetching the single most recent prediction 
 * and a historical list of predictions for trend analysis.
 */

const Prediction = require('../models/Prediction');

/**
 * GET LATEST PREDICTION
 * GET /api/predictions/latest
 * 
 * Fetches the most recent entry from the Prediction collection for the user.
 * Used primarily for the Dashboard "Pulse Score" and "Burnout Risk" widgets.
 */
const getLatestPrediction = async (req, res, next) => {
  try {
    // Sort by date descending (-1) to get the most recent one first
    const prediction = await Prediction.findOne({ userId: req.user.id }).sort({ date: -1 });

    if (!prediction) {
      return res.status(404).json({ success: false, error: 'No predictions found' });
    }

    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET PREDICTION HISTORY
 * GET /api/predictions/history
 * 
 * Fetches all predictions from the last 30 days.
 * Used for rendering historical graphs and timeline charts.
 */
const getPredictionHistory = async (req, res, next) => {
  try {
    // 1. CALCULATE WINDOW: Go back 30 days from today
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 2. QUERY: Find predictions for this user within the date range
    const predictions = await Prediction.find({
      userId: req.user.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLatestPrediction, getPredictionHistory };

