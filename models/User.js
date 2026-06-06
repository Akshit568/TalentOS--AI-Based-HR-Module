/**
 * models/User.js — User Schema
 *
 * Represents all system actors: HR managers, Candidates, and Interviewers.
 * Passwords are hashed via a pre-save hook so the plain-text value is NEVER
 * written to the database.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const SALT_ROUNDS = 12; // NIST recommends ≥10; 12 gives good security/perf balance

const userSchema = new mongoose.Schema(
  {
    name: {
      type    : String,
      required: [true, 'Name is required'],
      trim    : true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type     : String,
      required : [true, 'Email is required'],
      unique   : true,
      lowercase: true,
      trim     : true,
      match    : [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    password: {
      type    : String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select  : false, // Never returned in queries unless explicitly requested
    },

    role: {
      type    : String,
      enum    : {
        values : ['HR', 'Candidate', 'Interviewer'],
        message: 'Role must be one of: HR, Candidate, Interviewer',
      },
      default: 'Candidate',
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }); // Already unique, but explicit index speeds lookups

// ─── Pre-save Hook: Hash Password ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only re-hash when the password field was modified (avoids hashing on other updates)
  if (!this.isModified('password')) return next();

  try {
    const salt    = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Instance Method: Verify Password ────────────────────────────────────────
/**
 * Compares a plain-text candidate password against the stored hash.
 * @param {string} candidatePassword — the raw password from the login request
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
