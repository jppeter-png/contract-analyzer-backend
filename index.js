require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const scrubRouter = require('./src/routes/scrub');
const analyzeRouter = require('./src/routes/analyze');
const ocrRouter = require('./src/routes/ocr');
const { getPage, PAGES } = require('./src/pages/render');
const { describeError } = require('./src/logSafe');

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

// Landing page: the developer website listed in the App Store points here.
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Without this, Render's default robots.txt disallows everything and ad networks cannot read app-ads.txt.
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /api/\n');
});

// Lets ad networks verify who is authorised to sell this app's ad space (IAB app-ads.txt).
// Must stay at the root of the domain listed as the developer website in the App Store.
app.get('/app-ads.txt', (req, res) => {
  res.type('text/plain').send('google.com, pub-4330297206877846, DIRECT, f08c47fec0942fa0\n');
});

// Legal pages are English by default; ?lang=es|fr|de|pt|zh serves a translation.
for (const page of PAGES) {
  app.get(`/${page}`, (req, res) => res.type('html').send(getPage(page, req.query.lang)));
}

app.use((err, req, res, next) => {
  console.error('Unhandled error:', describeError(err));
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Contract Analyzer API running on port ${PORT}`);
  });
}

module.exports = app;
