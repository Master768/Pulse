/**
 * REPORT ROUTES
 * 
 * This file handles endpoints for high-level performance summaries.
 * These routes aggregate data into weekly or monthly views for the user.
 */

const express = require('express');
const router = express.Router();
const { getWeeklySummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Fetches the weekly average metrics (Sleep, Study, Focus, etc.)
router.get('/summary', protect, getWeeklySummary);

module.exports = router;

