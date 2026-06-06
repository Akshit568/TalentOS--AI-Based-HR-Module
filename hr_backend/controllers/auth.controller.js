/**
 * controllers/auth.controller.js — Authentication
 *
 * register : Creates a new user account and returns a signed JWT
 * login    : Verifies credentials and returns a signed JWT + user info
 *
 * The JWT payload deliberately carries only non-sensitive fields (id, role)
 * so the token can be safely inspected client-side without exposing PII.
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const {
  sendValidationError,
  validateRegister,
  validateLogin,
} = require('../middlewares/validate.middleware');

// ─── Helper: Sign JWT ─────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },   // Payload
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── Helper: Build safe user object (no password) ────────────────────────────
const sanitiseUser = (user) => ({
  _id      : user._id,
  name     : user.name,
  email    : user.email,
  role     : user.role,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    const errors = validateRegister(req.body);
    if (errors.length) return sendValidationError(res, errors);

    // Guard: email must be unique
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user — password is hashed by the pre-save hook in User.js
    const user = await User.create({ name, email, password, role });

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: sanitiseUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const errors = validateLogin(req.body);
    if (errors.length) return sendValidationError(res, errors);

    // Explicitly select password (excluded by default via schema `select: false`)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      // Deliberately vague message to prevent user enumeration attacks
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitiseUser(user),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
