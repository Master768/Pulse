/**
 * AUTHENTICATION ROUTES
 * 
 * This file maps URL endpoints to the logic defined in authController.js.
 * It handles the entry points for user registration, login, and profile setup.
 */

const express = require('express');
const router = express.Router();
const { signUp, login, updateOnboarding } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// PUBLIC: Routes anyone can access
router.post('/signup', signUp);
router.post('/login', login);

// PRIVATE: Routes requiring a valid JWT token (via protect middleware)
router.patch('/onboarding', protect, updateOnboarding);

module.exports = router;


