/**
 * DATABASE CONFIGURATION
 * 
 * This file handles the connection to the MongoDB database using Mongoose.
 * It uses the 'MONGO_URI' from environment variables to establish a secure connection.
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB and logs the connection status.
 * If the connection fails, it logs the error and terminates the process.
 * 
 * WHY: Centralizing DB connection logic ensures consistency across the app.
 */
const connectDB = async () => {
  try {
    // Attempt to connect using the URI from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Output a success message with the host name for easy debugging
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If something goes wrong, log the detailed error message
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    // Exit the process with failure code '1' since the app cannot function without a DB
    process.exit(1);
  }
};

module.exports = connectDB;

