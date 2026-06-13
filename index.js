require('dotenv').config();
const express = require('express');
const cors = require('cors');

const scrubRouter = require('./src/routes/scrub');
const analyzeRouter = require('./src/routes/analyze');
const ocrRouter = require('./src/routes/ocr');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/scrub', scrubRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/ocr', ocrRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Contract Analyzer API running on port ${PORT}`);
});
