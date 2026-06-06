/**
 * models/Job.js — Job Opening Schema
 *
 * Represents a job opening posted by an HR manager.
 * The `requiredSkills` array is central to the AI screening logic —
 * resume text is matched against these keywords to produce a screeningScore.
 */

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type    : String,
      required: [true, 'Job title is required'],
      trim    : true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type    : String,
      required: [true, 'Job description is required'],
      trim    : true,
    },

    /**
     * Skills used for AI resume screening.
     * Example: ['React', 'Node.js', 'MongoDB', 'REST API']
     * Each skill is normalised to lowercase on save for case-insensitive matching.
     */
    requiredSkills: {
      type    : [String],
      required: [true, 'At least one required skill must be specified'],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message  : 'requiredSkills must be a non-empty array',
      },
    },

    postedBy: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
    },

    isActive: {
      type   : Boolean,
      default: true, // Allows HR to soft-close a job without deletion
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
jobSchema.index({ postedBy: 1, createdAt: -1 });
jobSchema.index({ isActive: 1 });

// ─── Pre-save Hook: Normalise Skills ─────────────────────────────────────────
// Trim whitespace and lowercase each skill so matching is consistent
jobSchema.pre('save', function (next) {
  if (this.isModified('requiredSkills')) {
    this.requiredSkills = this.requiredSkills
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0); // Remove empty strings
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);
