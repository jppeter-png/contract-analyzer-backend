const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { countWords, removeCjkSpacing } = require('../textStats');
const { describeError } = require('../logSafe');

// Tesseract language packs for the supported document languages. English is always
// included (contracts quote English terms), and the total is capped so a request
// cannot make the worker load every pack.
const TESSERACT_CODES = { en: 'eng', es: 'spa', fr: 'fra', de: 'deu', pt: 'por', zh: 'chi_sim' };
const MAX_OCR_LANGUAGES = 3;

function resolveOcrLanguages(requested) {
  const wanted = String(requested || '').split(/[,\s+]+/).map(c => c.trim().toLowerCase().slice(0, 2));
  const codes = ['eng'];
  for (const c of wanted) {
    const code = TESSERACT_CODES[c];
    if (code && !codes.includes(code) && codes.length < MAX_OCR_LANGUAGES) codes.push(code);
  }
  return codes.join('+');
}

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per image
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are supported'));
    }
  },
});

// Tesseract scores each page 0-100 (how sure it is of the characters it read). The app uses
// the average, and the weakest page, to warn when photos were hard to read.
function summarizeConfidence(values) {
  const scores = values.filter(v => Number.isFinite(v));
  if (!scores.length) return { confidence: null, lowestPageConfidence: null };
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { confidence: Math.round(avg), lowestPageConfidence: Math.round(Math.min(...scores)) };
}

/**
 * POST /api/ocr
 * Accepts multiple images (multipart), runs Tesseract OCR on each,
 * and returns the combined extracted text in page order.
 * Also returns `confidence` (average, 0-100) and `lowestPageConfidence`; null if unknown.
 * Optional form field `languages` (e.g. "es" or "fr,de") adds those language packs to English.
 */
router.post('/', upload.array('images', 20), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: 'No images provided' });
  }

  try {
    const pageTexts = [];
    const pageConfidences = [];
    const ocrLanguages = resolveOcrLanguages(req.body && req.body.languages);

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`OCR processing page ${i + 1} of ${req.files.length}...`);

      const { data } = await Tesseract.recognize(file.buffer, ocrLanguages, {
        logger: () => {}, // suppress verbose logs
      });

      pageTexts.push(removeCjkSpacing(data.text));
      pageConfidences.push(data.confidence);
    }

    const combinedText = pageTexts.join('\n\n--- Page Break ---\n\n');
    const wordCount = countWords(combinedText);

    res.json({
      text: combinedText,
      pageCount: req.files.length,
      wordCount,
      ...summarizeConfidence(pageConfidences),
    });
  } catch (err) {
    console.error('OCR error:', describeError(err));
    res.status(500).json({ error: err.message || 'OCR failed' });
  }
});

router.resolveOcrLanguages = resolveOcrLanguages;
router.summarizeConfidence = summarizeConfidence;

module.exports = router;
