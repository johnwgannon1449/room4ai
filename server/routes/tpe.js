const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const multer = require('multer');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const TPE_STANDARDS = require('../data/tpeStandards');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// GET /api/tpe/standards
router.get('/standards', authMiddleware, (req, res) => {
  res.json({ standards: TPE_STANDARDS });
});

// POST /api/tpe/actions
router.post('/actions', authMiddleware, async (req, res) => {
  const { element_id, element_text, grade, subject } = req.body;
  if (!element_id || !element_text) {
    return res.status(400).json({ error: 'element_id and element_text are required' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: 'You are an expert California K-12 instructional coach. Generate 3-5 specific, concrete, immediately actionable teacher behaviors for the given TPE element at the specified grade level and subject. Each action must start with a verb and be realistic for a classroom teacher to implement.',
      messages: [{
        role: 'user',
        content: `TPE Element ${element_id}: ${element_text}

Grade: ${grade || 'K-12'}
Subject: ${subject || 'General'}

Generate 3-5 specific, concrete teacher actions for this element. Each must:
- Start with an action verb (Design, Ask, Use, Create, Implement, etc.)
- Be one clear sentence
- Be immediately actionable in a real classroom
- Be appropriate for ${grade || 'K-12'} ${subject || 'students'}

Return ONLY valid JSON:
{ "actions": ["Action 1 sentence.", "Action 2 sentence.", "Action 3 sentence."] }`,
      }],
    });

    const text = message.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response');
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('TPE actions error:', err);
    res.status(500).json({ error: 'Failed to generate actions: ' + err.message });
  }
});

// POST /api/tpe/analyze
router.post('/analyze', authMiddleware, async (req, res) => {
  const { lesson_text, lesson_title, grade, subject, selected_tpes, class_id } = req.body;

  if (!lesson_text || !selected_tpes || !selected_tpes.length) {
    return res.status(400).json({ error: 'lesson_text and selected_tpes are required' });
  }

  const selectedStandards = TPE_STANDARDS.filter((t) => selected_tpes.includes(t.id));

  // Build condensed TPE list for the prompt
  const tpeList = selectedStandards.map((tpe) =>
    `TPE ${tpe.id}: ${tpe.title}\n` +
    tpe.elements.map((el) => `  ${el.id}: ${el.text}`).join('\n')
  ).join('\n\n');

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: 'You are an expert California educator evaluating a lesson plan against the California Teaching Performance Expectations (TPEs). For each TPE element provided, identify specific evidence from the lesson text that demonstrates coverage. Quote or closely paraphrase relevant portions. Be fair, constructive, and specific. Return only valid JSON.',
      messages: [{
        role: 'user',
        content: `Evaluate this lesson plan against the selected California TPE elements.

LESSON TITLE: ${lesson_title || 'Untitled'}
GRADE: ${grade || 'Not specified'}
SUBJECT: ${subject || 'Not specified'}

LESSON TEXT:
${lesson_text.slice(0, 4000)}

TPE ELEMENTS TO EVALUATE:
${tpeList}

For each TPE element, provide:
- coverage: "strong" (clear evidence), "partial" (some evidence), or "not_evident" (no evidence)
- evidence: array of 1-3 direct quotes or close paraphrases from the lesson text (empty array if none)
- strength: one sentence describing what was done well (null if not_evident)
- suggestion: one constructive sentence for improvement (null if strong)

Also set overall_coverage for each TPE section: "strong" (>66% elements strong), "partial" (any partial/mixed), "not_evident" (all not_evident).

Return ONLY valid JSON in this exact format:
{
  "tpe_results": [
    {
      "tpe_id": 1,
      "tpe_title": "Title",
      "overall_coverage": "strong",
      "elements": [
        {
          "element_id": "1.1",
          "coverage": "strong",
          "evidence": ["Quote from lesson..."],
          "strength": "The lesson clearly addresses...",
          "suggestion": null
        }
      ]
    }
  ]
}`,
      }],
    });

    const text = message.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const parsed = JSON.parse(jsonMatch[0]);
    const tpeResults = parsed.tpe_results || [];

    // Compute summary
    let totalElements = 0;
    let addressedElements = 0;
    tpeResults.forEach((tpe) => {
      tpe.elements.forEach((el) => {
        totalElements++;
        if (el.coverage === 'strong' || el.coverage === 'partial') addressedElements++;
      });
    });
    const percentage = totalElements > 0 ? Math.round((addressedElements / totalElements) * 100) : 0;

    const result = {
      summary: { total_elements: totalElements, addressed: addressedElements, percentage },
      tpe_results: tpeResults,
    };

    // Save to DB
    await pool.query(
      `INSERT INTO tpe_analyses (user_id, lesson_title, grade, subject, selected_tpes, lesson_text, analysis_result)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.userId, lesson_title || 'Untitled', grade || '', subject || '', selected_tpes, lesson_text.slice(0, 10000), JSON.stringify(result)]
    ).catch((err) => console.error('Failed to save TPE analysis:', err));

    res.json(result);
  } catch (err) {
    console.error('TPE analyze error:', err);
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});

// POST /api/tpe/parse-document
router.post('/parse-document', authMiddleware, upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No document provided' });

  const mime = req.file.mimetype;
  const originalName = req.file.originalname || '';

  try {
    let text = '';

    if (mime === 'application/pdf' || originalName.endsWith('.pdf')) {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalName.endsWith('.docx')
    ) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or DOCX.' });
    }

    if (!text.trim()) return res.status(422).json({ error: 'Could not extract text from document.' });
    res.json({ text: text.trim() });
  } catch (err) {
    console.error('Parse document error:', err);
    res.status(500).json({ error: 'Failed to parse document: ' + err.message });
  }
});

module.exports = router;
