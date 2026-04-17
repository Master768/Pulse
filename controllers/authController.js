/**
 * AUTHENTICATION CONTROLLER
 * 
 * This file contains the logic for managing user identity.
 * It handles registration (signup), authentication (login), and session 
 * token generation using JWT (JSON Web Tokens).
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * HELPER: GENERATE & SEND TOKEN
 * Creates a JWT and sends it back in a standard response format.
 * 
 * @param {Object} user - The user document from MongoDB
 * @param {number} statusCode - HTTP status code (e.g., 200, 201)
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  // 1. SIGN TOKEN: Create a token containing the user's ID
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d', // Defaults to 30 days
  });

  // 2. SEND RESPONSE: Return the token and public user data
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      persona: user.persona,
      onboardingComplete: user.onboardingComplete
    }
  });
};

/**
 * REGISTER USER
 * POST /api/auth/signup
 */
const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Create user: The Pre-Save hook in models/User.js handles password hashing
    const user = await User.create({
      name,
      email,
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    // Passes to middleware/errorHandler.js
    next(error);
  }
};

/**
 * LOGIN USER
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. VALIDATE INPUT: Ensure both fields are provided strings
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Please provide a valid email and password string' });
    }

    // 2. FIND USER: Explicitly select the password (since it's hidden by default in the model)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // 3. CHECK PASSWORD: Use our helper method in models/User.js
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // 4. GENERATE SESSION
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE ONBOARDING
 * PATCH /api/auth/onboarding
 */
const updateOnboarding = async (req, res, next) => {
  try {
    // Set onboarding to true and merge with any other provided profile updates
    const fieldsToUpdate = {
      onboardingComplete: true,
      ...req.body
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true, // Return the updated document not the old one
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signUp, login, updateOnboarding };

