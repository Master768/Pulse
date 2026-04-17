/**
 * LOG ROUTES
 * 
 * This file handles the endpoints related to daily activity logs.
 * It manages the creation of new audits and the recording of focus timer sessions.
 */

const express = require('express');
const router = express.Router();
const { createLog, getLogs, addFocusData } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

// --- DAILY AUDIT ENDPOINTS ---
// router.route('/') allows us to handle both GET and POST requests to the same URL path.
router.route('/')
  .post(protect, createLog) // Submitting a new daily audit
  .get(protect, getLogs);   // Fetching historical log entries

// --- FOCUS TIMER ENDPOINT ---
// Specifically handles the recording of a Pomodoro / Focus session
router.post('/focus', protect, addFocusData);

module.exports = router;

