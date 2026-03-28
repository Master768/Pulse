const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    console.error('TEST_ERR:', err);
  }

  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, error: message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Account with this email already exists';
    return res.status(400).json({ success: false, error: message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, error: message });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const status = err.statusCode || error.statusCode || 500;
  const errMsg = err.message || error.message || 'Server Error';

  return res.status(status).json({
    success: false,
    error: errMsg,
    stack: isProduction ? undefined : err.stack
  });
};




module.exports = errorHandler;
