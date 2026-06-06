/**
 * middlewares/auth.middleware.js — JWT Verification & RBAC
 *
 * Exports:
 *   protect(req, res, next)          — Verifies the Bearer JWT and attaches
 *                                      the decoded user payload to req.user
 *   authorise(...roles)(req,res,next) — Factory that gates a route to specific
 *                                       roles; must be chained AFTER protect()
 *
 * Usage:
 *   router.post('/jobs', protect, authorise('HR'), createJob);
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─── Token Extraction Helper ──────────────────────────────────────────────────
/**
 * Pulls the Bearer token from the Authorization header.
 * Returns the raw token string or null.
 */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  return null;
};

// ─── protect ─────────────────────────────────────────────────────────────────
/**
 * Middleware: Authenticate every incoming request.
 *
 * Steps:
 *  1. Extract token from Authorization header
 *  2. Verify signature + expiry
 *  3. Confirm the user still exists in the DB (handles deleted/deactivated accounts)
 *  4. Attach lean user object to req.user
 */
const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    // Verify will throw if the token is tampered with or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-query to ensure the account still exists (and fetch current role)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user; // Available downstream as req.user
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token.';

    return res.status(401).json({ success: false, message });
  }
};

// ─── authorise ────────────────────────────────────────────────────────────────
/**
 * Middleware factory: Role-Based Access Control (RBAC).
 *
 * @param  {...string} roles — One or more roles that may access the route
 *                             e.g. authorise('HR'), authorise('HR', 'Interviewer')
 * @returns Express middleware
 *
 * MUST be used after protect() so req.user is already populated.
 */
const authorise = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorised to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorise };
