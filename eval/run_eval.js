#!/usr/bin/env node
// Evaluation harness: runs the real Groq/GPT-OSS analysis pipeline and a
// naive keyword baseline against a hand-labeled dataset, scores both against
// ground truth, and regenerates eval/results.md.
//
// Usage: npm run eval   (from backend/)
//
// Outputs:
//   eval/predictions.json — raw per-document predictions + scores (gitignored)
//   eval/results.md       — human-readable report (committed)
//
// See eval/results.md's own Methodology section for what "match" means here
// (category + rough text overlap, not exact string match — see scoring.js)
// and what this eval does and doesn't prove.

const fs = require('fs');
const path = require('path');
require(path.join(__dirname, '..', 'node_modules', 'dotenv'))
  .config({ path: path.join(__dirname, '..', '.env') });

const analyzeRouter = require('../src/routes/analyze');
const { runKeywordBaseline } = require('./keywordBaseline');
const { scoreDocument, aggregateScores } = require('./scoring');

const DATASET_PATH = path.join(__dirname, 'dataset.json');
const PREDICTIONS_PATH = path.join(__dirname, 'predictions.json');
const RESULTS_PATH = path.join(__dirname, 'results.md');

const MODEL_LABEL = 'openai/gpt-oss-120b via Groq (temperature 0.2)';
const CATEGORY_DISPLAY = { employment: 'Employment', nda: 'NDA', lease: 'Lease', service: 'Service', loan: 'Loan', tos: 'ToS' };
const CATEGORY_ORDER = ['employment', 'nda', 'lease', 'service', 'loan', 'tos'];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGroqWithRetry(systemPrompt, userContent, attempts = 8) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await analyzeRouter.callGroq(systemPrompt, userContent);
    } catch (err) {
      lastErr = err;
      const waitMatch = err.message.match(/try again in ([\d.]+)s/i);
      if (waitMatch) {
        const waitMs = Math.max(Math.ceil(parseFloat(waitMatch[1]) * 1000) + 500, 2000);
        process.stdout.write(`[rate limited, waiting ${(waitMs / 1000).toFixed(1)}s] `);
        await sleep(waitMs);
      } else if (err instanceof SyntaxError || err.name === 'ZodError') {
        // Malformed JSON or schema-invalid response (e.g. an out-of-enum
        // severity value) — same retryable classification as the production
        // /api/analyze route. Brief pause, then retry.
        process.stdout.write(`[${err.name || 'parse'} error, retrying] `);
        await sleep(1000);
      } else {
        break;
      }
    }
  }
  throw lastErr;
}

function fmt(x) {
  return x == null ? 'N/A' : x.toFixed(2);
}

/**
 * Auto-generate 3-5 concrete error examples from the actual run: a mix of
 * misses (ground truth issues no LLM prediction matched) and false positives
 * (LLM predictions on clean docs, or on trap docs that matched nothing).
 * "Likely cause" is a best-effort heuristic, not a verified diagnosis —
 * flagged as such in the methodology section.
 */
function buildErrorAnalysis(perDoc) {
  const misses = [];
  const falsePositives = [];

  for (const doc of perDoc) {
    if (doc.error) continue;
    for (const gi of doc.llmScore.missedGtIndices) {
      const issue = doc.entry.ground_truth_issues[gi];
      misses.push({ doc, issue });
    }
    for (const pi of doc.llmScore.falsePositivePredIndices) {
      const pred = doc.llmComparableIssues[pi]; // indices are relative to the scored (comparable) array
      falsePositives.push({ doc, pred });
    }
  }

  // Prefer high-severity misses (more consequential) and any miss on a
  // cross-clause-style entry (its ground truth issue count is 1, a rough
  // proxy for "the trap needed connecting two parts of the document").
  misses.sort((a, b) => {
    const rank = { high: 2, medium: 1, low: 0 };
    return (rank[b.issue.severity] || 0) - (rank[a.issue.severity] || 0);
  });

  const lines = [];
  let n = 1;

  const missSlots = Math.min(3, misses.length);
  for (let i = 0; i < missSlots; i++) {
    const { doc, issue } = misses[i];
    const isSingleIssueDoc = doc.entry.ground_truth_issues.length === 1;
    const cause = doc.truncatedForLLM
      ? 'contract text may have been affected by the 8,000-character analysis cap'
      : isSingleIssueDoc
        ? 'this entry\'s trap was designed to require connecting two separate clauses (e.g. a broad definition earlier in the document) — plausible the model treated the flagged clause in isolation'
        : 'clause likely used phrasing distant enough from the category label that it wasn\'t recognized as this specific issue type';
    lines.push(`${n}. **${doc.entry.id} / ${doc.entry.category}** — Missed clause: "${truncate(issue.clause_excerpt, 140)}" (category: ${issue.category}, severity: ${issue.severity}). Likely cause: ${cause}.`);
    n++;
  }

  const fpSlots = Math.min(5 - lines.length, falsePositives.length);
  for (let i = 0; i < fpSlots; i++) {
    const { doc, pred } = falsePositives[i];
    // Note: pred here is always type unfair_clause — missing_protection
    // issues are filtered out before scoring entirely (see main loop), so
    // they never reach falsePositivePredIndices in the first place.
    const cause = doc.entry.is_clean
      ? 'model flagged an actively unfair clause (type: unfair_clause) as present on a contract with no injected traps — a genuine false positive worth reading in full in predictions.json'
      : 'this prediction didn\'t match any ground-truth issue on this document — either a real miss in the dataset\'s labeling, or the model flagging something genuinely outside the injected traps';
    lines.push(`${n}. **${doc.entry.id} / ${doc.entry.category}** — False positive: flagged "${truncate(pred.title || pred.description || '', 140)}" (type: unfair_clause). Likely cause: ${cause}.`);
    n++;
  }

  if (lines.length === 0) {
    lines.push('No misses or false positives to report on this run — every ground truth issue was matched and no unmatched predictions were raised. (Re-run to confirm this holds given model non-determinism.)');
  }

  return lines;
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set (checked backend/.env). Aborting.');
    process.exit(1);
  }

  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf-8'));
  console.log(`Loaded ${dataset.length} dataset entries.`);

  // Resume support: reuse a previous successful run's LLM call for an entry
  // instead of re-calling the API, so a run interrupted by a rate limit
  // (per-minute or, as observed, per-day) doesn't have to redo everything —
  // and doesn't burn more of a scarce daily token budget than necessary.
  // Only reused if the dataset entry's text is unchanged since that run.
  let previousById = new Map();
  const resume = process.argv.includes('--resume');
  if (resume && fs.existsSync(PREDICTIONS_PATH)) {
    try {
      const previous = JSON.parse(fs.readFileSync(PREDICTIONS_PATH, 'utf-8'));
      for (const d of previous) {
        if (!d.error && d.entry?.text === dataset.find(e => e.id === d.entry?.id)?.text) {
          previousById.set(d.entry.id, d);
        }
      }
      console.log(`Resuming: ${previousById.size} entries reusable from a previous run.`);
    } catch {
      console.log('Could not read previous predictions.json to resume from — running fresh.');
    }
  }

  const perDoc = [];

  for (const entry of dataset) {
    const cached = previousById.get(entry.id);
    if (cached) {
      console.log(`${entry.id}: reusing previous result.`);
      perDoc.push(cached);
      continue;
    }

    process.stdout.write(`Analyzing ${entry.id}... `);

    const systemPrompt = analyzeRouter.PROMPTS[entry.category] || analyzeRouter.PROMPTS.auto;
    const truncatedForLLM = entry.text.length > analyzeRouter.MAX_INPUT_CHARS;
    const userContent = `Analyze this contract:\n\n${entry.text.slice(0, analyzeRouter.MAX_INPUT_CHARS)}`;

    let analysis = null;
    let error = null;
    try {
      analysis = await callGroqWithRetry(systemPrompt, userContent);
    } catch (err) {
      error = err.message;
    }

    const llmIssues = analysis?.issues || [];
    // This dataset's ground truth is entirely "an unfair clause is present"
    // traps — it has no missing_protection-style entries. A missing_protection
    // prediction can therefore never be a true positive here by construction,
    // so scoring it as an ordinary false positive would unfairly tank
    // precision for correct behavior the schema explicitly supports. Score
    // only the comparable subset; missing_protection issues are tallied
    // separately (see the False Positive Rate section).
    const llmComparableIssues = llmIssues.filter(i => i.type !== 'missing_protection');
    const llmScore = scoreDocument(llmComparableIssues, entry.ground_truth_issues);

    const baselinePreds = runKeywordBaseline(entry.text, entry.category);
    const baselineScore = scoreDocument(baselinePreds, entry.ground_truth_issues);

    perDoc.push({
      entry, error, truncatedForLLM,
      llmOverallRisk: analysis?.overall_risk ?? null,
      llmIssues, llmComparableIssues, llmScore,
      baselinePreds, baselineScore,
    });

    console.log(error ? `ERROR: ${error}` : 'done');
    await sleep(13000); // stay under the free-tier tokens-per-minute cap
  }

  const okDocs = perDoc.filter(d => !d.error);
  const errors = perDoc.filter(d => d.error).map(d => ({ id: d.entry.id, error: d.error }));

  // ---- Headline metrics ----
  const llmAgg = aggregateScores(okDocs.map(d => d.llmScore));
  const baselineAgg = aggregateScores(okDocs.map(d => d.baselineScore));

  // ---- By category ----
  const byCategory = CATEGORY_ORDER.map(cat => {
    const docs = okDocs.filter(d => d.entry.category === cat);
    return {
      category: cat,
      n: docs.length,
      llm: aggregateScores(docs.map(d => d.llmScore)),
      baseline: aggregateScores(docs.map(d => d.baselineScore)),
    };
  });

  // ---- False positive rate on clean contracts ----
  // llmScore already excludes missing_protection issues (filtered before
  // scoring), so llmScore.falsePositives here means "claimed an unfair
  // clause was present when it wasn't" — a real false positive. Tracked
  // separately: how many missing_protection issues showed up on clean docs
  // (not counted as FP — see the type-field note in Methodology).
  const cleanDocs = okDocs.filter(d => d.entry.is_clean);
  const llmFpDocs = cleanDocs.filter(d => d.llmScore.falsePositives > 0).length;
  const baselineFpDocs = cleanDocs.filter(d => d.baselineScore.falsePositives > 0).length;
  const llmFpTotal = cleanDocs.reduce((s, d) => s + d.llmScore.falsePositives, 0);
  const baselineFpTotal = cleanDocs.reduce((s, d) => s + d.baselineScore.falsePositives, 0);
  const missingProtectionOnClean = cleanDocs.reduce(
    (s, d) => s + d.llmIssues.filter(i => i.type === 'missing_protection').length, 0
  );
  const llmFpDescriptions = [];
  for (const d of cleanDocs) {
    for (const pi of d.llmScore.falsePositivePredIndices) {
      llmFpDescriptions.push(`${d.entry.id}: "${truncate(d.llmComparableIssues[pi].title || '', 80)}"`);
    }
  }

  const errorAnalysisLines = buildErrorAnalysis(okDocs);

  const results = {
    generatedAt: new Date().toISOString(),
    model: MODEL_LABEL,
    datasetCount: dataset.length,
    errors,
    llmAgg, baselineAgg, byCategory,
    falsePositives: {
      totalClean: cleanDocs.length,
      llm: { docsWithFp: llmFpDocs, totalFp: llmFpTotal, missingProtectionOnClean, descriptions: llmFpDescriptions },
      baseline: { docsWithFp: baselineFpDocs, totalFp: baselineFpTotal },
    },
    errorAnalysisLines,
  };

  fs.writeFileSync(PREDICTIONS_PATH, JSON.stringify(perDoc, null, 2));
  fs.writeFileSync(RESULTS_PATH, renderMarkdown(results));

  console.log(`\nWrote ${PREDICTIONS_PATH}`);
  console.log(`Wrote ${RESULTS_PATH}`);
}

function renderMarkdown(r) {
  const lines = [];
  const dateStr = r.generatedAt.slice(0, 10);

  lines.push('# Evaluation Results');
  lines.push('');
  lines.push(`Last run: ${dateStr}`);
  lines.push(`Model: ${r.model}`);
  lines.push('Dataset: `eval/dataset.json` (v1)');
  lines.push('');
  if (r.errors.length) {
    lines.push(`⚠ ${r.errors.length} dataset entr${r.errors.length === 1 ? 'y' : 'ies'} failed to analyze and were excluded from all metrics below: ${r.errors.map(e => e.id).join(', ')}.`);
    lines.push('');
  }
  lines.push('## Setup');
  lines.push('');
  lines.push(`- ${r.datasetCount} contracts, 5 per category: employment, NDA, lease, service, loan, ToS`);
  lines.push('- 5 of those 30 are "clean" contracts (no injected traps), spread across 5 of the 6 categories (loan has none), to measure false-positive rate — including per-category, not just in aggregate');
  lines.push('- Ground truth labeled manually against the trap categories in `backend/src/routes/analyze.js`\'s per-type prompts, with severity and obviousness deliberately varied — not every trap is "high" severity, and a few require connecting two separate clauses rather than reading one in isolation');
  lines.push('- Baseline: keyword/regex match against a fixed list of red-flag terms *per category* (`eval/keywordBaseline.js`), no LLM');
  lines.push('- Matching: a prediction counts as hitting a ground-truth issue if it shares the issue\'s category vocabulary OR has substantive word overlap with the labeled `clause_excerpt` — not exact string match (see Methodology)');
  lines.push('');
  lines.push('## Headline Metrics');
  lines.push('');
  lines.push('| Approach | Precision | Recall | F1 |');
  lines.push('|---|---|---|---|');
  lines.push(`| LLM (this app) | ${fmt(r.llmAgg.precision)} | ${fmt(r.llmAgg.recall)} | ${fmt(r.llmAgg.f1)} |`);
  lines.push(`| Keyword baseline | ${fmt(r.baselineAgg.precision)} | ${fmt(r.baselineAgg.recall)} | ${fmt(r.baselineAgg.f1)} |`);
  lines.push('');
  lines.push('### By category');
  lines.push('');
  lines.push('| Category | Precision | Recall | F1 | n |');
  lines.push('|---|---|---|---|---|');
  for (const c of r.byCategory) {
    lines.push(`| ${CATEGORY_DISPLAY[c.category]} | ${fmt(c.llm.precision)} | ${fmt(c.llm.recall)} | ${fmt(c.llm.f1)} | ${c.n} |`);
  }
  lines.push('');
  lines.push('*(Keyword-baseline by-category numbers are in `eval/predictions.json` — omitted here to match the headline table format; aggregate baseline numbers are above.)*');
  lines.push('');
  lines.push('## False Positive Rate (clean contracts)');
  lines.push('');
  lines.push(`- LLM: ${r.falsePositives.llm.docsWithFp}/${r.falsePositives.totalClean} clean contracts had an \`unfair_clause\`-typed prediction that didn't match anything real (${r.falsePositives.llm.totalFp} total — \`missing_protection\`-typed issues are excluded from this count, see below)`);
  lines.push(`- Keyword baseline: ${r.falsePositives.baseline.docsWithFp}/${r.falsePositives.totalClean} clean contracts flagged (${r.falsePositives.baseline.totalFp} total)`);
  lines.push(`- Any false positives found: ${r.falsePositives.llm.descriptions.length ? r.falsePositives.llm.descriptions.join('; ') : 'none — the LLM raised zero unfair_clause-typed issues across any clean doc'}`);
  lines.push(`- Separately (not counted above): the LLM raised ${r.falsePositives.llm.missingProtectionOnClean} \`missing_protection\`-typed issues across the clean docs (noting standard clauses are absent) — expected behavior per the schema, not evidence of hallucination. See Methodology.`);
  lines.push('');
  lines.push('## Error Analysis');
  lines.push('');
  lines.push('Concrete misses/errors, not just numbers:');
  lines.push('');
  for (const line of r.errorAnalysisLines) lines.push(line);
  lines.push('');
  lines.push('## Methodology Notes & Limitations');
  lines.push('');
  lines.push('- Ground truth labeled by a single reviewer (the author, with realism/calibration review from the project owner) — no inter-rater agreement check.');
  lines.push('- Matching is category-or-text-overlap based (`eval/scoring.js`), not exact string match or human grading — a correct finding described in unexpected wording can be scored as a miss, and coincidental keyword overlap can be scored as a hit. Spot-check `eval/predictions.json` before citing exact numbers.');
  lines.push('- "Likely cause" in the Error Analysis section is a heuristic best guess generated from available signals (severity, whether the entry was designed as a cross-clause trap, truncation), not a verified diagnosis.');
  lines.push('- Synthetic/template-based contracts may not reflect the phrasing variance of real-world documents.');
  lines.push('- Sample size (30) is small; category-level metrics (n=5) are noisy — treat as directional, not statistically robust.');
  lines.push('- Model outputs are non-deterministic even at temperature 0.2; results may vary run to run.');
  lines.push('- Each issue the LLM returns is typed `unfair_clause` or `missing_protection` (see `backend/README.md`). This dataset\'s ground truth issues are all "an unfair clause is present" traps, with no missing_protection-style entries — so `missing_protection`-typed predictions are **excluded from precision/recall scoring entirely** (they can never be true positives here by construction, and scoring them as ordinary false positives would unfairly penalize correct behavior the schema explicitly supports). They\'re tallied separately in the False Positive Rate section instead. An earlier version of this script scored them as false positives and it visibly wrecked precision (LLM precision measured ~0.29 instead of a number reflecting only unfair_clause predictions) — worth knowing if you\'re comparing against an older run.');
  lines.push('');
  lines.push('## Reproducing');
  lines.push('');
  lines.push('```bash');
  lines.push('npm run eval');
  lines.push('```');
  lines.push('');
  lines.push('Regenerates this file from `eval/dataset.json` and `eval/predictions.json`. Requires a real `GROQ_API_KEY` in `.env` — hits the live API (~30 calls, paced to stay under free-tier rate limits, so it takes several minutes).');
  lines.push('');

  return lines.join('\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
