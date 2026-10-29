#!/usr/bin/env node
// Whole vs split: each long contract is analyzed (a) whole, (b) split the way the app splits it,
// merged with the old union rule and with the new "every section agrees" rule.
// Usage: node eval/split/run_long_test.js [--runs N]   (hits the live Groq API)
const fs = require('fs');
const path = require('path');
const { LONG_CONTRACTS } = require('./longContracts');
const { chunkText, mergeAnalyses, mergeAnalysesOldUnion } = require('./appCode');
const { analyzeViaRoute, analyzeWhole, mentionsClause, predText } = require('./harness');

const runs = Number((process.argv.find((a, i) => process.argv[i - 1] === '--runs')) || 1);
const { score } = require('./score');

const mark = r => (r.found ? (r.informed === false ? 'found(generic)' : 'found') : 'MISSED');

const RESULTS = path.join(__dirname, 'long_results.json');

(async () => {
  const all = fs.existsSync(RESULTS) && process.argv.includes('--resume') ? JSON.parse(fs.readFileSync(RESULTS, 'utf8')) : [];
  for (let run = 1; run <= runs; run++) {
    for (const contract of LONG_CONTRACTS) {
      if (all.some(r => r.contract === contract.id && r.run === run)) continue;
      const label = `${contract.id}#${run}`;
      process.stdout.write(`\n${label}: whole... `);
      const whole = await analyzeWhole({ text: contract.text, contractType: contract.contractType, label });
      const chunks = chunkText(contract.text);
      const sections = [];
      for (let i = 0; i < chunks.length; i++) {
        process.stdout.write(`section ${i + 1}/${chunks.length}... `);
        sections.push(await analyzeViaRoute({ text: chunks[i], contractType: contract.contractType, chunkContext: { index: i + 1, total: chunks.length }, label }));
      }
      all.push({
        contract: contract.id, run, sections: chunks.length,
        arms: {
          whole: score(contract, whole),
          'split (old merge)': score(contract, mergeAnalysesOldUnion(sections)),
          'split (new merge)': score(contract, mergeAnalyses(sections)),
        },
        raw: { whole, sections },
      });
      fs.writeFileSync(RESULTS, JSON.stringify(all, null, 2)); // saved after every contract; --resume continues
    }
  }

  console.log('\n\n=== RESULTS (per contract) ===');
  const totals = {};
  for (const r of all) {
    console.log(`\n${r.contract} (run ${r.run}, ${r.sections} sections)`);
    for (const [arm, s] of Object.entries(r.arms)) {
      const dep = s.traps.filter(t => t.kind === 'dependent');
      const ctl = s.traps.filter(t => t.kind === 'control');
      console.log(`  ${arm.padEnd(18)} risk=${String(s.overall).padEnd(6)} dependent: ${dep.map(mark).join(', ')} | control: ${ctl.map(mark).join(', ')} | extra flags: ${s.extras.length} | false "missing": ${s.falseMissing.length ? s.falseMissing.join('; ') : 'none'}`);
      const t = totals[arm] || (totals[arm] = { depFound: 0, depInformed: 0, dep: 0, ctlFound: 0, ctl: 0, extras: 0, falseMissing: 0, protections: 0 });
      t.dep += dep.length; t.depFound += dep.filter(x => x.found).length; t.depInformed += dep.filter(x => x.informed).length;
      t.ctl += ctl.length; t.ctlFound += ctl.filter(x => x.found).length;
      t.extras += s.extras.length; t.falseMissing += s.falseMissing.length; t.protections += LONG_CONTRACTS.find(c => c.id === r.contract).presentProtections.length;
    }
  }
  console.log('\n=== TOTALS ===');
  for (const [arm, t] of Object.entries(totals)) {
    console.log(`${arm.padEnd(18)} dependent traps found ${t.depFound}/${t.dep} (found AND explained via the definition: ${t.depInformed}) | control traps ${t.ctlFound}/${t.ctl} | extra (unmatched) flags ${t.extras} | present protections wrongly called missing ${t.falseMissing}/${t.protections}`);
  }
  console.log('\nExtra flags and all details are in eval/split/long_results.json');
})().catch(err => { console.error('\nFAILED:', err.message); process.exit(1); });
