const axios = require('axios');
const DailyLog = require('../models/DailyLog');
const Prediction = require('../models/Prediction');

// @desc    Create daily log and get prediction
// @route   POST /api/logs
// @access  Private
const createLog = async (req, res, next) => {
  try {
    const { 
      sleepHours, studyHours, screenTimeHours,
      exerciseMins, moodScore, stressLevel, 
      caffeineIntake, waterLitres, deepFocusBlocks, 
      socialMediaMins, date, dayOfWeek, isWeekend 
    } = req.body;

    // 1. Save or Update Daily Log (Strict DayKey-Based Matching with Legacy Date Fallback)
    const logDate = date ? new Date(date) : new Date();
    // Normalize to YYYY-MM-DD for the unique dayKey
    const dayKey = req.body.dayKey || logDate.toISOString().split('T')[0];

    // Find all logs for this day to handle existing duplicates (Legacy & DayKey)
    const dayStart = new Date(logDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    let existingLogs = await DailyLog.find({
      userId: req.user.id,
      $or: [
        { dayKey }, // Standard (Newer records)
        { date: { $gte: dayStart, $lte: dayEnd } } // Legacy (Older records without dayKey)
      ]
    }).sort({ updatedAt: -1 });

    let log;
    let wasAlreadyPresent = false;

    const updateData = {
      sleepHours,
      studyHours,
      screenTimeHours,
      exerciseMins,
      moodScore,
      stressLevel,
      caffeineIntake,
      waterLitres,
      deepFocusBlocks,
      socialMediaMins,
      dayOfWeek,
      isWeekend,
      dayKey, // Always ensure dayKey is set now
      is_completed: true
    };

    if (existingLogs.length > 0) {
      log = existingLogs[0];
      wasAlreadyPresent = true;
      Object.assign(log, updateData);
      await log.save();

      // CLEANUP: If there were duplicates (Legacy or previous bug), remove the older ones
      if (existingLogs.length > 1) {
        const idsToCleanup = existingLogs.slice(1).map(l => l._id);
        await DailyLog.deleteMany({ _id: { $in: idsToCleanup } });
        await Prediction.deleteMany({ logId: { $in: idsToCleanup } });
      }
    } else {
      log = await DailyLog.create({
        userId: req.user.id,
        date: logDate,
        ...updateData
      });
    }

    // 2. Prepare data for Flask ML API (snake_case)
    const mlPayload = {
      sleep_hours: sleepHours,
      study_hours: studyHours,
      screen_time_hours: screenTimeHours,
      exercise_mins: exerciseMins,
      mood_score: moodScore,
      stress_level: stressLevel,
      caffeine_intake: caffeineIntake,
      water_litres: waterLitres,
      deep_focus_blocks: deepFocusBlocks,
      social_media_mins: socialMediaMins,
      focus_duration_mins: log.has_focus_session ? log.focus_duration_mins : 227,
      focus_quality_score: log.has_focus_session ? log.focus_quality_score : 3.67,
      distraction_level_encoded: log.has_focus_session ? log.distraction_level_encoded : 1,
      day_of_week: dayOfWeek,
      is_weekend: isWeekend ? 1 : 0
    };

    let mlResponse;
    try {
      const flaskUrl = process.env.FLASK_API_URL || 'http://127.0.0.1:5000/predict';
      mlResponse = await axios.post(flaskUrl, mlPayload);
    } catch (error) {
      console.error(`❌ ML API Error: ${error.message} - Using Synthetic Fallback`);
      let prodScore = 80;
      let risk = 'Low';
      if (mlPayload.sleep_hours < 6 || mlPayload.stress_level >= 4) {
         risk = 'High'; prodScore -= 25;
      }
      mlResponse = {
        data: {
          data: {
            productivity_score: prodScore,
            burnout_risk: risk,
            burnout_confidence_scores: { Low: 0.8, Medium: 0.15, High: 0.05 },
            persona: risk === 'High' ? 'Overworked Achiever' : 'Balanced Optimizer',
            cluster_id: risk === 'High' ? 2 : 1,
            top_positive_factors: ['sleep_hours'],
            top_negative_factors: ['stress_level']
          }
        }
      };
    }

    const { 
      productivity_score, burnout_risk, burnout_confidence_scores, 
      persona, cluster_id, top_positive_factors, top_negative_factors 
    } = mlResponse.data.data;

    // 4. Save/Update Prediction (Upsert) - Rounding Score for consistency
    const prediction = await Prediction.findOneAndUpdate(
      { logId: log._id },
      {
        userId: req.user.id,
        productivityScore: Math.round(productivity_score), // ROUND SCORE
        burnoutRisk: burnout_risk,
        burnoutConfidence: burnout_confidence_scores,
        primaryConfidence: burnout_confidence_scores[burnout_risk],
        persona,
        clusterId: cluster_id,
        topPositiveFactors: top_positive_factors,
        topNegativeFactors: top_negative_factors,
        isEdited: wasAlreadyPresent,
        date: log.date
      },
      { upsert: true, new: true }
    );


    res.status(201).json({
      success: true,
      data: {
        log,
        prediction
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all daily logs for the user
// @route   GET /api/logs
// @access  Private
const getLogs = async (req, res, next) => {
  try {
    const logs = await DailyLog.find({ userId: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add focus data to today's log
// @route   POST /api/logs/focus
// @access  Private
const addFocusData = async (req, res, next) => {
  try {
    const { focusDurationMins, focusQualityScore, distractionLevel } = req.body;

    // Find today's log
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let log = await DailyLog.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!log) {
      log = new DailyLog({
        userId: req.user.id,
        date: new Date(),
        is_completed: false,
        has_focus_session: true,
        focus_duration_mins: focusDurationMins,
        focus_quality_score: focusQualityScore,
        distraction_level: distractionLevel,
        distraction_level_encoded: distractionLevel === 'Heavy' ? 2 : (distractionLevel === 'Mild' ? 1 : 0)
      });
      // Set default dummy values for dayOfWeek/isWeekend as they are required for ML API fallback
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      log.dayOfWeek = days[log.date.getDay()];
      log.isWeekend = (log.date.getDay() === 0 || log.date.getDay() === 6);
      await log.save();
    } else {
      // Accumulate existing log
      const oldDuration = log.focus_duration_mins || 0;
      const oldQuality = log.focus_quality_score || 0;

      log.focus_duration_mins = oldDuration + focusDurationMins;
      // Simple rolling average for quality score
      log.focus_quality_score = oldQuality === 0 ? focusQualityScore : Number(((oldQuality + focusQualityScore) / 2).toFixed(2));
      
      // Inherit worst distraction scenario or just latest
      log.distraction_level = distractionLevel === 'Heavy' || log.distraction_level === 'Heavy' ? 'Heavy' : distractionLevel;
      log.distraction_level_encoded = log.distraction_level === 'Heavy' ? 2 : (log.distraction_level === 'Mild' ? 1 : 0);
      log.has_focus_session = true;
      await log.save();
    }

    // Call ML API again to recalculate prediction
    const mlPayload = {
      sleep_hours: log.is_completed ? log.sleepHours : 7.0,
      study_hours: log.is_completed ? log.studyHours : 4.0,
      screen_time_hours: log.is_completed ? log.screenTimeHours : 4.0,
      exercise_mins: log.is_completed ? log.exerciseMins : 30,
      mood_score: log.is_completed ? log.moodScore : 3,
      stress_level: log.is_completed ? log.stressLevel : 3,
      caffeine_intake: log.is_completed ? log.caffeineIntake : 1,
      water_litres: log.is_completed ? log.waterLitres : 2.0,
      deep_focus_blocks: log.is_completed ? log.deepFocusBlocks : 2,
      social_media_mins: log.is_completed ? log.socialMediaMins : 60,
      focus_duration_mins: log.focus_duration_mins,
      focus_quality_score: log.focus_quality_score,
      distraction_level_encoded: log.distraction_level_encoded,
      day_of_week: log.dayOfWeek,
      is_weekend: log.isWeekend ? 1 : 0
    };

    let mlResponse;
    try {
      const flaskUrl = process.env.FLASK_API_URL || 'http://127.0.0.1:5000/predict';
      mlResponse = await axios.post(flaskUrl, mlPayload);
    } catch (error) {
      console.error(`❌ ML API Error: ${error.message} - Using Synthetic Fallback`);
      let prodScore = 80;
      let risk = 'Low';
      if (mlPayload.sleep_hours < 6 || mlPayload.stress_level >= 4 || mlPayload.distraction_level_encoded === 2) {
         risk = 'High'; prodScore -= 15;
      }
      mlResponse = {
        data: {
          data: {
            productivity_score: prodScore,
            burnout_risk: risk,
            burnout_confidence_scores: { Low: 0.8, Medium: 0.15, High: 0.05 },
            persona: risk === 'High' ? 'Overworked Achiever' : 'Balanced Optimizer',
            cluster_id: risk === 'High' ? 2 : 1,
            top_positive_factors: ['focus_quality_score'],
            top_negative_factors: ['distraction_level_encoded']
          }
        }
      };
    }

    const { 
      productivity_score, burnout_risk, burnout_confidence_scores, 
      persona, cluster_id, top_positive_factors, top_negative_factors 
    } = mlResponse.data.data;

    const prediction = await Prediction.findOneAndUpdate(
      { logId: log._id },
      {
        userId: req.user.id,
        productivityScore: productivity_score,
        burnoutRisk: burnout_risk,
        burnoutConfidence: burnout_confidence_scores,
        primaryConfidence: burnout_confidence_scores[burnout_risk],
        persona,
        clusterId: cluster_id,
        topPositiveFactors: top_positive_factors,
        topNegativeFactors: top_negative_factors,
        date: log.date
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: {
        log,
        prediction
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { createLog, getLogs, addFocusData };
