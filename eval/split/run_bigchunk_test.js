#!/usr/bin/env node
// Bigger sections on Groq: ~60,000-character contracts analyzed (A) split into 8,000-character sections (today),
// (B) split into 30,000-character sections, (C) whole in one call. Same prompt, same scoring as run_prompt_test.js.
// Usage: EVAL_GAP_MS=1500 node eval/split/run_bigchunk_test.js [--runs N] [--resume]   (hits the live Groq API)
const fs = require('fs');
const path = require('path');
const { MEGA_CONTRACTS } = require('./megaContracts');
const { chunkText, mergeAnalyses } = require('./appCode');
const { analyzeSection, analyzeWhole, counters, mentionsClause, predText } = require('./harness');
const { score } = require('./score');
const { hingeFor } = require('./hinges');

const runs = Number(process.argv.find((a, i) => process.argv[i - 1] === '--runs') || 2);
const RESULTS = path.join(__dirname, 'bigchunk_results.json');
const MAX_TOKENS = 8192;
const ARMS = ['A: 8,000-char sections (today)', 'B: 30,000-char sections', 'C: whole document, one call'];

async function runArm(arm, contract) {
  const base = { contractType: contract.contractType, label: contract.id, maxTokens: MAX_TOKENS };
  if (arm.startsWith('C')) return analyzeWhole({ ...base, text: contract.text });
  const size = arm.startsWith('A') ? 8000 : 30000;
  const chunks = chunkText(contract.text, size);
  const sections = [];
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`s${i + 1}/${chunks.length} `);
    sections.push(await analyzeSection({ ...base, text: chunks[i], chunkContext: { index: i + 1, total: chunks.length } }));
  }
  return chunks.length === 1 ? sections[0] : mergeAnalyses(sections);
}

function judge(contract, analysis) {
  const issues = (analysis.issues || []).filter(i => i.type !== 'missing_protection');
  return contract.trapsDependent.map(trap => {
    const h = hingeFor(trap);
    const covering = issues.filter(i => mentionsClause(i, trap.excerpt) || predText(i).includes(h.term));
    return { id: trap.id, covered: covering.length > 0, applied: covering.some(i => h.awareOf.some(w => predText(i).includes(w))) };
  });
}

(async () => {
  const all = fs.existsSync(RESULTS) && process.argv.includes('--resume') ? JSON.parse(fs.readFileSync(RESULTS, 'utf8')) : [];
  for (let run = 1; run <= runs; run++) for (const contract of MEGA_CONTRACTS) for (const arm of ARMS) {
    if (all.some(r => r.contract === contract.id && r.run === run && r.arm === arm)) continue;
    process.stdout.write(`\n${contract.id}#${run} [${arm}] `);
    const before = counters.calls.length;
    const analysis = await runArm(arm, contract);
    const calls = counters.calls.slice(before);
    all.push({ contract: contract.id, run, arm, analysis, calls });
    fs.writeFileSync(RESULTS, JSON.stringify(all, null, 2));
  }

  console.log('\n\n=== PER TRAP (A = definition applied, c = flagged but generic, - = not flagged) ===');
  const totals = {};
  for (const contract of MEGA_CONTRACTS) {
    for (const trap of contract.trapsDependent) {
      const cells = ARMS.map(arm => {
        const reads = all.filter(r => r.contract === contract.id && r.arm === arm).map(r => judge(contract, r.analysis).find(j => j.id === trap.id));
        const t = (totals[arm] = totals[arm] || { n: 0, applied: 0, covered: 0, ctl: 0, ctlFound: 0, extras: 0, calls: 0, length: 0, maxCompletion: 0, maxPrompt: 0 });
        reads.forEach(j => { t.n++; t.applied += j.applied; t.covered += j.covered; });
        return `${arm[0]}:${reads.map(j => (j.applied ? 'A' : j.covered ? 'c' : '-')).join('')}`;
      });
      console.log(`${contract.id.padEnd(22)} ${trap.id.padEnd(26)} ${cells.join('   ')}`);
    }
  }
  for (const r of all) {
    const contract = MEGA_CONTRACTS.find(c => c.id === r.contract);
    const t = totals[r.arm];
    const s = score({ ...contract, trapsDependent: [], presentProtections: [] }, r.analysis);
    t.ctl += s.traps.length; t.ctlFound += s.traps.filter(x => x.found).length; t.extras += s.extras.length;
    t.calls += r.calls.length;
    for (const c of r.calls) { if (c.finish === 'length') t.length++; t.maxCompletion = Math.max(t.maxCompletion, c.completion || 0); t.maxPrompt = Math.max(t.maxPrompt, c.prompt || 0); }
  }
  console.log('\n=== TOTALS ===');
  for (const arm of ARMS) {
    const t = totals[arm];
    console.log(`${arm.padEnd(34)} applied ${t.applied}/${t.n} (covered ${t.covered}/${t.n}) | loud control ${t.ctlFound}/${t.ctl} | extra flags ${t.extras} | AI calls ${t.calls} | cut off at the token cap ${t.length} | largest answer ${t.maxCompletion} tokens | largest input ${t.maxPrompt} tokens`);
  }
})().catch(err => { console.error('\nFAILED:', err.message); process.exit(1); });
