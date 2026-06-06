/**
 * middlewares/error.middleware.js — Centralised Error Handling
 *
 * Two middleware functions mounted at the bottom of server.js:
 *   notFound    — Converts unmatched routes into a structured 404 response
 *   errorHandler — Catches all errors propagated via next(err) and returns
 *                  a consistent JSON error envelope
 *
 * The stack trace is omitted in production to avoid leaking implementation details.
 */

// ─── 404 Handler ─────────────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
const errorHandler = (err, _req, res, _next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message    || 'Internal Server Error';

  // ── Mongoose Specific Errors ──────────────────────────────────────────────

  // Cast error: invalid ObjectId (e.g. /api/jobs/not-an-id)
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid value for field '${err.path}': ${err.value}`;
  }

  // Duplicate key (unique index violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    statusCode  = 409;
    message     = `Duplicate value: '${err.keyValue?.[field]}' already exists for ${field}.`;
  }

  // Validation errors (required fields, enum mismatches, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message    = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  }

  // ── JWT Errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token.'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired. Please log in again.'; }

  // ── Multer Errors ─────────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message    = `File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE_MB || 10} MB.`;
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 413;
    message    = 'Too many files uploaded at once.';
  }

  // ── Response Envelope ─────────────────────────────────────────────────────
  const payload = {
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error ${statusCode}] ${message}`, err.stack);
  }

  res.status(statusCode).json(payload);
};

module.exports = { notFound, errorHandler };
