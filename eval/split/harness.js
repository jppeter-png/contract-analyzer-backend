// Shared pieces for the whole-vs-split and redaction experiments.
const path = require('path');
require(path.join(__dirname, '..', '..', 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '..', '..', '.env') });

const request = require('supertest');
const app = require('../../index');
const analyze = require('../../src/routes/analyze');
const { tokenize } = require('../scoring');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Waits out Groq's "try again in Ns" rate limits; retries a few transient failures. */
// Groq's free tier allows 8,000 tokens per minute and one analysis uses ~3,500, so calls are spaced out.
const MIN_GAP_MS = 27000;
let lastCallAt = 0;
async function paced() {
  const wait = lastCallAt + MIN_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();
}

async function withRetry(fn, label, attempts = 25) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      await paced();
      return await fn();
    } catch (err) {
      lastErr = err;
      const wait = String(err.message).match(/try again in ([\d.]+)\s*(ms|s|m)/i);
      if (wait) {
        const unit = { ms: 1, s: 1000, m: 60000 }[wait[2].toLowerCase()];
        const ms = Math.max(Math.ceil(parseFloat(wait[1]) * unit) + 1000, 2000);
        process.stdout.write(`[${label}: rate limited, waiting ${(ms / 1000).toFixed(0)}s] `);
        await sleep(ms);
      } else {
        process.stdout.write(`[${label}: ${String(err.message).slice(0, 60)}, retrying] `);
        await sleep(2000);
      }
    }
  }
  throw lastErr;
}

/** One analysis through the real route: production prompt, schema checks, retries on bad JSON. */
async function analyzeViaRoute({ text, contractType, chunkContext, label }) {
  return withRetry(async () => {
    const res = await request(app).post('/api/analyze').send({ scrubbedText: text, contractType, chunkContext });
    if (res.status !== 200) throw new Error(res.body.error || `HTTP ${res.status}`);
    return res.body;
  }, label);
}

/** The whole document in one call (the route caps input at 8,000 characters, so this bypasses it). */
async function analyzeWhole({ text, contractType, label, extraSystem = '' }) {
  const systemPrompt = (analyze.PROMPTS[contractType] || analyze.PROMPTS.auto) + analyze.PLACEHOLDER_NOTE + extraSystem;
  return withRetry(async () => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b', temperature: 0.2, max_tokens: 4096,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Analyze this contract:\n\n${text}` }],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty response');
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim());
    return { ...parsed, truncated: false };
  }, label);
}

/**
 * One section of a split contract, called directly (not through the route) so a definitions digest can be
 * added without hitting the route's 8,000-character input cap. Same prompt, same section note as the route.
 */
async function analyzeSection({ text, contractType, chunkContext, digest, label }) {
  const note = `\n\nNote: this is section ${chunkContext.index} of ${chunkContext.total} of a longer contract that has been split due to length. Analyze only the provided section. Do not assume it is the complete contract, and do not list something under "missing_protections" solely because it isn't in this section — it may appear elsewhere.`;
  const digestNote = digest
    ? '\n\nThe user message starts with "Defined terms from earlier sections" of this same contract. Use them to understand the terms this section relies on: if a definition makes a clause in this section riskier than it reads, flag the clause and say what the definition does. Where a term has several versions, the latest one listed applies; a change inside this section applies from where it appears. Do not report issues about the definitions themselves, they were reviewed in the section where they appear.'
    : '';
  const systemPrompt = (analyze.PROMPTS[contractType] || analyze.PROMPTS.auto) + analyze.PLACEHOLDER_NOTE + note + digestNote;
  const user = digest
    ? `Defined terms from earlier sections:\n${digest}\n\n---\nAnalyze this section:\n\n${text}`
    : `Analyze this contract:\n\n${text}`;
  return withRetry(async () => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b', temperature: 0.2, max_tokens: 4096,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: user }],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty response');
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim());
    return { ...parsed, truncated: false };
  }, label);
}

const predText = issue => `${issue.category || ''} ${issue.title || ''} ${issue.description || ''}`.toLowerCase();

/** Does this issue talk about the clause with this excerpt? (text overlap only, no category shortcut) */
function mentionsClause(issue, excerpt) {
  const issueTokens = new Set(tokenize(predText(issue)));
  const excerptTokens = new Set(tokenize(excerpt));
  let overlap = 0;
  for (const t of excerptTokens) if (issueTokens.has(t)) overlap += 1;
  return overlap >= 4 || (excerptTokens.size > 0 && overlap / excerptTokens.size >= 0.3);
}

module.exports = { analyzeViaRoute, analyzeWhole, analyzeSection, mentionsClause, predText, sleep, app };
