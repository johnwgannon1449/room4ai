const express = require('express');
const authMiddleware = require('../middleware/auth');
const { CA_STANDARDS, getStandardsForGradeSubject } = require('../data/caStandards');

const router = express.Router();

// Get standards for a specific grade and subject
router.get('/', authMiddleware, async (req, res) => {
  const { grade, subject } = req.query;

  try {
    const standards = getStandardsForGradeSubject(grade, subject);
    res.json({ standards });
  } catch (err) {
    console.error('Standards error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all available grades and subjects
router.get('/catalog', authMiddleware, async (req, res) => {
  const catalog = {};
  for (const [subject, grades] of Object.entries(CA_STANDARDS)) {
    catalog[subject] = Object.keys(grades);
  }
  res.json({ catalog });
});

module.exports = router;
