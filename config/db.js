/**
 * config/db.js — MongoDB Connection
 * Uses Mongoose to connect to the database defined in MONGO_URI.
 * Exits the process on a fatal connection error so the issue is
 * surfaced immediately rather than silently failing.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options remove deprecation warnings in Mongoose 7+
      // and are sensible defaults for production workloads.
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection failed: ${error.message}`);
    process.exit(1); // Fail fast — let process manager (PM2/Docker) restart
  }
};

module.exports = connectDB;
