#!/usr/bin/env node
// Evaluation harness: runs the real Groq/Llama analysis pipeline against a
// hand-labeled fixture set and scores it against a naive keyword baseline.
//
// Usage: npm run eval   (from backend/) — or `node eval/run.js` from backend/.
// Loads backend/.env itself via a relative path, so it must stay at backend/eval/.
//
// Methodology:
// - Each fixture has hand-authored `trap_clauses`, each with a short
//   `description` and a list of `signal_terms` — words/phrases we'd expect a
//   correct write-up of that issue to use.
// - A trap counts as DETECTED by a system if at least one of that system's
//   reported issues/flags contains one of the trap's signal_terms.
// - LLM issues come from the real /api/analyze prompt + Groq call.
// - Baseline flags come from a small, generic, category-agnostic list of
//   "risky legal phrase" substrings (eval/keywords.js) — authored
//   independently of the fixtures' signal_terms, to avoid a tautological
//   baseline. Some overlap is expected and is the point: it shows which
//   traps *are* keyword-obvious vs. which need contextual understanding.
// - Clean fixtures (no traps) measure the false-positive rate: any flag on a
//   clean contract is a false positive by definition.
//
// This is a coarse, automatable proxy for "did the system catch the right
// issue," not a human-graded rubric — see the caveats section this script
// writes into results.md.

const fs = require('fs');
const path = require('path');
require(path.join(__dirname, '..', 'node_modules', 'dotenv'))
  .config({ path: path.join(__dirname, '..', '.env') });

const analyzeRouter = require('../src/routes/analyze');
const { scanBaseline } = require('./keywords');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const RESULTS_JSON = path.join(__dirname, 'results.json');
const RESULTS_MD = path.join(__dirname, 'results.md');

function loadFixtures() {
  const files = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.js'));
  return files.flatMap(f => require(path.join(FIXTURES_DIR, f)));
}

function textIncludesAny(text, terms) {
  const lower = text.toLowerCase();
  return terms.some(term => lower.includes(term.toLowerCase()));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Groq's free tier enforces a tokens-per-minute cap; on 429s it tells us
// exactly how long to wait. Respect that instead of hammering it.
async function callGroqWithRetry(systemPrompt, userContent, attempts = 8) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await analyzeRouter.callGroq(systemPrompt, userContent);
    } catch (err) {
      lastErr = err;
      const waitMatch = err.message.match(/try again in ([\d.]+)s/i);
      if (waitMatch) {
        // Reported wait can be a misleadingly small sub-second figure that
        // doesn't reflect the real per-minute bucket refill — floor it.
        const waitMs = Math.max(Math.ceil(parseFloat(waitMatch[1]) * 1000) + 500, 2000);
        process.stdout.write(`[rate limited, waiting ${(waitMs / 1000).toFixed(1)}s] `);
        await sleep(waitMs);
      } else if (err instanceof SyntaxError) {
        // Likely a truncated/malformed completion — brief pause, then retry.
        await sleep(1000);
      } else {
        break; // non-retryable
      }
    }
  }
  throw lastErr;
}

function scoreLLM(fixture, analysis) {
  const issues = analysis.issues || [];
  const issueTexts = issues.map(i => `${i.category} ${i.title} ${i.description} ${i.recommendation}`);

  const trapResults = (fixture.trap_clauses || []).map(trap => ({
    id: trap.id,
    detected: issueTexts.some(t => textIncludesAny(t, trap.signal_terms)),
  }));

  const issueIsTruePositive = issueTexts.map(t =>
    (fixture.trap_clauses || []).some(trap => textIncludesAny(t, trap.signal_terms))
  );

  return {
    issuesRaised: issues.length,
    truePositiveIssues: issueIsTruePositive.filter(Boolean).length,
    trapResults,
    trapsDetected: trapResults.filter(t => t.detected).length,
    trapsTotal: trapResults.length,
  };
}

function scoreBaseline(fixture) {
  const matchedPhrases = scanBaseline(fixture.text);

  const trapResults = (fixture.trap_clauses || []).map(trap => {
    const lowerTerms = trap.signal_terms.map(t => t.toLowerCase());
    const detected = matchedPhrases.some(phrase =>
      lowerTerms.some(term => term === phrase || term.includes(phrase) || phrase.includes(term))
    );
    return { id: trap.id, detected };
  });

  const phraseIsTruePositive = matchedPhrases.map(phrase =>
    (fixture.trap_clauses || []).some(trap =>
      trap.signal_terms.some(term => {
        const t = term.toLowerCase();
        return t === phrase || t.includes(phrase) || phrase.includes(t);
      })
    )
  );

  return {
    issuesRaised: matchedPhrases.length,
    truePositiveIssues: phraseIsTruePositive.filter(Boolean).length,
    matchedPhrases,
    trapResults,
    trapsDetected: trapResults.filter(t => t.detected).length,
    trapsTotal: trapResults.length,
  };
}

// Precision is issue-level ("of the issues we raised, how many were real"),
// recall is trap-level ("of the labeled traps, how many did we catch") — these
// are different units by design (one issue can cover a trap, and traps can be
// covered without a 1:1 issue mapping), so they're computed and passed in
// separately rather than both being some-count-over-actualTotal.
function precisionRecallF1(truePositiveIssues, issuesRaised, trapsDetected, trapsTotal) {
  const precision = issuesRaised > 0 ? truePositiveIssues / issuesRaised : null;
  const recall = trapsTotal > 0 ? trapsDetected / trapsTotal : null;
  const f1 = precision != null && recall != null && (precision + recall) > 0
    ? (2 * precision * recall) / (precision + recall)
    : null;
  return { precision, recall, f1 };
}

function fmtPct(x) {
  return x == null ? 'n/a' : `${(x * 100).toFixed(1)}%`;
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set (checked backend/.env). Aborting.');
    process.exit(1);
  }

  const fixtures = loadFixtures();
  const trapFixtures = fixtures.filter(f => !f.clean);
  const cleanFixtures = fixtures.filter(f => f.clean);

  console.log(`Loaded ${fixtures.length} fixtures (${trapFixtures.length} with traps, ${cleanFixtures.length} clean).`);

  const perDoc = [];
  const errors = [];

  for (const fixture of fixtures) {
    process.stdout.write(`Analyzing ${fixture.id}... `);
    const systemPrompt = analyzeRouter.PROMPTS[fixture.category] || analyzeRouter.PROMPTS.auto;
    const userContent = `Analyze this contract:\n\n${fixture.text.slice(0, analyzeRouter.MAX_INPUT_CHARS)}`;

    let analysis = null;
    let error = null;
    try {
      analysis = await callGroqWithRetry(systemPrompt, userContent);
    } catch (err) {
      error = err.message;
      errors.push({ id: fixture.id, error: err.message });
    }

    const llm = analysis ? scoreLLM(fixture, analysis) : null;
    const baseline = scoreBaseline(fixture);

    perDoc.push({
      id: fixture.id,
      category: fixture.category,
      clean: !!fixture.clean,
      error,
      llmOverallRisk: analysis?.overall_risk ?? null,
      llm,
      baseline,
      rawIssues: analysis?.issues ?? null, // for local spot-checking only; results.json is gitignored
    });

    console.log(error ? `ERROR: ${error}` : 'done');
    await sleep(13000); // stay well under the free-tier tokens-per-minute cap
  }

  // ---- Aggregate: trap detection (precision/recall/F1) on non-clean docs ----
  const trapDocs = perDoc.filter(d => !d.clean && !d.error);

  const llmAgg = trapDocs.reduce((acc, d) => ({
    tp: acc.tp + d.llm.truePositiveIssues,
    predicted: acc.predicted + d.llm.issuesRaised,
    actual: acc.actual + d.llm.trapsTotal,
    trapsDetected: acc.trapsDetected + d.llm.trapsDetected,
  }), { tp: 0, predicted: 0, actual: 0, trapsDetected: 0 });

  const baselineAgg = trapDocs.reduce((acc, d) => ({
    tp: acc.tp + d.baseline.truePositiveIssues,
    predicted: acc.predicted + d.baseline.issuesRaised,
    actual: acc.actual + d.baseline.trapsTotal,
    trapsDetected: acc.trapsDetected + d.baseline.trapsDetected,
  }), { tp: 0, predicted: 0, actual: 0, trapsDetected: 0 });

  const llmScores = precisionRecallF1(llmAgg.tp, llmAgg.predicted, llmAgg.trapsDetected, llmAgg.actual);
  const baselineScores = precisionRecallF1(baselineAgg.tp, baselineAgg.predicted, baselineAgg.trapsDetected, baselineAgg.actual);

  // Recall by trap-count (traps detected / traps total) — the headline number.
  const llmRecallByTrap = llmAgg.trapsDetected / llmAgg.actual;
  const baselineRecallByTrap = baselineAgg.trapsDetected / baselineAgg.actual;

  // ---- False positive rate on clean docs ----
  const cleanDocs = perDoc.filter(d => d.clean && !d.error);
  const llmFP = {
    docsWithAnyIssue: cleanDocs.filter(d => d.llm.issuesRaised > 0).length,
    totalIssues: cleanDocs.reduce((s, d) => s + d.llm.issuesRaised, 0),
    totalDocs: cleanDocs.length,
  };
  const baselineFP = {
    docsWithAnyIssue: cleanDocs.filter(d => d.baseline.issuesRaised > 0).length,
    totalIssues: cleanDocs.reduce((s, d) => s + d.baseline.issuesRaised, 0),
    totalDocs: cleanDocs.length,
  };

  // ---- Per-category recall (LLM) ----
  const categories = [...new Set(trapDocs.map(d => d.category))].sort();
  const perCategory = categories.map(cat => {
    const docs = trapDocs.filter(d => d.category === cat);
    const llmDetected = docs.reduce((s, d) => s + d.llm.trapsDetected, 0);
    const baseDetected = docs.reduce((s, d) => s + d.baseline.trapsDetected, 0);
    const total = docs.reduce((s, d) => s + d.llm.trapsTotal, 0);
    return { category: cat, docs: docs.length, total, llmDetected, baseDetected };
  });

  const results = {
    generatedAt: new Date().toISOString(),
    model: 'openai/gpt-oss-120b (Groq)',
    fixtureCounts: { total: fixtures.length, withTraps: trapFixtures.length, clean: cleanFixtures.length },
    errors,
    aggregate: { llm: { ...llmAgg, ...llmScores, recallByTrap: llmRecallByTrap }, baseline: { ...baselineAgg, ...baselineScores, recallByTrap: baselineRecallByTrap } },
    falsePositives: { llm: llmFP, baseline: baselineFP },
    perCategory,
    perDoc,
  };

  fs.writeFileSync(RESULTS_JSON, JSON.stringify(results, null, 2));

  const md = renderMarkdown(results);
  fs.writeFileSync(RESULTS_MD, md);

  console.log(`\nWrote ${RESULTS_JSON}`);
  console.log(`Wrote ${RESULTS_MD}`);
}

function renderMarkdown(r) {
  const lines = [];
  lines.push('# Evaluation Results');
  lines.push('');
  lines.push(`Generated: ${r.generatedAt}`);
  lines.push(`Model: ${r.model}`);
  lines.push(`Fixtures: ${r.fixtureCounts.total} total — ${r.fixtureCounts.withTraps} with hand-labeled trap clauses, ${r.fixtureCounts.clean} clean (no traps), spanning all 6 contract categories.`);
  if (r.errors.length) {
    lines.push('');
    lines.push(`⚠ ${r.errors.length} fixture(s) failed to analyze and were excluded from the aggregates below: ${r.errors.map(e => e.id).join(', ')}.`);
  }
  lines.push('');
  lines.push('## Headline: trap-clause recall');
  lines.push('');
  lines.push('| System | Traps detected | Traps total | Recall |');
  lines.push('|---|---|---|---|');
  const modelName = r.model.replace(/\s*\(Groq\)$/, '');
  lines.push(`| LLM (${modelName}) | ${r.aggregate.llm.trapsDetected} | ${r.aggregate.llm.actual} | **${fmtPct(r.aggregate.llm.recallByTrap)}** |`);
  lines.push(`| Keyword baseline | ${r.aggregate.baseline.trapsDetected} | ${r.aggregate.baseline.actual} | ${fmtPct(r.aggregate.baseline.recallByTrap)} |`);
  lines.push('');
  lines.push('## Precision / Recall / F1');
  lines.push('');
  lines.push('Precision is issue-level: "of the issues/flags raised, how many corresponded to an actual labeled trap." Recall is the same trap-level number as the headline table above ("of the labeled traps, how many did we catch") — reused here to compute a combined F1, since precision and recall are necessarily different units (issues raised vs. traps caught) rather than two measurements of the same thing.');
  lines.push('');
  lines.push('| System | Precision | Recall | F1 |');
  lines.push('|---|---|---|---|');
  lines.push(`| LLM | ${fmtPct(r.aggregate.llm.precision)} | ${fmtPct(r.aggregate.llm.recall)} | ${fmtPct(r.aggregate.llm.f1)} |`);
  lines.push(`| Keyword baseline | ${fmtPct(r.aggregate.baseline.precision)} | ${fmtPct(r.aggregate.baseline.recall)} | ${fmtPct(r.aggregate.baseline.f1)} |`);
  lines.push('');
  lines.push('## False-positive rate (clean contracts)');
  lines.push('');
  lines.push(`${r.falsePositives.llm.totalDocs} clean contracts (no intentional trap clauses) were run through both systems.`);
  lines.push('');
  lines.push('| System | Docs with ≥1 flag | Total flags raised |');
  lines.push('|---|---|---|');
  lines.push(`| LLM | ${r.falsePositives.llm.docsWithAnyIssue} / ${r.falsePositives.llm.totalDocs} | ${r.falsePositives.llm.totalIssues} |`);
  lines.push(`| Keyword baseline | ${r.falsePositives.baseline.docsWithAnyIssue} / ${r.falsePositives.baseline.totalDocs} | ${r.falsePositives.baseline.totalIssues} |`);
  lines.push('');
  lines.push('**What the LLM actually flags on clean contracts** (manually inspected in `eval/results.json`): not fabricated risky clauses, but real gaps — e.g. "no overtime/exempt classification stated," "missing benefits/equity provisions," "undefined \'cause\' for termination." The system prompt explicitly asks for `missing_protections`, and a short contract will always be missing *something* relative to an exhaustive standard, so a nonzero flag count here is expected behavior, not hallucination. The practical risk is UX, not accuracy: the `overall_risk` field came back `"medium"` (occasionally `"high"`) on every clean contract in this set, which could read as alarming to a non-lawyer user looking at an otherwise fair contract. Consider whether "missing standard clause" issues should be visually distinct from "actively unfair clause" issues in the app, and whether `overall_risk` should weight the two differently.');
  lines.push('');
  lines.push('## Recall by category (traps detected / traps total)');
  lines.push('');
  lines.push('| Category | Docs | LLM | Baseline |');
  lines.push('|---|---|---|---|');
  for (const c of r.perCategory) {
    lines.push(`| ${c.category} | ${c.docs} | ${c.llmDetected}/${c.total} (${fmtPct(c.llmDetected / c.total)}) | ${c.baseDetected}/${c.total} (${fmtPct(c.baseDetected / c.total)}) |`);
  }
  lines.push('');
  lines.push('## Per-document detail');
  lines.push('');
  lines.push('| Doc | Category | Clean? | Overall risk (LLM) | LLM traps | Baseline traps | LLM issues raised | Baseline flags raised |');
  lines.push('|---|---|---|---|---|---|---|---|');
  for (const d of r.perDoc) {
    if (d.error) {
      lines.push(`| ${d.id} | ${d.category} | ${d.clean} | ERROR: ${d.error} | — | — | — | — |`);
      continue;
    }
    const llmTraps = d.clean ? '—' : `${d.llm.trapsDetected}/${d.llm.trapsTotal}`;
    const baseTraps = d.clean ? '—' : `${d.baseline.trapsDetected}/${d.baseline.trapsTotal}`;
    lines.push(`| ${d.id} | ${d.category} | ${d.clean} | ${d.llmOverallRisk} | ${llmTraps} | ${baseTraps} | ${d.llm.issuesRaised} | ${d.baseline.issuesRaised} |`);
  }
  lines.push('');
  lines.push('## Methodology & caveats');
  lines.push('');
  lines.push('- **Detection = keyword match on the write-up, not the reader.** A trap counts as "detected" if any signal term for that trap appears in the LLM\'s issue text (category/title/description/recommendation). This is an automatable proxy, not a human grading rubric — the LLM could theoretically describe a real issue accurately using none of the chosen signal terms (false negative in this eval, not necessarily in reality), or use a signal term in an unrelated context (false positive in this eval). Spot-check `eval/results.json` before citing exact numbers.');
  lines.push('- **Baseline is intentionally naive**: `eval/keywords.js` is a fixed, category-agnostic list of ~30 common "risky legal phrase" substrings, authored independently of the fixtures\' signal terms. It will catch traps built around a recognizable trigger word (non-compete, arbitration, perpetual/irrevocable, cross-default...) and miss traps that are purely relational/contextual (e.g. shifting structural-repair liability onto a tenant, a mismatched amortization schedule creating a hidden balloon payment) — that gap is the point of comparing them.');
  lines.push('- **Small sample.** 18 trap contracts / 36 labeled traps is enough to see a directional signal, not enough for tight confidence intervals. Treat category-level breakdowns as especially noisy (3 docs/category).');
  lines.push('- **Fixtures are synthetic**, written to exercise the specific risk categories each contract-type prompt in `backend/src/routes/analyze.js` already claims to look for — this measures "does it do what it says," not performance on arbitrary real-world contracts.');
  lines.push('');
  return lines.join('\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
