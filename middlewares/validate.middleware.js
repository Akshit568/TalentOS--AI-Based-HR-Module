/**
 * middlewares/validate.middleware.js — Request Body Validation
 *
 * Lightweight validation helpers used inside controller functions
 * (or can be used as standalone middleware).
 *
 * Rather than pulling in a heavy validation library, these utilities
 * centralise the repetitive "check field, build error list" pattern.
 */

/**
 * Builds a 422 Unprocessable Entity response when validation fails.
 *
 * @param {object} res    — Express response object
 * @param {string[]} errors — Array of human-readable error messages
 */
const sendValidationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
};

/**
 * Validates the register request body.
 * Returns an array of error strings (empty = valid).
 */
const validateRegister = (body) => {
  const errors = [];
  const { name, email, password, role } = body;

  if (!name || name.trim().length < 2)
    errors.push('Name must be at least 2 characters.');

  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.push('A valid email address is required.');

  if (!password || password.length < 8)
    errors.push('Password must be at least 8 characters.');

  const validRoles = ['HR', 'Candidate', 'Interviewer'];
  if (role && !validRoles.includes(role))
    errors.push(`Role must be one of: ${validRoles.join(', ')}.`);

  return errors;
};

/**
 * Validates the login request body.
 */
const validateLogin = (body) => {
  const errors = [];
  const { email, password } = body;

  if (!email) errors.push('Email is required.');
  if (!password) errors.push('Password is required.');

  return errors;
};

/**
 * Validates job creation payload.
 */
const validateJob = (body) => {
  const errors = [];
  const { title, description, requiredSkills } = body;

  if (!title || title.trim().length < 3)
    errors.push('Job title must be at least 3 characters.');

  if (!description || description.trim().length < 10)
    errors.push('Job description must be at least 10 characters.');

  if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0)
    errors.push('requiredSkills must be a non-empty array of strings.');

  return errors;
};

module.exports = {
  sendValidationError,
  validateRegister,
  validateLogin,
  validateJob,
};
