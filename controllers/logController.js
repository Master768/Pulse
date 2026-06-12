/**
 * Log Controller
 * 
 * This controller manages the creation, retrieval, and processing of daily logs.
 * It also handles the integration with the ML API to provide real-time productivity
 * and burnout predictions whenever a log is submitted or updated.
 */

const axios = require('axios');
const DailyLog = require('../models/DailyLog');
const Prediction = require('../models/Prediction');
const User = require('../models/User');

/**
 * HELPER: Generate and Save Prediction
 * Extracts metrics from log, queries ML API (or uses fallback), and saves to Prediction DB.
 */
const generateAndSavePrediction = async (log, userId, isEdited) => {
  const mlPayload = {
    sleep_hours: log.sleepHours || 7.0,
    study_hours: log.studyHours || 4.0,
    screen_time_hours: log.screenTimeHours || 4.0,
    exercise_mins: log.exerciseMins || 30,
    mood_score: log.moodScore || 5,
    stress_level: log.stressLevel || 5,
    caffeine_intake: log.caffeineIntake || 0,
    water_litres: log.waterLitres || 2,
    deep_focus_blocks: log.deepFocusBlocks || 0,
    social_media_mins: log.socialMediaMins || 60,
    focus_duration_mins: log.has_focus_session ? log.focus_duration_mins : 227,
    focus_quality_score: log.has_focus_session ? log.focus_quality_score : 3.67,
    distraction_level_encoded: log.has_focus_session ? log.distraction_level_encoded : 1,
    day_of_week: log.dayOfWeek,
    is_weekend: log.isWeekend ? 1 : 0
  };

  let mlResponse;
  try {
    const flaskUrl = process.env.FLASK_API_URL || 'http://127.0.0.1:5000/predict';
    mlResponse = await axios.post(flaskUrl, mlPayload);
  } catch (error) {
    console.error(`❌ ML API Error: ${error.message} - Using Resilient Fallback`);
    
    let prodScore = 85; 
    let risk = 'Low';
    const posDetails = [];
    const negDetails = [];

    if (mlPayload.screen_time_hours > 6) {
        prodScore -= (mlPayload.screen_time_hours - 6) * 5;
        negDetails.push({ label: 'Screen Time', insight: 'High device usage is significantly draining your cognitive capacity.' });
    }
    if (mlPayload.stress_level > 3) {
        prodScore -= (mlPayload.stress_level - 3) * 10;
        risk = mlPayload.stress_level > 4 ? 'High' : 'Medium';
        negDetails.push({ label: 'Stress Levels', insight: 'Elevated stress is creating cognitive friction.' });
    }
    if (mlPayload.sleep_hours < 7) {
        prodScore -= 10;
        negDetails.push({ label: 'Sleep Quality', insight: 'Sub-optimal sleep duration is preventing full recovery.' });
    } else {
        posDetails.push({ label: 'Sleep Hygiene', insight: 'Solid sleep duration is providing a strong foundation.' });
    }

    mlResponse = {
      data: {
        data: {
          productivity_score: Math.max(0, Math.min(100, prodScore)),
          burnout_risk: risk,
          burnout_confidence_scores: { Low: 0.7, Medium: 0.2, High: 0.1 },
          persona: risk === 'High' ? 'Overworked Achiever' : 'Balanced Optimizer',
          cluster_id: risk === 'High' ? 2 : 1,
          top_positive_factors_detailed: posDetails,
          top_negative_factors_detailed: negDetails,
          top_positive_factors: posDetails.map(d => d.label),
          top_negative_factors: negDetails.map(d => d.label),
          factor_contributions: [],
          persona_reason: "Manual fallback calculation used based on metric thresholds."
        }
      }
    };
  }

  const { 
    productivity_score, burnout_risk, burnout_confidence_scores, 
    persona, cluster_id, top_positive_factors, top_negative_factors,
    top_positive_factors_detailed, top_negative_factors_detailed,
    factor_contributions, persona_reason
  } = mlResponse.data.data;

  const prediction = await Prediction.findOneAndUpdate(
    { logId: log._id },
    {
      userId: userId,
      productivityScore: Math.round(productivity_score),
      burnoutRisk: burnout_risk,
      burnoutConfidence: burnout_confidence_scores,
      primaryConfidence: burnout_confidence_scores[burnout_risk],
      persona,
      personaReason: persona_reason || "Consistent behavior detected.",
      clusterId: cluster_id,
      topPositiveFactors: top_positive_factors,
      topNegativeFactors: top_negative_factors,
      topPositiveFactorsDetailed: top_positive_factors_detailed || [],
      topNegativeFactorsDetailed: top_negative_factors_detailed || [],
      factorContributions: factor_contributions || [],
      isEdited: isEdited,
      date: log.date
    },
    { upsert: true, new: true }
  );

  // --- GAMIFICATION: UPDATE STREAKS ---
  if (persona === 'Balanced Optimizer') {
    const user = await User.findById(userId);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = user.lastBalancedDate ? user.lastBalancedDate.toISOString().split('T')[0] : null;
      
      if (lastDate !== today) {
        // If it's a new day, increment streak. 
        // Note: Simple logic here, doesn't check if yesterday was also balanced.
        user.streakCount += 1;
        user.lastBalancedDate = new Date();
        await user.save();
      }
    }
  }

  return prediction;
};

/**
 * @desc    Create daily log and get prediction
 * @route   POST /api/logs
 * @access  Private
 * 
 * INPUT: req.body (sleepHours, studyHours, screenTimeHours, exerciseMins, moodScore, etc.)
 * OUTPUT: 201 Created with log and prediction objects
 */
const createLog = async (req, res, next) => {
  try {
    const { 
      sleepHours, studyHours, screenTimeHours,
      exerciseMins, moodScore, stressLevel, 
      caffeineIntake, waterLitres, deepFocusBlocks, 
      socialMediaMins, date, dayOfWeek, isWeekend 
    } = req.body;

    // 1. DATA NORMALIZATION
    // We use a "dayKey" (YYYY-MM-DD) to ensure each user only has ONE log per day.
    const logDate = date ? new Date(date) : new Date();
    const dayKey = req.body.dayKey || logDate.toISOString().split('T')[0];

    // Check for existing logs on this day to prevent duplicates
    const dayStart = new Date(logDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    let existingLogs = await DailyLog.find({
      userId: req.user.id,
      $or: [
        { dayKey }, // Check by standard key
        { date: { $gte: dayStart, $lte: dayEnd } } // Check by legacy date range
      ]
    }).sort({ updatedAt: -1 });

    let log;
    let wasAlreadyPresent = false;

    // Prepare the update object
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
      dayKey,
      is_completed: true
    };

    /**
     * 2. LOG SAVING LOGIC (Upsert strategy)
     * If a log exists for today, we update it and delete any accidental duplicates.
     * If no log exists, we create a new one.
     */
    if (existingLogs.length > 0) {
      log = existingLogs[0];
      wasAlreadyPresent = true;
      Object.assign(log, updateData);
      await log.save();

      // CLEANUP: If duplicates were found, remove them to maintain data integrity
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

    /**
     * 3. ML API INTEGRATION & SAVE PREDICTION
     */
    const prediction = await generateAndSavePrediction(log, req.user.id, wasAlreadyPresent);

    res.status(201).json({
      success: true,
      data: { log, prediction }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all daily logs for the user
 * @route   GET /api/logs
 * @access  Private
 * 
 * OUTPUT: 200 OK with list of all logs for the authenticated user
 */
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

/**
 * @desc    Add focus data to today's log (from Focus Timer)
 * @route   POST /api/logs/focus
 * @access  Private
 * 
 * INPUT: req.body (focusDurationMins, focusQualityScore, distractionLevel)
 * WHY: This allows users to track their deep work sessions independently of 
 * their daily summary submission.
 */
const addFocusData = async (req, res, next) => {
  try {
    const { focusDurationMins, focusQualityScore, distractionLevel } = req.body;

    // Find today's log window (start and end of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let log = await DailyLog.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    /**
     * If no log exists for today yet, create a partial one.
     * This handles cases where a user starts a focus timer before filling out their day log.
     */
    if (!log) {
      log = new DailyLog({
        userId: req.user.id,
        date: new Date(),
        is_completed: false, // Mark as incomplete since health metrics are missing
        has_focus_session: true,
        focus_duration_mins: focusDurationMins,
        focus_quality_score: focusQualityScore,
        distraction_level: distractionLevel,
        distraction_level_encoded: distractionLevel === 'Heavy' ? 2 : (distractionLevel === 'Mild' ? 1 : 0)
      });
      
      // Auto-calculate structural fields
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      log.dayOfWeek = days[log.date.getDay()];
      log.isWeekend = (log.date.getDay() === 0 || log.date.getDay() === 6);
      await log.save();
    } else {
      // Accumulate focus data into the existing log
      const oldDuration = log.focus_duration_mins || 0;
      const oldQuality = log.focus_quality_score || 0;

      log.focus_duration_mins = oldDuration + focusDurationMins;
      // Rolling average for quality score to keep it representative
      log.focus_quality_score = oldQuality === 0 ? focusQualityScore : Number(((oldQuality + focusQualityScore) / 2).toFixed(2));
      
      // Inherit the "worst" distraction scenario detected today
      log.distraction_level = (distractionLevel === 'Heavy' || log.distraction_level === 'Heavy') ? 'Heavy' : distractionLevel;
      log.distraction_level_encoded = log.distraction_level === 'Heavy' ? 2 : (log.distraction_level === 'Mild' ? 1 : 0);
      log.has_focus_session = true;
      await log.save();
    }

    /**
     * TRIGGER RE-PREDICTION
     * After focus data changes, we must update the ML prediction to reflect
     * the new session impact.
     */
    await generateAndSavePrediction(log, req.user.id, true);
    
    res.status(200).json({
      success: true,
      data: { log, message: "Focus data synced. Re-calculating insights." }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { createLog, getLogs, addFocusData };

