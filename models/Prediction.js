const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  logId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyLog',
    required: [true, 'Log ID is required'],
    unique: true, // One prediction per log
    index: true
  },
  productivityScore: {
    type: Number,
    required: [true, 'Productivity score is required'],
    min: [0, 'Productivity score minimum is 0'],
    max: [100, 'Productivity score maximum is 100']
  },
  burnoutRisk: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Invalid burnout risk'
    },
    required: [true, 'Burnout risk is required']
  },
  burnoutConfidence: {
    type: Object, // Stores the full map: { Low: 0.8, Medium: 0.15, ... }
    required: [true, 'Burnout confidence scores are required']
  },
  primaryConfidence: {
    type: Number, // Stores the max confidence (0.0 to 1.0)
    required: [true, 'Primary confidence is required'],
    min: 0,
    max: 1
  },

  persona: {
    type: String,
    required: [true, 'Persona is required']
  },
  clusterId: {
    type: Number,
    required: [true, 'Cluster ID is required'],
    index: true
  },
  topPositiveFactors: {
    type: [String],
    default: []
  },
  topNegativeFactors: {
    type: [String],
    default: []
  },
  peer_benchmark: {
    sleep_percentile: { type: Number, min: 0, max: 100 },
    productivity_percentile: { type: Number, min: 0, max: 100 },
    focus_percentile: { type: Number, min: 0, max: 100 },
    burnout_percentile: { type: Number, min: 0, max: 100 },
    cluster_size: { type: Number },
    is_available: { type: Boolean, default: false }
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Composite index for fast lookup of predictions by user and date
predictionSchema.index({ userId: 1, date: -1 });

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;
