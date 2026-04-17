/**
 * PULSE Backend Server Entry Point
 * 
 * This file initializes the Express application, connects to the database,
 * configures security middleware, and mounts all API routes.
 */

const express = require('express');
const dotenv = require('dotenv');

// Load environment variables FIRST to ensure they are available to other modules
dotenv.config();

const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Utility and Middleware imports
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// route files: These define the endpoints for different features
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const benchmarkRoutes = require('./routes/benchmarkRoutes');

// Connect to MongoDB using the configuration in ./config/db.js
connectDB();

const app = express();

/**
 * BODY PARSER
 * Allows the server to accept and process JSON data from requests
 */
app.use(express.json());

/**
 * CORS CONFIGURATION (Cross-Origin Resource Sharing)
 * Determines which frontend domains are allowed to talk to this backend.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://pulse-delta-sandy.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean).map(url => url.replace(/\/$/, '')); // Cleanup trailing slashes

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    // In production, strictly match; in dev, allow everything
    if (allowedOrigins.indexOf(normalizedOrigin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

/**
 * SECURITY MIDDLEWARE
 * Helmet helps secure Express apps by setting various HTTP headers
 */
app.use(helmet());

/**
 * RATE LIMITING
 * Prevents brute-force attacks by limiting the number of requests from a single IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 attempts per window
  message: 'Too many authentication attempts, please try again after 15 minutes'
});

// Apply rate limiting to sensitive authentication routes
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/auth/signup', authLimiter);
  app.use('/api/auth/login', authLimiter);
}

/**
 * DEVELOPMENT LOGGING
 * Provides colored logs in the terminal during development
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * MOUNT ROUTERS
 * Maps URL paths to their respective route files
 */
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/benchmark', benchmarkRoutes);

/**
 * ROOT ROUTE
 * Simple heartbeat endpoint to verify the API is running
 */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PULSE Backend API' });
});

/**
 * ERROR HANDLING
 * Centralized middleware to catch and format errors cleanly for the client
 */
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

/**
 * SERVER STARTUP
 * Only starts listening if not running in a test environment
 */
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 PULSE Backend Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle errors that happen outside of standard request flows (e.g., DB connection loss)
  process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    // Close server and exit process safely
    server.close(() => process.exit(1));
  });
}

module.exports = app; // Exported for integration testing

