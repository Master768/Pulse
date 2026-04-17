/**
 * BENCHMARK CONTROLLER
 * 
 * This file contains the logic for "Peer Benchmarking"—comparing a user's 
 * metrics against other similar users (within the same behavioral cluster).
 * It calculates percentiles for sleep, productivity, focus, and burnout.
 */

const DailyLog = require('../models/DailyLog');
const Prediction = require('../models/Prediction');

/**
 * GET USER PEER BENCHMARK
 * GET /api/benchmark
 * 
 * This function calculates where a user stands relative to their "behavioral peers".
 * Peers are defined as other users with the same ML-assigned 'clusterId'.
 */
const getBenchmark = async (req, res, next) => {
  try {
    // 1. GET USER CONTEXT: Fetch the most recent prediction and its cluster assignment
    const latestPrediction = await Prediction.findOne({ userId: req.user.id }).sort({ date: -1 });

    if (!latestPrediction) {
      return res.status(404).json({
        success: false,
        message: 'No predictions found for the user.'
      });
    }

    const clusterId = latestPrediction.clusterId;

    // 2. DATA HYGIENE: Filter for "Valid Peers"
    // To ensure accurate benchmarks, we only compare against users with at least 7 days of logs.
    const userLogCounts = await DailyLog.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $match: { count: { $gte: 7 } } }
    ]);
    const validUserIds = userLogCounts.map(u => u._id.toString());

    // 3. FETCH PEER DATA: Get all predictions in the same cluster from valid users
    const clusterPredictions = await Prediction.find({ clusterId }).populate('logId');
    const validClusterPredictions = clusterPredictions.filter(p => 
      p.userId && validUserIds.includes(p.userId.toString())
    );

    const uniqueUsersInCluster = new Set(validClusterPredictions.map(p => p.userId.toString()));

    /**
     * PRIVACY & ACCURACY CHECK
     * If there are fewer than 10 unique users in a cluster, we don't show 
     * benchmarks yet to avoid identification and statistical noise.
     */
    if (uniqueUsersInCluster.size < 10) {
      return res.status(200).json({
        success: true,
        data: {
          is_available: false,
          message: 'Not enough data yet'
        }
      });
    }

    // 4. PREPARE PERCENTILE ARRAYS
    const sleepHours = [];
    const productivityScores = [];
    const focusQualityScores = [];
    const burnoutRisks = [];

    // Map string risks to numbers for mathematical comparison (Higher = Better)
    const burnoutMap = { 'Low': 3, 'Medium': 2, 'High': 1 };

    validClusterPredictions.forEach(p => {
      if (p.productivityScore !== undefined) productivityScores.push(p.productivityScore);
      if (p.burnoutRisk) burnoutRisks.push(burnoutMap[p.burnoutRisk]);

      if (p.logId) {
        if (p.logId.sleepHours !== undefined) sleepHours.push(p.logId.sleepHours);
        if (p.logId.has_focus_session === true && p.logId.focus_quality_score !== undefined) {
          focusQualityScores.push(p.logId.focus_quality_score);
        }
      }
    });

    /**
     * HELPER: CALCULATE PERCENTILE
     * Returns a 0-100 score indicating how many peers have a lower value than the user.
     * E.g., 80th percentile means you scored better than 80% of your peers.
     */
    const calculatePercentile = (arr, value) => {
      if (arr.length === 0) return 0;
      let count = 0;
      arr.forEach(v => {
        if (v < value) count++;
      });
      return Math.round((count / arr.length) * 100);
    };

    // 5. EXTRACT USER VALUES
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

    // 6. GENERATE FINAL BENCHMARKS
    const percentiles = {
      sleep_percentile: calculatePercentile(sleepHours, userSleep),
      productivity_percentile: calculatePercentile(productivityScores, userProd),
      focus_percentile: calculatePercentile(focusQualityScores, userFocus),
      burnout_percentile: calculatePercentile(burnoutRisks, userBurnout),
      cluster_size: uniqueUsersInCluster.size,
      is_available: true
    };

    // Store benchmarks on the prediction for persistence
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

