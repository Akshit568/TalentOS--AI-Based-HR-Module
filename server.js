/**
 * server.js — Application Entry Point
 * Bootstraps Express, applies global middleware, mounts route groups,
 * and starts the HTTP server.
 */

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const dotenv  = require('dotenv');
const path    = require('path');

// Load environment variables before anything else
dotenv.config();

const connectDB   = require('./config/db');
const authRoutes  = require('./routes/auth.routes');
const jobRoutes   = require('./routes/job.routes');
const appRoutes   = require('./routes/application.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const app = express();

// Connect to MongoDB
connectDB();

// ─── Global Middleware ────────────────────────────────────────────────────────

// Security headers (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// CORS — tighten allowedOrigins in production
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files as static assets (resumes, videos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/applications', appRoutes);

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅  Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
