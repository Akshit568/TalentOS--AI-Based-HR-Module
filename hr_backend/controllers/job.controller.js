/**
 * controllers/job.controller.js — Job Management (HR Only)
 *
 * createJob  : POST /api/jobs          — Create a new job opening
 * getAllJobs  : GET  /api/jobs          — List all active jobs (paginated)
 * getJobById : GET  /api/jobs/:id       — Get a single job's details
 */

const Job = require('../models/Job');
const {
  sendValidationError,
  validateJob,
} = require('../middlewares/validate.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/jobs
// ─────────────────────────────────────────────────────────────────────────────
const createJob = async (req, res, next) => {
  try {
    const { title, description, requiredSkills } = req.body;

    // Validate input
    const errors = validateJob(req.body);
    if (errors.length) return sendValidationError(res, errors);

    const job = await Job.create({
      title,
      description,
      requiredSkills, // normalised to lowercase by the pre-save hook
      postedBy: req.user._id,
    });

    // Populate postedBy for the response
    await job.populate('postedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Job created successfully.',
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jobs
// Supports: ?page=1&limit=10&active=true
// ─────────────────────────────────────────────────────────────────────────────
const getAllJobs = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;

    // Optionally filter by active status (default: only active jobs)
    const filter = {};
    if (req.query.active !== 'false') filter.isActive = true;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
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
// GET /api/jobs/:id
// ─────────────────────────────────────────────────────────────────────────────
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

module.exports = { createJob, getAllJobs, getJobById };
