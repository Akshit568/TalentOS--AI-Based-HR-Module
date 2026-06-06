/**
 * routes/application.routes.js — Application Lifecycle Routes
 *
 * All routes require a valid JWT (protect middleware applied globally below).
 *
 * ── HR Only ──────────────────────────────────────────────────────────────────
 * GET   /api/applications/:jobId            — List applications for a job (sorted by score)
 * PATCH /api/applications/:id/status        — Update application status
 * POST  /api/applications/bulk-upload/:jobId — Bulk PDF upload + AI screening
 *
 * ── Candidate Only ───────────────────────────────────────────────────────────
 * POST  /api/applications/upload-video/:applicationId — Upload video interview
 * POST  /api/applications/onboarding                  — Submit onboarding details
 *
 * IMPORTANT — Route ordering:
 * Express matches routes top-to-bottom. Specific string segments
 * ('bulk-upload', 'upload-video', 'onboarding') MUST be declared BEFORE
 * parameterised routes ('/:jobId', '/:id/status') to prevent the router
 * from incorrectly treating the segment as an ID parameter.
 */

const express = require('express');
const router  = express.Router();

const { protect, authorise }         = require('../middlewares/auth.middleware');
const { resumeUpload, videoUpload }  = require('../config/multer');
const {
  getApplicationsByJob,
  updateStatus,
  bulkUploadResumes,
  uploadVideo,
  submitOnboarding,
} = require('../controllers/application.controller');

// ── All application routes require a valid JWT ────────────────────────────────
router.use(protect);

// ── Candidate Routes ──────────────────────────────────────────────────────────

/**
 * POST /api/applications/upload-video/:applicationId
 * Multer handles the single video file upload before the controller runs.
 * Field name expected in the multipart form: 'video'
 */
router.post(
  '/upload-video/:applicationId',
  authorise('Candidate'),
  videoUpload.single('video'),
  uploadVideo
);

/**
 * POST /api/applications/onboarding
 * JSON body — no file upload needed here.
 * Body: { applicationId, bankAccountNumber, ifscCode, panNumber, ... }
 */
router.post(
  '/onboarding',
  authorise('Candidate'),
  submitOnboarding
);

// ── HR Routes ─────────────────────────────────────────────────────────────────

/**
 * POST /api/applications/bulk-upload/:jobId
 * Multer parses up to 50 PDF files before the controller runs.
 * Field name expected in the multipart form: 'resumes'
 *
 * Multer errors (wrong file type, size exceeded) are forwarded to the
 * global errorHandler via the wrapper below.
 */
router.post(
  '/bulk-upload/:jobId',
  authorise('HR'),
  (req, res, next) => {
    // Wrap multer so its errors propagate through Express error middleware
    resumeUpload.array('resumes', 50)(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  bulkUploadResumes
);

/**
 * PATCH /api/applications/:id/status
 * Body: { status: 'Shortlisted' | 'Rejected' | 'Onboarded' }
 */
router.patch(
  '/:id/status',
  authorise('HR'),
  updateStatus
);

/**
 * GET /api/applications/:jobId
 * Query params: ?status=Shortlisted&page=1&limit=20
 */
router.get(
  '/:jobId',
  authorise('HR'),
  getApplicationsByJob
);

module.exports = router;
