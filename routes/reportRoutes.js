const express = require('express');
const router = express.Router();
const { getWeeklySummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getWeeklySummary);

module.exports = router;
