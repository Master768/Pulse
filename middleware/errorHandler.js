/**
 * GLOBAL ERROR HANDLING MIDDLEWARE
 * 
 * This file serves as the centralized location for catching and formatting 
 * all errors that occur during the request-response cycle. It maps complex 
 * database errors to human-readable JSON responses.
 */

const errorHandler = (err, req, res, next) => {
  // Debug toggle for automated test runners
  if (process.env.NODE_ENV === 'test') {
    console.error('TEST_ERR:', err);
  }

  let error = { ...err };
  error.message = err.message;

  // Log detailed error stack to the terminal in development for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  /**
   * MONGOOSE ERROR MAPPINGS
   * We catch specific technical errors from the database and "translate" them 
   * into clean messages for the frontend.
   */

  // 1. CastError: Triggered when an invalid ID is passed (e.g., /api/logs/123-abc)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, error: message });
  }

  // 2. Error 11000: Triggered by unique index violations (e.g., duplicate emails)
  if (err.code === 11000) {
    const message = 'Account with this email already exists';
    return res.status(400).json({ success: false, error: message });
  }

  // 3. ValidationError: Triggered when required fields are missing or data fails validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, error: message });
  }

  // FINAL FALLBACK
  // If we don't recognize the specific error, we return a general 500 Server Error.
  const isProduction = process.env.NODE_ENV === 'production';
  const status = err.statusCode || error.statusCode || 500;
  const errMsg = err.message || error.message || 'Server Error';

  return res.status(status).json({
    success: false,
    error: errMsg,
    // Only show the technical stack trace if we are NOT in production
    stack: isProduction ? undefined : err.stack
  });
};

module.exports = errorHandler;

