const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM classes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.userId]
    );
    res.json({ class: result.rows[0] || null });
  } catch (err) {
    console.error('Get class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { teacher_name, grade, subject, school_name, class_date } = req.body;

  if (!teacher_name || !grade || !subject) {
    return res.status(400).json({ error: 'Teacher name, grade, and subject are required' });
  }

  try {
    // Upsert: delete old, insert new
    await pool.query('DELETE FROM classes WHERE user_id = $1', [req.userId]);

    const result = await pool.query(
      `INSERT INTO classes (user_id, teacher_name, grade, subject, school_name, class_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, teacher_name, grade, subject, school_name || null, class_date || null]
    );

    // Also update user name if different
    await pool.query('UPDATE users SET name = $1 WHERE id = $2', [teacher_name, req.userId]);

    res.status(201).json({ class: result.rows[0] });
  } catch (err) {
    console.error('Save class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
