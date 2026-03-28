const DailyLog = require('../models/DailyLog');
const Prediction = require('../models/Prediction');

// @desc    Get user peer benchmark
// @route   GET /api/benchmark
// @access  Private
const getBenchmark = async (req, res, next) => {
  try {
    // Fetch the authenticated user's latest prediction
    const latestPrediction = await Prediction.findOne({ userId: req.user.id }).sort({ date: -1 });

    if (!latestPrediction) {
      return res.status(404).json({
        success: false,
        message: 'No predictions found for the user.'
      });
    }

    const clusterId = latestPrediction.clusterId;

    // Fetch all predictions in the same cluster to calculate percentiles (ensure they have >=7 days logic if strictly required)
    const clusterPredictions = await Prediction.find({ clusterId }).populate('logId');

    // Filter to ensure we only count users with >= 7 days of logs
    // To do this efficiently, we can aggregate the number of logs per user
    const userLogCounts = await DailyLog.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $match: { count: { $gte: 7 } } }
    ]);
    const validUserIds = userLogCounts.map(u => u._id.toString());

    // Filter the cluster predictions to only include those from valid users
    const validClusterPredictions = clusterPredictions.filter(p => 
      p.userId && validUserIds.includes(p.userId.toString())
    );

    // Get unique users count in this cluster
    const uniqueUsersInCluster = new Set(validClusterPredictions.map(p => p.userId.toString()));

    if (uniqueUsersInCluster.size < 10) {
      return res.status(200).json({
        success: true,
        data: {
          is_available: false,
          message: 'Not enough data yet'
        }
      });
    }

    // Prepare arrays to calculate percentiles
    const sleepHours = [];
    const productivityScores = [];
    const focusQualityScores = [];
    const burnoutRisks = [];

    // Helper to map burnout risk to a numerical value for percentile calculation
    // Lower risk is better, so Low = 3, Medium = 2, High = 1
    const burnoutMap = { 'Low': 3, 'Medium': 2, 'High': 1 };

    validClusterPredictions.forEach(p => {
      // Productivity and Burnout from Prediction
      if (p.productivityScore !== undefined) productivityScores.push(p.productivityScore);
      if (p.burnoutRisk) burnoutRisks.push(burnoutMap[p.burnoutRisk]);

      // Sleep and Focus Quality from joined DailyLog
      if (p.logId) {
        if (p.logId.sleepHours !== undefined) sleepHours.push(p.logId.sleepHours);
        if (p.logId.has_focus_session === true && p.logId.focus_quality_score !== undefined) {
          focusQualityScores.push(p.logId.focus_quality_score);
        }
      }
    });

    // Helper function to calculate percentile
    const calculatePercentile = (arr, value) => {
      if (arr.length === 0) return 0;
      let count = 0;
      arr.forEach(v => {
        if (v < value) count++;
      });
      return Math.round((count / arr.length) * 100);
    };

    // User's latest values
    let userSleep = 0, userFocus = 0;
    if (latestPrediction.logId) {
      const userLog = await DailyLog.findById(latestPrediction.logId);
      if (userLog) {
        userSleep = userLog.sleepHours || 0;
        userFocus = userLog.focus_quality_score || 0;
      }
    }
    const userProd = latestPrediction.productivityScore || 0;
    const userBurnout = burnoutMap[latestPrediction.burnoutRisk] || 0;

    const percentiles = {
      sleep_percentile: calculatePercentile(sleepHours, userSleep),
      productivity_percentile: calculatePercentile(productivityScores, userProd),
      focus_percentile: calculatePercentile(focusQualityScores, userFocus),
      burnout_percentile: calculatePercentile(burnoutRisks, userBurnout),
      cluster_size: uniqueUsersInCluster.size,
      is_available: true
    };

    // Update the prediction with the benchmark data
    latestPrediction.peer_benchmark = percentiles;
    await latestPrediction.save();

    res.status(200).json({
      success: true,
      data: {
        is_available: true,
        persona: latestPrediction.persona,
        metrics: percentiles
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getBenchmark };
