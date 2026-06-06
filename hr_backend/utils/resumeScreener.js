/**
 * utils/resumeScreener.js — AI Resume Screening Engine
 *
 * Provides keyword-based resume screening that calculates a match score
 * (0-100) between a resume's text content and a job's required skills.
 *
 * Architecture Note:
 * ─────────────────
 * This module is intentionally designed as a drop-in replacement zone.
 * The `extractTextFromPDF` function currently uses the `pdf-parse` library.
 * The `calculateScreeningScore` function uses a weighted keyword-matching
 * algorithm. In production you can swap either function for:
 *   - A call to OpenAI / Anthropic for semantic matching
 *   - A dedicated resume parsing microservice
 *   - An ML model endpoint
 * ...without touching any controller code.
 *
 * Scoring Algorithm:
 * ──────────────────
 * Base score  = (matched skills / total required skills) × 70
 * Bonus score = frequency bonus capped at 30 points
 *               (rewards resumes that mention skills multiple times,
 *                indicating depth rather than mere token presence)
 * Final score = Math.min(100, base + bonus), rounded to 1 decimal place
 */

const fs       = require('fs');
const path     = require('path');
const pdfParse = require('pdf-parse');

// ─── Text Extraction ──────────────────────────────────────────────────────────

/**
 * Extracts raw text from a PDF file at the given absolute path.
 *
 * @param {string} filePath — Absolute path to the PDF
 * @returns {Promise<string>} — Extracted text (lowercased for matching)
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);
    // Lowercase once here so all downstream matching is case-insensitive
    return parsed.text.toLowerCase();
  } catch (err) {
    // If parsing fails (scanned PDF, corrupt file, etc.) return empty string
    // so the application is still created with a score of 0 rather than crashing
    console.warn(`[ResumeScreener] Could not extract text from ${path.basename(filePath)}: ${err.message}`);
    return '';
  }
};

// ─── Scoring Logic ────────────────────────────────────────────────────────────

/**
 * Counts how many times a skill keyword appears in the resume text.
 * Uses word-boundary matching to avoid false positives
 * (e.g. "java" should not match "javascript" unless "javascript" is the skill).
 *
 * @param {string} text  — Lowercased resume text
 * @param {string} skill — Lowercased skill keyword
 * @returns {number} occurrence count
 */
const countOccurrences = (text, skill) => {
  // Escape special regex characters in the skill name
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex   = new RegExp(`\\b${escaped}\\b`, 'g');
  return (text.match(regex) || []).length;
};

/**
 * Calculates a screening score (0-100) for a resume against job skills.
 *
 * @param {string}   resumeText     — Extracted (lowercased) resume text
 * @param {string[]} requiredSkills — Array of lowercased skill keywords from the Job
 * @returns {number} score between 0 and 100
 */
const calculateScreeningScore = (resumeText, requiredSkills) => {
  if (!resumeText || requiredSkills.length === 0) return 0;

  let matchedSkills  = 0;
  let frequencyBonus = 0;

  for (const skill of requiredSkills) {
    const count = countOccurrences(resumeText, skill);

    if (count > 0) {
      matchedSkills++;
      // Add diminishing bonus for repeated mentions (max 3 per skill)
      frequencyBonus += Math.min(count, 3);
    }
  }

  // Base score: percentage of skills matched, weighted to 70 points
  const baseScore = (matchedSkills / requiredSkills.length) * 70;

  // Bonus score: frequency depth, normalised to 30 points
  // Max raw bonus = requiredSkills.length * 3 occurrences
  const maxRawBonus  = requiredSkills.length * 3;
  const bonusScore   = maxRawBonus > 0 ? (frequencyBonus / maxRawBonus) * 30 : 0;

  const finalScore = Math.min(100, baseScore + bonusScore);

  return Math.round(finalScore * 10) / 10; // Round to 1 decimal place
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Master function: given a file path and job skills, returns the score.
 *
 * @param {string}   filePath       — Absolute path to the PDF resume
 * @param {string[]} requiredSkills — Array of skills from the Job document
 * @returns {Promise<{score: number, text: string}>}
 */
const screenResume = async (filePath, requiredSkills) => {
  const text  = await extractTextFromPDF(filePath);
  const score = calculateScreeningScore(text, requiredSkills);
  return { score, extractedTextLength: text.length };
};

module.exports = { screenResume, calculateScreeningScore, extractTextFromPDF };
