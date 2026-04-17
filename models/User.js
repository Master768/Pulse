/**
 * USER MODEL
 * 
 * This schema defines the structure for user accounts. 
 * It handles core identity data (name, email), security (hashed passwords), 
 * and application state (onboarding status, persona).
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Prevents multiple accounts with the same email
    lowercase: true,
    trim: true,
    index: true // Optimized for fast login lookups
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false // SECURITY: Prevents password from being included in API responses by default
  },
  /**
   * PERSONA
   * A behavioral classification used for initial dashboard tailoring.
   */
  persona: {
    type: String,
    enum: {
      values: ['balanced', 'high_stress', 'low_sleep', 'high_performer'],
      message: 'Invalid persona type'
    },
    default: 'balanced'
  },
  onboardingComplete: {
    type: Boolean,
    default: false // Tracks if the user has finished the initial setup walkthrough
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatic fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- SECURITY HOOKS ---

/**
 * PRE-SAVE HOOK
 * This function runs automatically before a user is saved to the database.
 * If the password has been changed, it hashes it using bcrypt for secure storage.
 */
userSchema.pre('save', async function() {
  // Only hash the password if it's new or being updated
  if (!this.isModified('password')) {
    return;
  }
  
  // Higher rounds = more secure but slower. 10 is the industry baseline.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- HELPER METHODS ---

/**
 * COMPARES PASSWORDS
 * Used during login to check if the entered password matches the stored hash.
 * 
 * @param {string} enteredPassword - The plain text password from the login form
 * @returns {Promise<boolean>} - True if they match
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;


