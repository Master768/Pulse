/**
 * DAILY LOG MODEL
 * 
 * This Mongoose schema defines the structure for storing a user's daily metrics.
 * It tracks physical health (sleep, water), cognitive output (study, focus), 
 * and psychological markers (mood, stress).
 */

const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // --- CORE HEALTH & PRODUCTIVITY METRICS ---
  
  sleepHours: {
    type: Number,
    required: [function() { return this.is_completed; }, 'Sleep hours are required'],
    min: [0, 'Sleep hours cannot be negative'],
    max: [24, 'Sleep hours cannot exceed 24']
  },
  studyHours: {
    type: Number,
    required: [function() { return this.is_completed; }, 'Study/Work hours are required'],
    min: [0, 'Study hours cannot be negative'],
    max: [24, 'Study hours cannot exceed 24']
  },
  screenTimeHours: {
    type: Number,
    required: [function() { return this.is_completed; }, 'Screen time hours are required'],
    min: [0, 'Screen time cannot be negative'],
    max: [24, 'Screen time cannot exceed 24']
  },
  exerciseMins: {
    type: Number,
    required: [function() { return this.is_completed; }, 'Exercise minutes are required'],
    min: [0, 'Exercise mins cannot be negative'],
    max: [1440, 'Exercise mins cannot exceed a full day (1440 mins)']
  },
  moodScore: {
    type: Number, // 1 (Poor) to 5 (Excellent)
    required: [function() { return this.is_completed; }, 'Mood score is required'],
    min: [1, 'Mood score minimum is 1'],
    max: [5, 'Mood score maximum is 5']
  },
  stressLevel: {
    type: Number, // 1 (Relaxed) to 5 (Extremely Stressed)
    required: [function() { return this.is_completed; }, 'Stress level is required'],
    min: [1, 'Stress level minimum is 1'],
    max: [5, 'Stress level maximum is 5']
  },
  caffeineIntake: {
    type: Number, // Measured in standard units (e.g., cups/mg)
    required: [function() { return this.is_completed; }, 'Caffeine intake is required'],
    min: [0, 'Caffeine intake cannot be negative'],
    default: 0
  },
  waterLitres: {
    type: Number,
    required: [function() { return this.is_completed; }, 'Water intake is required'],
    min: [0, 'Water intake cannot be negative'],
    default: 0
  },
  deepFocusBlocks: {
    type: Number, // Number of "Deep Work" sessions completed
    required: [function() { return this.is_completed; }, 'Deep focus blocks are required'],
    min: [0, 'Deep focus blocks cannot be negative'],
    default: 0
  },
  socialMediaMins: {
    type: Number,
    required: [function() { return this.is_completed; }, 'Social media mins are required'],
    min: [0, 'Social media mins cannot be negative'],
    default: 0
  },

  // --- FOCUS TIMER SPECIFIC DATA ---
  // These fields are populated by the interactive timer on the frontend
  
  focus_duration_mins: {
    type: Number,
    min: [0, 'Focus duration cannot be negative'],
    default: null
  },
  focus_quality_score: {
    type: Number,
    min: [1, 'Focus quality score minimum is 1'],    max: [5, 'Focus quality score maximum is 5'],
    default: null
  },
  distraction_level: {
    type: String,
    enum: {
      values: ['None', 'Mild', 'Heavy', null],
      message: 'Invalid distraction level'
    },
    default: null
  },
  distraction_level_encoded: {
    type: Number, // Numeric representation for ML Processing (0, 1, 2)
    enum: [0, 1, 2, null],
    default: null
  },
  has_focus_session: {
    type: Boolean,
    default: false
  },

  // --- LOG STATUS & TIME TRACKING ---
  
  is_completed: {
    type: Boolean,
    default: true // False if log is only partially filled (e.g., just focus timer)
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: [function() { return this.is_completed; }, 'Day of week is required']
  },
  isWeekend: {
    type: Boolean,
    required: [function() { return this.is_completed; }, 'isWeekend flag is required'],
    default: false
  },
  /**
   * dayKey: A unique string identifier (usually YYYY-MM-DD)
   * This is CRITICAL for preventing duplicate logs for the same day.
   */
  dayKey: {
    type: String,
    required: [true, 'Day key is required for uniqueness'],
    index: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatic fields
});

// Enforce strictly one log per user per local day key
dailyLogSchema.index({ userId: 1, dayKey: 1 }, { unique: true });

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

module.exports = DailyLog;

