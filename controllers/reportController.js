const DailyLog = require('../models/DailyLog');
const Prediction = require('../models/Prediction');
const mongoose = require('mongoose');

// @desc    Get weekly summary and trend data
// @route   GET /api/reports/summary
// @access  Private
const getWeeklySummary = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Aggregation for DailyLog Averages
    const logAverages = await DailyLog.aggregate([
      { $match: { userId: userId, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: null,
          avgSleepHours: { $avg: "$sleepHours" },
          avgStudyHours: { $avg: "$studyHours" },
          avgExerciseMins: { $avg: "$exerciseMins" },
          avgMoodScore: { $avg: "$moodScore" },
          avgStressLevel: { $avg: "$stressLevel" }
        }
      }
    ]);

    // 2. Aggregation for Prediction Averages
    const predictionAverages = await Prediction.aggregate([
      { $match: { userId: userId, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: null,
          avgProductivityScore: { $avg: "$productivityScore" }
        }
      }
    ]);

    // 3. Trend Data (7 days of history)
    const trends = await Prediction.find({
      userId: userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 }).select('date productivityScore burnoutRisk');

    res.status(200).json({
      success: true,
      data: {
        averages: {
          ...(logAverages[0] || {}),
          avgProductivityScore: predictionAverages[0]?.avgProductivityScore || 0
        },
        trends
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getWeeklySummary };
