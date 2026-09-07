require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const scrubRouter = require('./src/routes/scrub');
const analyzeRouter = require('./src/routes/analyze');
const ocrRouter = require('./src/routes/ocr');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Scrub/OCR are cheap (local); analyze hits a paid LLM API — limit it tighter.
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const analyzeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

app.use('/api/scrub', apiLimiter, scrubRouter);
app.use('/api/analyze', analyzeLimiter, analyzeRouter);
app.use('/api/ocr', apiLimiter, ocrRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Contract Analyzer API running on port ${PORT}`);
  });
}

module.exports = app;
