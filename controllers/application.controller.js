/**
 * controllers/application.controller.js — Application Lifecycle
 *
 * HR actions:
 *   getApplicationsByJob  GET  /api/applications/:jobId          — List + rank applications
 *   updateStatus          PATCH /api/applications/:id/status      — Shortlist/Reject/Onboard
 *   bulkUploadResumes     POST /api/applications/bulk-upload/:jobId — AI batch screening
 *
 * Candidate actions:
 *   uploadVideo           POST /api/applications/upload-video/:applicationId
 *   submitOnboarding      POST /api/applications/onboarding
 */

const path        = require('path');
const Application = require('../models/Application');
const Job         = require('../models/Job');
const { screenResume } = require('../utils/resumeScreener');

// ─────────────────────────────────────────────────────────────────────────────
// [HR] GET /api/applications/:jobId
// Returns all applications for a job, sorted by screeningScore DESC
// Supports: ?status=Shortlisted&page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Verify the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;

    const filter = { jobId };
    if (req.query.status) filter.status = req.query.status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('candidateId', 'name email')
        .sort({ screeningScore: -1, createdAt: -1 }) // Highest score first
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        job: { _id: job._id, title: job.title },
        applications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// [HR] PATCH /api/applications/:id/status
// Valid transitions: Applied → Shortlisted | Rejected; Shortlisted → Onboarded
// ─────────────────────────────────────────────────────────────────────────────
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Shortlisted', 'Rejected', 'Onboarded'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(422).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Business rule: only Shortlisted applications can be Onboarded
    if (status === 'Onboarded' && application.status !== 'Shortlisted') {
      return res.status(422).json({
        success: false,
        message: 'Only Shortlisted candidates can be moved to Onboarded.',
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to '${status}'.`,
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// [HR] POST /api/applications/bulk-upload/:jobId
// Accepts multiple PDF uploads, screens each against the job's requiredSkills,
// and creates Application documents with computed screeningScores.
// ─────────────────────────────────────────────────────────────────────────────
const bulkUploadResumes = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No PDF files were uploaded.',
      });
    }

    // Fetch the job to get requiredSkills
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const results = {
      created : [],
      skipped : [],  // Duplicate applications (same candidate + job)
      failed  : [],  // Files that errored during processing
    };

    /**
     * Process each resume sequentially to avoid DB write contention.
     * For large batches in production, consider a job queue (Bull/BullMQ).
     */
    for (const file of req.files) {
      try {
        // ── AI Screening: Extract text & compute score ────────────────────
        const absolutePath = path.resolve(file.path);
        const { score, extractedTextLength } = await screenResume(
          absolutePath,
          job.requiredSkills
        );

        // ── Build a placeholder candidateId from file name ────────────────
        // In a real bulk-upload flow you would match the filename/email to
        // an existing User, or create a pending User record.
        // Here we store the file path and score; HR can later link the record.
        //
        // NOTE: The unique index on {candidateId, jobId} prevents duplicates.
        // For bulk uploads without a known candidateId we use req.user._id as
        // a temporary owner — adjust this to your actual intake process.
        const application = await Application.create({
          candidateId   : req.user._id, // Replace with resolved candidate ID
          jobId,
          resumeUrl     : file.path.replace(/\\/g, '/'), // Normalise path separators
          screeningScore: score,
          status        : 'Applied',
        });

        results.created.push({
          filename       : file.originalname,
          applicationId  : application._id,
          screeningScore : score,
          extractedTextLength,
        });

      } catch (fileErr) {
        // Duplicate key = same candidate already applied
        if (fileErr.code === 11000) {
          results.skipped.push({
            filename: file.originalname,
            reason  : 'Duplicate application already exists.',
          });
        } else {
          results.failed.push({
            filename: file.originalname,
            reason  : fileErr.message,
          });
        }
      }
    }

    const statusCode = results.created.length > 0 ? 201 : 422;

    res.status(statusCode).json({
      success: results.created.length > 0,
      message: `Processed ${req.files.length} file(s). Created: ${results.created.length}, Skipped: ${results.skipped.length}, Failed: ${results.failed.length}.`,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// [Candidate] POST /api/applications/upload-video/:applicationId
// Attaches a video interview file to an existing application.
// ─────────────────────────────────────────────────────────────────────────────
const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file was uploaded.',
      });
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Guard: candidates can only update their own applications
    if (application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to update this application.',
      });
    }

    application.videoUrl = req.file.path.replace(/\\/g, '/');
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Video interview uploaded successfully.',
      data: {
        applicationId: application._id,
        videoUrl     : application.videoUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// [Candidate] POST /api/applications/onboarding
// Submits bank / document details; only allowed when status is 'Onboarded'.
//
// Expected body: { applicationId, bankAccountNumber, ifscCode, panNumber, ... }
// ─────────────────────────────────────────────────────────────────────────────
const submitOnboarding = async (req, res, next) => {
  try {
    const { applicationId, ...onboardingFields } = req.body;

    if (!applicationId) {
      return res.status(422).json({
        success: false,
        message: 'applicationId is required.',
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Guard: candidate can only submit their own onboarding data
    if (application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to update this application.',
      });
    }

    // Guard: only 'Onboarded' applications accept onboarding details
    if (application.status !== 'Onboarded') {
      return res.status(422).json({
        success: false,
        message: 'Onboarding details can only be submitted after the application is marked as Onboarded.',
      });
    }

    // Validate required onboarding fields
    const required = ['bankAccountNumber', 'ifscCode', 'panNumber'];
    const missing  = required.filter((f) => !onboardingFields[f]);
    if (missing.length) {
      return res.status(422).json({
        success: false,
        message: `Missing required onboarding fields: ${missing.join(', ')}.`,
      });
    }

    // Merge new data into existing onboardingData (allows partial updates)
    application.onboardingData = {
      ...application.onboardingData,
      ...onboardingFields,
      submittedAt: new Date().toISOString(),
    };

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding details submitted successfully.',
      data: {
        applicationId: application._id,
        status        : application.status,
        // Don't echo back raw sensitive data; just confirm receipt
        onboardingSubmitted: true,
        submittedAt: application.onboardingData.submittedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getApplicationsByJob,
  updateStatus,
  bulkUploadResumes,
  uploadVideo,
  submitOnboarding,
};
