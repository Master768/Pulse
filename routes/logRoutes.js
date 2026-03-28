const express = require('express');
const router = express.Router();
const { createLog, getLogs, addFocusData } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createLog)
  .get(protect, getLogs);

router.post('/focus', protect, addFocusData);

module.exports = router;
