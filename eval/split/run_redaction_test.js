#!/usr/bin/env node
// Does redaction change what the analysis finds? Each short contract (parties written by name) is analyzed
// (a) as written, (b) redacted with numbered placeholders ([NAME 1], [NAME 2]), (c) redacted with plain ones ([NAME]).
// Scored against the dataset's hand-labeled traps. Usage: node eval/split/run_redaction_test.js [--resume]
const fs = require('fs');
const path = require('path');
const { CASES } = require('./redactionCases');
const { analyzeViaRoute } = require('./harness');
const { scrubPII } = require('../../src/piiScrubber');
const { scoreDocument, aggregateScores } = require('../scoring');

const RESULTS = path.join(__dirname, 'redaction_results.json');
const NAMES = /Jane Doe|Mark Lee|Anna Petrova|Carlos Mendes|@example\.com|555-01/;
const plain = text => text.replace(/\[([A-Z ]+?) \d+\]/g, '[$1]');

(async () => {
  const done = fs.existsSync(RESULTS) && process.argv.includes('--resume') ? JSON.parse(fs.readFileSync(RESULTS, 'utf8')) : [];
  for (const { entry, text } of CASES) {
    if (done.some(r => r.id === entry.id)) continue;
    const numbered = scrubPII(text).scrubbed;
    if (NAMES.test(numbered)) throw new Error(`${entry.id}: personal details leaked through redaction:\n${numbered}`);
    const arms = { 'as written': text, 'numbered': numbered, 'plain tags': plain(numbered) };
    const row = { id: entry.id, clean: entry.is_clean, redacted: numbered, arms: {} };
    for (const [arm, input] of Object.entries(arms)) {
      process.stdout.write(`${entry.id} / ${arm}... `);
      const analysis = await analyzeViaRoute({ text: input, contractType: entry.category, label: `${entry.id}/${arm}` });
      const unfair = (analysis.issues || []).filter(i => i.type !== 'missing_protection');
      const score = scoreDocument(unfair, entry.ground_truth_issues);
      row.arms[arm] = { overall: analysis.overall_risk, flagged: unfair.map(i => `${i.severity}: ${i.title}`), ...score, matches: undefined, missedGtIndices: score.missedGtIndices, falsePositivePredIndices: undefined };
    }
    done.push(row);
    fs.writeFileSync(RESULTS, JSON.stringify(done, null, 2));
    process.stdout.write('done\n');
  }

  console.log('\n=== PER CONTRACT (traps found / traps labeled, extra flags) ===');
  for (const r of done) {
    console.log(`${r.id}${r.clean ? ' (clean)' : ''}: ` + Object.entries(r.arms).map(([arm, s]) => `${arm}: ${s.truePositives}/${s.groundTruthTotal} found, ${s.falsePositives} extra`).join(' | '));
  }
  console.log('\n=== TOTALS ===');
  for (const arm of ['as written', 'numbered', 'plain tags']) {
    const scores = done.map(r => r.arms[arm]);
    const agg = aggregateScores(scores);
    const cleanFlags = done.filter(r => r.clean).reduce((n, r) => n + r.arms[arm].predictedTotal, 0);
    console.log(`${arm.padEnd(11)} recall ${agg.recall.toFixed(2)} (${agg.truePositives}/${agg.groundTruthTotal}) | precision ${agg.precision.toFixed(2)} | extra flags ${agg.predictedTotal - agg.truePositives} | flags on the clean contract ${cleanFlags}`);
  }
})().catch(err => { console.error('\nFAILED:', err.message); process.exit(1); });
