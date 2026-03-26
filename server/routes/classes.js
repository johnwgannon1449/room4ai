const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get ALL classes for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM classes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ classes: result.rows });
  } catch (err) {
    console.error('Get classes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single class by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM classes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Class not found' });
    res.json({ class: result.rows[0] });
  } catch (err) {
    console.error('Get class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new class
router.post('/', authMiddleware, async (req, res) => {
  const {
    teacher_name, grade, subject, school_name, class_date,
    warmup_activity, warmup_duration, exit_ticket,
    differentiation_notes, materials, homework_reminder, default_duration,
  } = req.body;

  if (!teacher_name || !grade || !subject) {
    return res.status(400).json({ error: 'Teacher name, grade, and subject are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO classes
        (user_id, teacher_name, grade, subject, school_name, class_date,
         warmup_activity, warmup_duration, exit_ticket, differentiation_notes, materials, homework_reminder, default_duration)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        req.userId, teacher_name, grade, subject,
        school_name || null, class_date || null,
        warmup_activity || null, warmup_duration || null,
        exit_ticket || null, differentiation_notes || null,
        materials || null, homework_reminder || null,
        default_duration || null,
      ]
    );

    await pool.query('UPDATE users SET name = $1 WHERE id = $2', [teacher_name, req.userId]);
    res.status(201).json({ class: result.rows[0] });
  } catch (err) {
    console.error('Create class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update existing class
router.patch('/:id', authMiddleware, async (req, res) => {
  const {
    teacher_name, grade, subject, school_name, class_date,
    warmup_activity, warmup_duration, exit_ticket,
    differentiation_notes, materials, homework_reminder, default_duration,
  } = req.body;

  try {
    const existing = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!existing.rows[0]) return res.status(404).json({ error: 'Class not found' });

    const result = await pool.query(
      `UPDATE classes SET
        teacher_name = COALESCE($1, teacher_name),
        grade = COALESCE($2, grade),
        subject = COALESCE($3, subject),
        school_name = $4,
        class_date = $5,
        warmup_activity = $6,
        warmup_duration = $7,
        exit_ticket = $8,
        differentiation_notes = $9,
        materials = $10,
        homework_reminder = $11,
        default_duration = $12
       WHERE id = $13 AND user_id = $14
       RETURNING *`,
      [
        teacher_name, grade, subject,
        school_name || null, class_date || null,
        warmup_activity || null, warmup_duration || null,
        exit_ticket || null, differentiation_notes || null,
        materials || null, homework_reminder || null,
        default_duration !== undefined ? (default_duration || null) : null,
        req.params.id, req.userId,
      ]
    );

    if (teacher_name) {
      await pool.query('UPDATE users SET name = $1 WHERE id = $2', [teacher_name, req.userId]);
    }

    res.json({ class: result.rows[0] });
  } catch (err) {
    console.error('Update class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a class
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM classes WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Class not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete class error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
