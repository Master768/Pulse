const Prediction = require('../models/Prediction');

// @desc    Get latest prediction
// @route   GET /api/predictions/latest
// @access  Private
const getLatestPrediction = async (req, res, next) => {
  try {
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

// @desc    Get prediction history (last 30 days)
// @route   GET /api/predictions/history
// @access  Private
const getPredictionHistory = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
