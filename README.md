# Contract Risk Analyzer — Backend

Express API that extracts text from a contract, scrubs PII before anything reaches an LLM, and returns a plain-language risk analysis via Groq.

The companion mobile app lives in a separate repo: [contract-analyzer-mobile](https://github.com/jppeter-png/contract-analyzer-mobile).

## Architecture

```
Client uploads file / pastes text / sends photographed pages
       ↓
(photos only) POST /api/ocr — Tesseract OCR → plain text
       ↓
POST /api/scrub — extracts text (PDF/DOCX/TXT) and redacts PII
       ↓
Client reviews what was redacted, decides whether/how to proceed
       ↓
POST /api/analyze — sends scrubbed text → Groq (GPT-OSS 120B) → risk analysis
```

---

## Setup

```bash
npm install
cp .env.example .env          # Add your GROQ_API_KEY
npm run dev                   # Starts on http://localhost:3000
```

### Environment Variables (`.env`)

```
GROQ_API_KEY=gsk_...
PORT=3000
```

Get a key at [console.groq.com/keys](https://console.groq.com/keys) (free tier available).

> The analysis prompt and model (`openai/gpt-oss-120b` via Groq, `temperature: 0.2`) live in `src/routes/analyze.js`. Swapping providers means changing the `fetch` call and request/response shape there — there's no provider abstraction layer. Groq's model lineup changes over time (this project originally used `llama-3.3-70b-versatile`, which Groq has since removed); check `https://api.groq.com/openai/v1/models` with your key if `/api/analyze` starts 500ing with a "model does not exist" error.

---

## Project Structure

```
backend/
├── index.js                  # Express server entry point
├── .env.example
├── package.json
├── test/                     # Jest unit + integration tests
├── eval/                     # Labeled eval set + scoring script (see "Evaluation" below)
│   ├── fixtures/              # Labeled contract eval set
│   ├── run.js                 # Scoring script (precision/recall vs. ground truth)
│   └── results.md             # Latest eval run, committed for reference
└── src/
    ├── piiScrubber.js        # Regex + NLP-based PII redaction
    ├── textExtractor.js      # PDF / DOCX / TXT parsing
    └── routes/
        ├── scrub.js          # POST /api/scrub
        ├── analyze.js        # POST /api/analyze  (Groq / GPT-OSS 120B)
        └── ocr.js            # POST /api/ocr      (Tesseract, for photographed pages)
```

---

## API Reference

### `POST /api/scrub`
Accepts a file (`multipart/form-data`) or raw `{ text }` (JSON).
Returns scrubbed text and PII findings — no AI call yet.

**Response:**
```json
{
  "scrubbedText": "...",
  "findings": [{ "label": "Email addresses", "count": 2, "redacted": ["..."] }],
  "wordCount": 847,
  "totalRedacted": 3,
  "preview": "First 600 chars of scrubbed text..."
}
```

### `POST /api/ocr`
Accepts up to 20 images (`multipart/form-data`, field name `images`). Runs Tesseract OCR on each page in order and joins the results. The extracted text is then passed to `/api/scrub` like any other input.

**Response:**
```json
{
  "text": "Page 1 text...\n\n--- Page Break ---\n\nPage 2 text...",
  "pageCount": 2,
  "wordCount": 512
}
```

### `POST /api/analyze`
Accepts `{ scrubbedText, contractType, chunkContext }`. `contractType` is one of `auto | employment | nda | lease | service | loan | tos` (defaults to `auto`). Calls Groq (GPT-OSS 120B) and returns the risk analysis. Input is capped at 8,000 characters per call.

`chunkContext` (optional, `{ index, total }`) is set by a client that has split a longer contract into sections — it tells the model this text is one section of a longer document, so it doesn't report clauses as "missing" just because they're in a different section, and doesn't assume this section is the whole contract. There's no separate "chunked" endpoint; a client analyzing a long contract in full just calls this repeatedly with `chunkContext` set and paces the requests itself (see the mobile repo's README for that flow).

**Response:**
```json
{
  "overall_risk": "high",
  "category": "employment",
  "summary": "...",
  "issues": [{
    "severity": "high", "category": "...", "title": "...", "description": "...", "recommendation": "...",
    "type": "unfair_clause"
  }],
  "missing_protections": ["..."],
  "truncated": false
}
```

Each issue's `type` is `unfair_clause` (an actual clause is present and disadvantages the signer) or `missing_protection` (nothing adversarial — a standard protection is simply absent). This distinction exists because the model was flagging absent-but-normal clauses (no severance provision, no liability cap, etc.) with the same severity treatment as real unfair clauses, which made short, otherwise-fair contracts read as "medium" or "high" risk. The prompt instructs the model not to let `missing_protection`-only findings push `overall_risk` above "medium". `type` is optional in the schema (older/malformed responses without it should be treated as `unfair_clause` by clients). See [`eval/results.md`](eval/results.md) for before/after numbers on this change.

`truncated` is `true` when `scrubbedText` exceeded 8,000 characters and `chunkContext` wasn't set — i.e. only the first 8,000 characters were analyzed.

---

## Known limitations

- **No provider abstraction**: only Groq/GPT-OSS is wired up. See the note in Setup above if you want to swap models.
- **No persistent storage**: nothing is stored server-side. Any history/state lives entirely on the client.

---

## Testing

```bash
npm test
```

Covers `piiScrubber.js` regex edge cases (phone numbers that look like SSNs, international formats, names adjacent to redacted PII — including documented false-positive/false-negative limitations) and integration tests for `/api/scrub` and `/api/analyze` (Groq calls mocked, no API cost).

## Evaluation

`eval/` contains a hand-labeled set of 22 contracts (18 across all six categories with known trap clauses, 4 clean with none) and a scoring script that computes trap-clause recall and issue-level precision/recall against ground truth, compared against a naive keyword-matching baseline. See [`eval/results.md`](eval/results.md) for the latest run and full methodology/caveats.

```bash
npm run eval
```

Requires a real `GROQ_API_KEY` — this hits the live API (~22 calls, paced to stay under free-tier rate limits, so it takes a few minutes).

---

## Deploying

Currently deployed on [Render](https://render.com) with auto-deploy from this repo's `main` branch. [Railway](https://railway.app) and [Fly.io](https://fly.io) are other options.
Set `GROQ_API_KEY` as an environment variable in your hosting dashboard.

Request throttling is in place via `express-rate-limit` (tighter on `/api/analyze`, which hits a paid API) — see `index.js`. For production use beyond a personal project, also add authentication.
