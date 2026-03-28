const express = require('express');
const router = express.Router();
const { signUp, login, updateOnboarding } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signUp);
router.post('/login', login);
router.patch('/onboarding', protect, updateOnboarding);

module.exports = router;

