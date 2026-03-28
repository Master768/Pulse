const express = require('express');
const { getBenchmark } = require('../controllers/benchmarkController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Only authenticated users can access the benchmark
router.get('/', protect, getBenchmark);

module.exports = router;
