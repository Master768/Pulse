const express = require('express');
const dotenv = require('dotenv');

// Load env vars FIRST
dotenv.config();

const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');


const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const benchmarkRoutes = require('./routes/benchmarkRoutes');

// Load env vars
// Moved to top


// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// NoSQL Injection Protection - Disabled due to compatibility issues with test runners
// if (process.env.NODE_ENV !== 'test') {
//   app.use(mongoSanitize());
// }



// Enable CORS with restrictions
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Set security headers
app.use(helmet());

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased to 100 for dev/prod flexibility
  message: 'Too many authentication attempts, please try again after 15 minutes'
});

if (process.env.NODE_ENV !== 'test') {
  app.use('/api/auth/signup', authLimiter);
  app.use('/api/auth/login', authLimiter);
}


// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/benchmark', benchmarkRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PULSE Backend API' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 PULSE Backend Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}


module.exports = app; // Export for testing
