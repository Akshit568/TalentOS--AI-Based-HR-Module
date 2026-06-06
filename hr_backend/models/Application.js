/**
 * models/Application.js — Job Application Schema
 *
 * Tracks the full lifecycle of a candidate's application:
 *   Applied → Shortlisted / Rejected → Onboarded
 *
 * Key fields:
 *   - screeningScore : AI-generated score (0-100) from resume keyword matching
 *   - videoUrl       : path to the candidate's recorded interview video
 *   - onboardingData : flexible object for sensitive docs (bank details, PAN, etc.)
 *                      stored only after status reaches 'Onboarded'
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
    },

    jobId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'Job',
      required: true,
    },

    /** Relative path (or URL) to the uploaded resume PDF */
    resumeUrl: {
      type   : String,
      default: null,
    },

    /** Relative path (or URL) to the uploaded video interview */
    videoUrl: {
      type   : String,
      default: null,
    },

    /**
     * AI screening score based on keyword match between resume text
     * and job.requiredSkills. Range: 0–100.
     */
    screeningScore: {
      type   : Number,
      default: 0,
      min    : [0,   'Score cannot be below 0'],
      max    : [100, 'Score cannot exceed 100'],
    },

    status: {
      type   : String,
      enum   : {
        values : ['Applied', 'Shortlisted', 'Rejected', 'Onboarded'],
        message: 'Invalid application status',
      },
      default: 'Applied',
    },

    /**
     * Flexible container for onboarding documents.
     * Populated only when status is 'Onboarded'.
     * Example keys: bankAccountNumber, ifscCode, panNumber, addressProofUrl
     *
     * NOTE: In production, encrypt sensitive fields at rest (e.g. via
     * mongoose-field-encryption or application-level AES-256 before save).
     */
    onboardingData: {
      type   : Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Prevent a candidate from applying to the same job twice
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

// Speed up queries for "all applications for a job sorted by score"
applicationSchema.index({ jobId: 1, screeningScore: -1 });

// Speed up HR status-filter queries
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
