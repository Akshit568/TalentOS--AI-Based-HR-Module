/**
 * config/multer.js — Multer Storage & Filter Configuration
 *
 * Exports two pre-configured multer instances:
 *   - resumeUpload : accepts PDF files only, stored under uploads/resumes/
 *   - videoUpload  : accepts common video formats, stored under uploads/videos/
 *
 * File names are sanitised and made unique with a timestamp + random suffix
 * to prevent collisions and directory traversal attacks.
 */

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const MAX_SIZE_BYTES = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a multer DiskStorage engine that saves files to `destination`.
 * The filename is: <timestamp>-<random>-<sanitised-original-name>
 */
const buildStorage = (destination) => {
  // Make sure the target directory exists
  fs.mkdirSync(destination, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const sanitised = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const unique    = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${sanitised}`;
      cb(null, unique);
    },
  });
};

// ─── File-type filters ────────────────────────────────────────────────────────

const pdfFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are accepted for resume uploads.'), false);
  }
};

const videoFilter = (_req, file, cb) => {
  const allowed = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported video format. Accepted: mp4, mpeg, mov, webm, avi.'), false);
  }
};

// ─── Exported Upload Instances ────────────────────────────────────────────────

/** For bulk resume screening — accepts up to 50 PDFs per request */
const resumeUpload = multer({
  storage   : buildStorage(path.join(__dirname, '..', 'uploads', 'resumes')),
  fileFilter: pdfFilter,
  limits    : { fileSize: MAX_SIZE_BYTES, files: 50 },
});

/** For single video interview uploads */
const videoUpload = multer({
  storage   : buildStorage(path.join(__dirname, '..', 'uploads', 'videos')),
  fileFilter: videoFilter,
  limits    : { fileSize: MAX_SIZE_BYTES * 20 }, // videos can be larger — 200 MB default
});

module.exports = { resumeUpload, videoUpload };
