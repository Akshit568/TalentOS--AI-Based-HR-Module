/**
 * routes/auth.routes.js — Public Authentication Routes
 *
 * POST /api/auth/register — Create a new account
 * POST /api/auth/login    — Authenticate and receive a JWT
 *
 * These routes are intentionally PUBLIC (no protect middleware).
 */

const express = require('express');
const router  = express.Router();

const { register, login } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login',    login);

module.exports = router;
