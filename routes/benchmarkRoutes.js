/**
 * BENCHMARK ROUTES
 * 
 * This file provides the endpoint for fetching social comparison data.
 * Because benchmarks contain sensitive user behavior data, this route 
 * is globally protected.
 */

const express = require('express');
const { getBenchmark } = require('../controllers/benchmarkController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Only authenticated users can access the benchmark comparison engine
router.get('/', protect, getBenchmark);

module.exports = router;

