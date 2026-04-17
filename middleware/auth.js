/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * This middleware protects routes that require a logged-in user.
 * It verifies the JSON Web Token (JWT) sent in the request headers and 
 * attaches the authenticated user's data to the request object.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * PROTECT MIDDLEWARE
 * ensures the user is authorized before reaching the final route handler.
 * 
 * Logic:
 * 1. Checks for a Bearer token in the 'Authorization' header.
 * 2. Decodes and verifies the token using the secret key.
 * 3. Fetches the user from the database (minus the password) and attaches to 'req.user'.
 * 
 * INPUT: req.headers.authorization
 * OUTPUT: next() if successful, 401 Unauthorized if verification fails.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header (standard Bearer pattern)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. EXTRACT TOKEN: "Bearer <token_string>" -> split by space and take index 1
      token = req.headers.authorization.split(' ')[1];

      // 2. VERIFY TOKEN: Check signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. ATTACH USER: Add user details to 'req' so next handlers can use it (e.g., req.user.id)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }

      // Proceed to the next middleware or controller
      return next();
    } catch (error) {
      console.error(`❌ JWT Error: ${error.message}`);
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  // Handle case where no token was provided at all
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

module.exports = { protect };

