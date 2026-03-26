const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// Voice transcription — must be before /:id routes
router.post('/transcribe', authMiddleware, upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'audio.webm',
      contentType: req.file.mimetype,
    });
    formData.append('model', 'whisper-1');

    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Transcription failed');
    res.json({ text: data.text });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed: ' + err.message });
  }
});

// AI mini-lesson suggestions for a missed standard — must be before /:id routes
router.post('/suggest-mini', authMiddleware, async (req, res) => {
  const { standard, grade, subject } = req.body;
  if (!standard) return res.status(400).json({ error: 'Standard is required' });

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Generate exactly 2-3 brief mini lesson activity ideas that specifically address this California state standard:

Standard: ${standard.code}: ${standard.description}
Grade: ${grade || 'K-12'}
Subject: ${subject || 'General'}

Requirements:
- Each activity should be 5-15 minutes and directly target the standard
- Make them practical, classroom-ready, and different from each other
- Be specific and actionable, not generic

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    {"title": "Activity Name", "description": "Clear step-by-step description of the activity.", "duration": "10 min"},
    {"title": "Activity Name", "description": "Clear step-by-step description.", "duration": "15 min"}
  ]
}`,
      }],
    });

    const text = message.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response');
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('Suggest mini error:', err);
    res.status(500).json({ error: 'Suggestion failed: ' + err.message });
  }
});

// AI coverage suggestions for missed standards — must be before /:id routes
router.post('/suggest-coverage', authMiddleware, async (req, res) => {
  const { missedStandards, lessonContent, grade, subject } = req.body;
  if (!missedStandards || !missedStandards.length) {
    return res.status(400).json({ error: 'missedStandards array is required' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const standardsList = missedStandards.map((s) => `${s.code}: ${s.description}`).join('\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: 'You are an expert California K-12 curriculum coach helping teachers improve their lesson plans to better cover state standards.',
      messages: [{
        role: 'user',
        content: `A teacher has a lesson plan that doesn't fully cover some California state standards. Suggest ways to address these gaps.

GRADE: ${grade || 'K-12'}
SUBJECT: ${subject || 'General'}

MISSED STANDARDS:
${standardsList}

CURRENT LESSON CONTENT (excerpt):
${(lessonContent || '').slice(0, 1500)}

Generate exactly 3 suggestions. Each must be one of these types:
- "Adaptation": Modify an existing part of the lesson to cover the standard
- "Add-on": A short addition (5-10 min) that can be appended to the lesson
- "New Section": A full new section (10-20 min) for deeper coverage

Return ONLY valid JSON:
{
  "suggestions": [
    {
      "type": "Adaptation",
      "title": "Short descriptive title",
      "description": "Clear, actionable description of what to do or add.",
      "estimated_minutes": 10
    }
  ]
}`,
      }],
    });

    const text = message.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response');
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('Suggest coverage error:', err);
    res.status(500).json({ error: 'Suggestion failed: ' + err.message });
  }
});

// Get all lessons for user (optionally filtered by class_id)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { class_id } = req.query;
    let query = 'SELECT id, title, grade, subject, current_step, status, class_id, created_at, updated_at FROM lessons WHERE user_id = $1';
    const params = [req.userId];
    if (class_id) {
      query += ` AND class_id = $2`;
      params.push(class_id);
    }
    query += ' ORDER BY updated_at DESC';
    const result = await pool.query(query, params);
    res.json({ lessons: result.rows });
  } catch (err) {
    console.error('Get lessons error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single lesson
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM lessons WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ lesson: result.rows[0] });
  } catch (err) {
    console.error('Get lesson error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create lesson
router.post('/', authMiddleware, async (req, res) => {
  const { title, grade, subject, step_data, current_step, class_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO lessons (user_id, class_id, title, grade, subject, step_data, current_step)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        req.userId,
        class_id || null,
        title || 'Untitled Lesson',
        grade || '',
        subject || '',
        JSON.stringify(step_data || {}),
        current_step || 1,
      ]
    );
    res.status(201).json({ lesson: result.rows[0] });
  } catch (err) {
    console.error('Create lesson error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update lesson (auto-save)
router.patch('/:id', authMiddleware, async (req, res) => {
  const { title, grade, subject, step_data, current_step, status, class_id } = req.body;

  try {
    const existing = await pool.query(
      'SELECT id FROM lessons WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!existing.rows[0]) return res.status(404).json({ error: 'Lesson not found' });

    const updates = [];
    const values = [];
    let i = 1;

    if (title !== undefined) { updates.push(`title = $${i++}`); values.push(title); }
    if (grade !== undefined) { updates.push(`grade = $${i++}`); values.push(grade); }
    if (subject !== undefined) { updates.push(`subject = $${i++}`); values.push(subject); }
    if (step_data !== undefined) { updates.push(`step_data = $${i++}`); values.push(JSON.stringify(step_data)); }
    if (current_step !== undefined) { updates.push(`current_step = $${i++}`); values.push(current_step); }
    if (status !== undefined) { updates.push(`status = $${i++}`); values.push(status); }
    if (class_id !== undefined) { updates.push(`class_id = $${i++}`); values.push(class_id); }
    updates.push(`updated_at = NOW()`);

    if (values.length === 0) return res.json({ success: true });

    values.push(req.params.id);
    await pool.query(
      `UPDATE lessons SET ${updates.join(', ')} WHERE id = $${i}`,
      values
    );

    const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    res.json({ lesson: result.rows[0] });
  } catch (err) {
    console.error('Update lesson error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete lesson
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM lessons WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete lesson error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Coverage Analysis
router.post('/:id/analyze', authMiddleware, async (req, res) => {
  const { lessonContent, standards, objectives } = req.body;

  if (!lessonContent || !standards) {
    return res.status(400).json({ error: 'Lesson content and standards are required' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const standardsList = standards.map(s => `${s.code}: ${s.description}`).join('\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are an expert California K-12 curriculum analyst. Analyze this lesson plan against the selected California state standards.

LESSON OBJECTIVES:
${objectives || 'Not specified'}

LESSON CONTENT:
${lessonContent}

SELECTED CALIFORNIA STANDARDS:
${standardsList}

Provide a BRIEF, SCANNABLE analysis with:
1. Overall coverage percentage (0-100)
2. Exactly 3-5 bullet points: key strengths (start with ✓)
3. Exactly 1-3 bullet points: main gaps (start with ✗)
4. One clear recommendation (start with →)
5. For each standard, indicate if it's covered (true/false) and a brief reason

Respond in this exact JSON format:
{
  "coveragePercent": 75,
  "strengths": ["✓ strength 1", "✓ strength 2"],
  "gaps": ["✗ gap 1"],
  "recommendation": "→ recommendation",
  "standardsCoverage": [
    {"code": "STANDARD_CODE", "covered": true, "reason": "brief reason"}
  ]
}`,
      }],
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const analysis = JSON.parse(jsonMatch[0]);
    res.json({ analysis });
  } catch (err) {
    console.error('AI analysis error:', err);
    res.status(500).json({ error: 'AI analysis failed: ' + err.message });
  }
});

module.exports = router;
