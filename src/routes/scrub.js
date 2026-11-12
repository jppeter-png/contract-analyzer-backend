const express = require('express');
const multer = require('multer');
const { extractText } = require('../textExtractor');
const { scrubPII, MAX_TERMS, MAX_TERM_LENGTH } = require('../piiScrubber');
const { countWords } = require('../textStats');
const { describeError } = require('../logSafe');

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

// Multipart forms can only carry strings, so terms may arrive as a JSON string or, in a JSON body, an array.
// Returns { error } for a malformed request; the terms themselves are never logged or echoed in errors.
function readOptions(body) {
  let terms = body.customTerms;
  if (typeof terms === 'string') {
    try { terms = JSON.parse(terms); } catch { return { error: 'customTerms must be a JSON array of strings' }; }
  }
  if (terms === undefined || terms === null || terms === '') terms = [];
  if (!Array.isArray(terms) || terms.some(t => typeof t !== 'string')) {
    return { error: 'customTerms must be an array of strings' };
  }
  if (terms.length > MAX_TERMS) return { error: `At most ${MAX_TERMS} terms are allowed` };
  if (terms.some(t => t.length > MAX_TERM_LENGTH)) return { error: `Each term can be at most ${MAX_TERM_LENGTH} characters` };
  return { customTerms: terms, autoDetect: !(body.autoDetect === false || body.autoDetect === 'false') };
}

/**
 * POST /api/scrub
 * Accepts a file (multipart) or { text } (JSON), plus optional customTerms (names, addresses, IDs the
 * user wants hidden) and autoDetect=false (hide only those terms and look for nothing else).
 * Returns scrubbed text + PII findings. Does NOT call the AI.
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    let rawText = '';

    const options = readOptions(req.body || {});
    if (options.error) return res.status(400).json({ error: options.error });

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

    const { scrubbed, findings, termMatches } = scrubPII(rawText, options);
    const wordCount = countWords(rawText);
    const totalRedacted = findings.reduce((sum, f) => sum + f.count, 0);

    res.json({
      scrubbedText: scrubbed,
      findings,
      wordCount,
      totalRedacted,
      preview: scrubbed.slice(0, 600),
      autoDetect: options.autoDetect,
      // How often each typed term was found, so the app can say "not found in this document".
      ...(options.customTerms.length ? { termMatches } : {}),
    });
  } catch (err) {
    console.error('Scrub error:', describeError(err));
    res.status(500).json({ error: err.message || 'Failed to process document' });
  }
});

module.exports = router;
