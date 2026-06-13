const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');

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

/**
 * POST /api/ocr
 * Accepts multiple images (multipart), runs Tesseract OCR on each,
 * and returns the combined extracted text in page order.
 */
router.post('/', upload.array('images', 20), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: 'No images provided' });
  }

  try {
    const pageTexts = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`OCR processing page ${i + 1} of ${req.files.length}...`);

      const { data } = await Tesseract.recognize(file.buffer, 'eng', {
        logger: () => {}, // suppress verbose logs
      });

      pageTexts.push(data.text);
    }

    const combinedText = pageTexts.join('\n\n--- Page Break ---\n\n');
    const wordCount = combinedText.split(/\s+/).filter(Boolean).length;

    res.json({
      text: combinedText,
      pageCount: req.files.length,
      wordCount,
    });
  } catch (err) {
    console.error('OCR error:', err.message);
    res.status(500).json({ error: err.message || 'OCR failed' });
  }
});

module.exports = router;
