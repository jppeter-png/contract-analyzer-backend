#!/usr/bin/env node
// Does prepending the extracted definitions to later sections change how well definition-dependent clauses are read?
// Section 1 is the same for every arm (reused from long_results.json where it exists); only section 2 is re-run per arm.
// Usage: node eval/split/run_digest_test.js [--runs N] [--resume]   (hits the live Groq API)
const fs = require('fs');
const path = require('path');
const { LONG_CONTRACTS } = require('./longContracts');
const { AMEND_CONTRACT } = require('./amendContract');
const { chunkText, mergeAnalyses } = require('./appCode');
const { extractDefinitions, buildDigest } = require('./definitions');
const { analyzeSection } = require('./harness');
const { score } = require('./score');

const runs = Number(process.argv.find((a, i) => process.argv[i - 1] === '--runs') || 2);
const RESULTS = path.join(__dirname, 'digest_results.json');
const OLD = path.join(__dirname, 'long_results.json');
const CONTRACTS = [...LONG_CONTRACTS, AMEND_CONTRACT];
const MODES = id => (id === AMEND_CONTRACT.id ? ['none', 'first', 'all'] : ['none', 'all']);
const mark = t => (t.found ? (t.informed === false ? 'generic' : 'ok') : 'MISSED');

(async () => {
  const all = fs.existsSync(RESULTS) && process.argv.includes('--resume') ? JSON.parse(fs.readFileSync(RESULTS, 'utf8')) : [];
  const old = fs.existsSync(OLD) ? JSON.parse(fs.readFileSync(OLD, 'utf8')) : [];
  const sectionOne = {};
  for (const contract of CONTRACTS) {
    const chunks = chunkText(contract.text);
    if (chunks.length !== 2) throw new Error(`${contract.id} splits into ${chunks.length} sections, expected 2`);
    const cached = old.find(r => r.contract === contract.id)?.raw.sections[0];
    const cachedSaved = all.find(r => r.contract === contract.id && r.sectionOne)?.sectionOne;
    if (cached || cachedSaved) sectionOne[contract.id] = cached || cachedSaved;
    else {
      process.stdout.write(`\n${contract.id}: section 1... `);
      sectionOne[contract.id] = await analyzeSection({ text: chunks[0], contractType: contract.contractType, chunkContext: { index: 1, total: 2 }, label: contract.id });
      all.push({ contract: contract.id, sectionOne: sectionOne[contract.id] });
    }
  }
  for (let run = 1; run <= runs; run++) {
    for (const contract of CONTRACTS) {
      const chunks = chunkText(contract.text);
      const defs = extractDefinitions(chunks);
      for (const mode of MODES(contract.id)) {
        if (all.some(r => r.contract === contract.id && r.run === run && r.mode === mode)) continue;
        const digest = mode === 'none' ? '' : buildDigest(defs, 2, mode);
        process.stdout.write(`\n${contract.id}#${run} [${mode}]: section 2... `);
        const second = await analyzeSection({ text: chunks[1], contractType: contract.contractType, chunkContext: { index: 2, total: 2 }, digest, label: contract.id });
        const merged = mergeAnalyses([sectionOne[contract.id], second]);
        all.push({ contract: contract.id, run, mode, digestChars: digest.length, result: score(contract, merged), second });
        fs.writeFileSync(RESULTS, JSON.stringify(all, null, 2));
      }
    }
  }

  const rows = all.filter(r => r.mode);
  console.log('\n\n=== PER RUN ===');
  for (const r of rows) {
    const dep = r.result.traps.filter(t => t.kind === 'dependent');
    const ctl = r.result.traps.filter(t => t.kind === 'control');
    console.log(`${r.contract.padEnd(16)} #${r.run} ${r.mode.padEnd(5)} dependent: ${dep.map(t => `${t.id}=${mark(t)}`).join(', ')} | control: ${ctl.map(t => `${t.id}=${mark(t)}`).join(', ')} | extra flags ${r.result.extras.length} | false missing ${r.result.falseMissing.length}`);
  }
  console.log('\n=== TOTALS BY MODE (old three contracts / amend contract) ===');
  for (const group of [['old', c => c !== AMEND_CONTRACT.id], ['amend', c => c === AMEND_CONTRACT.id]]) {
    for (const mode of ['none', 'first', 'all']) {
      const sel = rows.filter(r => r.mode === mode && group[1](r.contract));
      if (!sel.length) continue;
      const dep = sel.flatMap(r => r.result.traps.filter(t => t.kind === 'dependent'));
      const ctl = sel.flatMap(r => r.result.traps.filter(t => t.kind === 'control'));
      console.log(`${group[0].padEnd(6)} ${mode.padEnd(5)} dependent found ${dep.filter(t => t.found).length}/${dep.length}, explained via the definition ${dep.filter(t => t.informed).length}/${dep.length} | control ${ctl.filter(t => t.found).length}/${ctl.length} | extra flags ${sel.reduce((n, r) => n + r.result.extras.length, 0)} | false missing ${sel.reduce((n, r) => n + r.result.falseMissing.length, 0)}`);
    }
  }
})().catch(err => { console.error('\nFAILED:', err.message); process.exit(1); });
