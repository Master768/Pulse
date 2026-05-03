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

    // 2. DATA HYGIENE: Check if CURRENT user has at least 7 days of logs.
    const userLogCount = await DailyLog.countDocuments({ userId: req.user.id });
    
    if (userLogCount < 7) {
      return res.status(200).json({
        success: true,
        data: {
          is_available: false,
          message: 'Not enough data yet. Need 7 days of logs.'
        }
      });
    }

    // 3. FETCH PEER DATA: Get all predictions in the same cluster
    const clusterPredictions = await Prediction.find({ clusterId }).populate('logId');
    const validClusterPredictions = clusterPredictions.filter(p => p.userId);

    const uniqueUsersInCluster = new Set(validClusterPredictions.map(p => p.userId.toString()));

    /**
     * PRIVACY & ACCURACY CHECK
     * The < 10 unique users check is completely removed so the benchmark is available 
     * as long as the user themselves has 7 logs.
     */

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

    // 7. GENERATE CUSTOM INSIGHT MESSAGE
    let insight_message = "Keep tracking to refine your baseline.";
    if (userBurnout === 1) {
      insight_message = "Your burnout risk is elevated. Prioritize recovery and take a break.";
    } else if (userSleep > 0 && userSleep < 6) {
      insight_message = "Your sleep is low. Getting 7+ hours will drastically improve focus.";
    } else if (userProd >= 80) {
      insight_message = "Outstanding productivity! You're operating at peak efficiency.";
    } else if (userFocus >= 8) {
      insight_message = "Excellent focus quality. Your deep work sessions are highly effective.";
    } else if (percentiles.productivity_percentile > 50) {
      insight_message = "You are maintaining a strong, steady rhythm. Keep it up!";
    }

    res.status(200).json({
      success: true,
      data: {
        is_available: true,
        persona: latestPrediction.persona,
        metrics: percentiles,
        insight_message: insight_message
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getBenchmark };

