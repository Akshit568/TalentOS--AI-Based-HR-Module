/**
 * routes/job.routes.js — Job Management Routes
 *
 * All routes are protected (require valid JWT).
 * Creation is restricted to HR role only.
 * Listing is open to all authenticated users (HR, Candidate, Interviewer).
 *
 * POST   /api/jobs      — Create a new job opening        [HR only]
 * GET    /api/jobs      — List all active jobs             [All roles]
 * GET    /api/jobs/:id  — Get a single job by ID           [All roles]
 */

const express = require('express');
const router  = express.Router();

const { protect, authorise } = require('../middlewares/auth.middleware');
const { createJob, getAllJobs, getJobById } = require('../controllers/job.controller');

// All job routes require authentication
router.use(protect);

router.post('/',    authorise('HR'), createJob);
router.get('/',     getAllJobs);
router.get('/:id',  getJobById);

module.exports = router;
