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
│   ├── dataset.json            # 30 hand-labeled contracts (ground truth)
│   ├── keywordBaseline.js      # Naive keyword baseline (comparison point)
│   ├── scoring.js              # Category/text-overlap matching + P/R/F1
│   ├── run_eval.js             # Orchestrates a run, regenerates results.md
│   ├── results.md              # Latest eval run, committed for reference
│   ├── predictions.json        # Raw per-entry output from the latest run (gitignored)
│   └── manual-test-contracts/  # Same 30 contracts as standalone .txt files, for trying by hand
└── src/
    ├── piiScrubber.js        # PII redaction: runs every detector, resolves overlaps, rebuilds the text
    ├── pii/
    │   ├── structured.js     # Validated patterns: email, phone (US + intl), SSN, cards (Luhn), IBAN,
    │   │                     #   addresses, bank/ID numbers, DOB, VIN, IPs, social handles
    │   ├── names.js          # Evidence-scored person-name detection (cues, lexicon, signature blocks)
    │   ├── lexicon.js        # Per-token first/last-name evidence from compromise
    │   ├── stoplist.js       # Legal boilerplate / organization words that are never names
    │   └── validators.js     # Luhn, IBAN mod-97, IPv4 range checks
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

Optional form field `languages` (e.g. `es` or `fr,de`; codes `en es fr de pt`) adds those Tesseract language packs to English, which is always included. At most three are loaded per request and unknown codes are ignored. The first request for a language downloads its pack, so it is slower than later ones.

**Response:**
```json
{
  "text": "Page 1 text...\n\n--- Page Break ---\n\nPage 2 text...",
  "pageCount": 2,
  "wordCount": 512
}
```

### `POST /api/analyze`
Accepts `{ scrubbedText, contractType, chunkContext, outputLanguage }`. `contractType` is one of `auto | employment | nda | lease | service | loan | tos` (defaults to `auto`). Calls Groq (GPT-OSS 120B) and returns the risk analysis. Input is capped at 8,000 characters per call.

`outputLanguage` (optional: `en | es | fr | de | pt`) is the language the user reads. The model writes every human-readable field in it, whatever language the contract is in, while the JSON keys and the `high | medium | low` and `type` values stay English so clients can rely on them. Omitted, the prompt is unchanged.

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

Covers `piiScrubber.js` (recall cases that must be redacted and must not leak, precision cases that must be left alone, overlap handling, and performance) and integration tests for `/api/scrub` and `/api/analyze` (Groq calls mocked, no API cost).

### How PII detection works

Every detector reports spans against the **original** text; overlaps are resolved by priority (an email beats the name inside it) and the text is rebuilt once, so one detector's placeholder can never confuse another.

- **Structured identifiers** use patterns plus validation where one exists (Luhn for cards, mod-97 for IBANs, octet range for IPs), so look-alikes such as `0000 0000 0000 0000` or section number `4.2.1.3` aren't flagged.
- **Names** are scored from several independent signals rather than trusting one: honorifics (`Mr. Okafor`), role/label cues (`Tenant Jane Doe`, `Name:`), defined terms (`Jane Doe ("Tenant")`), `between X and Y`, signature blocks, name-shaped email local-parts (`priya.raman@…`), and a first/last-name lexicon. A legal-boilerplate stoplist, organization-word and corporate-suffix filters, and title-continuation checks (`John Hancock Insurance`, `…King Jr. Day`) keep contract text from being over-redacted. Once a name is accepted, every later mention (full name, surname, `Last, First`) is redacted too.

**Languages.** Spanish, French, German and Portuguese are supported alongside English, without guessing the document's language first (contracts are often bilingual, so every language's cues run on every document). Patterns are Unicode-aware, so `José`, `Müller` and `Gonçalves` are names like any other. Per language, `src/pii/langs.js` holds the role cues (`arrendatario`, `locataire`, `Mieter`, `locatário`), label cues, honorifics (`Sr.`, `Mme`, `Herr`), salutations, legal stop words, organization words and common first names and surnames. `structured.js` adds local address, phone and date-of-birth formats, and national IDs with checksum validators (Spanish DNI/NIE, Brazilian CPF, Portuguese NIF, French social security number) so they are caught even without a label. Add a language by adding a pack to `langs.js`, rules to `structured.js`, and cases to `test/piiMultilingual.test.js`.

**Known limits:** name detection depends on capitalization, so an all-lowercase name (`mr. sanchez`) is not caught; a name with no cue and no lexicon support (rare surname, first mention, plain sentence) can be missed until it is mentioned again with a cue — this is more likely outside English, where the first-name and surname lists are shorter; German capitalizes every noun, so a short noun phrase directly after a role word (`Mieter Kleine Reparaturen`) can be over-redacted; unlabeled local phone numbers are only recognized in a few formats (French `06 12 34 56 78`, Spanish/Portuguese `612 345 678`), otherwise they need a label such as `Teléfono:`; address formats outside the US/UK/Canada and the four languages above are not recognized. Redaction is a safeguard, not a guarantee, which is why the app shows users exactly what will be sent before anything leaves their device.

## Evaluation

`eval/` contains a hand-labeled dataset of 30 contracts (`dataset.json` — 25 across all six categories with known trap clauses, 5 clean with none) and a scoring script (`run_eval.js`) that runs both the real analyzer and a naive keyword baseline (`keywordBaseline.js`, fixed red-flag terms per category, no LLM) against every entry, scores each with a rough category-or-text-overlap matcher (`scoring.js`, not exact string match), and computes per-category precision/recall/F1 plus the false-positive rate on the clean entries. See [`eval/results.md`](eval/results.md) for the latest run, an error-analysis section with concrete misses/false-positives, and full methodology/caveats.

```bash
npm run eval
```

Requires a real `GROQ_API_KEY` — this hits the live API (~30 calls, paced to stay under free-tier rate limits, so it takes several minutes and can bump into the daily token quota on a busy day). Add `--resume` to reuse successful results from `eval/predictions.json` (gitignored, written each run) instead of re-calling the API for entries already captured — useful for picking back up after a rate-limit interruption without burning extra budget.

Want to try the same 30 contracts yourself, by hand, in the app? See [`eval/manual-test-contracts/`](eval/manual-test-contracts/) — each one exported as a standalone `.txt` file plus a short "here's what a correct analysis should find" writeup.

### Results (last run 2026-09-07)

| Approach | Precision | Recall | F1 |
|---|---|---|---|
| LLM (this app) | 0.73 | 0.91 | **0.81** |
| Keyword baseline | 0.73 | 0.86 | 0.79 |

Headline F1 is close — but the more telling number is false-positive control on the 5 clean (no-trap) contracts: the category-tuned keyword baseline flagged **4 of 5** of them, while the LLM falsely flagged only **1 of 5**. A naive keyword scanner catches real traps almost as often as the LLM here, but it can't tell a red-flag *word* from a red-flag *clause* — it fires on "arbitration" or "indefinitely" appearing at all, regardless of context. Full breakdown, per-category numbers, and concrete error examples in [`eval/results.md`](eval/results.md).

---

## Deploying

Currently deployed on [Render](https://render.com) with auto-deploy from this repo's `main` branch. [Railway](https://railway.app) and [Fly.io](https://fly.io) are other options.
Set `GROQ_API_KEY` as an environment variable in your hosting dashboard.

Request throttling is in place via `express-rate-limit` (tighter on `/api/analyze`, which hits a paid API) — see `index.js`. For production use beyond a personal project, also add authentication.
