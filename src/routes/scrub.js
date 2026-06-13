const express = require('express');
const multer = require('multer');
const { extractText } = require('../textExtractor');
const { scrubPII } = require('../piiScrubber');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (allowed.includes(file.mimetype) || ['pdf', 'docx', 'txt'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are supported'));
    }
  },
});

/**
 * POST /api/scrub
 * Accepts a file (multipart) or { text } (JSON).
 * Returns scrubbed text + PII findings. Does NOT call the AI.
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    let rawText = '';

    if (req.file) {
      rawText = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
    } else if (req.body.text) {
      rawText = String(req.body.text);
    } else {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    if (!rawText.trim()) {
      return res.status(400).json({ error: 'Could not extract any text from the document' });
    }

    const { scrubbed, findings } = scrubPII(rawText);
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;
    const totalRedacted = findings.reduce((sum, f) => sum + f.count, 0);

    res.json({
      scrubbedText: scrubbed,
      findings,
      wordCount,
      totalRedacted,
      preview: scrubbed.slice(0, 600),
    });
  } catch (err) {
    console.error('Scrub error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to process document' });
  }
});

module.exports = router;
