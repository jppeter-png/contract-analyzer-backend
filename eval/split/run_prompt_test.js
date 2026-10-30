#!/usr/bin/env node
// Does a "defined terms" rule in the system prompt help the model apply quiet definitions? Whole mode, same contracts,
// prompt with vs without the rule. Old contracts = the ones the rule was designed against; quiet contracts = held out.
// A trap counts as COVERED when an issue is about the clause or the hinge term, and APPLIED when that issue's text
// also contains wording that only follows from the definition. Usage: node eval/split/run_prompt_test.js [--runs N] [--resume]
const fs = require('fs');
const path = require('path');
const { LONG_CONTRACTS } = require('./longContracts');
const { AMEND_CONTRACT } = require('./amendContract');
const { QUIET_CONTRACTS } = require('./quietContracts');
const { analyzeWhole, mentionsClause, predText } = require('./harness');
const { score } = require('./score');

const runs = Number(process.argv.find((a, i) => process.argv[i - 1] === '--runs') || 2);
const RESULTS = path.join(__dirname, 'prompt_results.json');

const DEFINED_TERMS_RULE = '\n\nDEFINED TERMS: Contracts often hide risk in their definitions. Before judging the clauses, read the definitions and any clause that changes them. When a clause uses a defined term, read it with the definition substituted in. Look especially for definitions that (a) include things the term would not normally cover, (b) exclude or carve out part of what the clause seems to give, often on a condition like payment or approval, or (c) leave the amount, scope or trigger to one party\'s discretion. If a definition makes a clause riskier or emptier than it reads, flag the clause itself, not only the definition, and name the definition in the description.';
const ARMS = { baseline: '', 'defined-terms rule': DEFINED_TERMS_RULE };

const { OLD } = require('./hinges');
const GROUPS = [
  { name: 'original traps', contracts: [...LONG_CONTRACTS, AMEND_CONTRACT], hinge: t => OLD[t.id] },
  { name: 'held-out quiet traps', contracts: QUIET_CONTRACTS, hinge: t => t },
];

function judge(contract, hinge, analysis) {
  const issues = (analysis.issues || []).filter(i => i.type !== 'missing_protection');
  return contract.trapsDependent.map(trap => {
    const h = hinge(trap);
    const covering = issues.filter(i => mentionsClause(i, trap.excerpt) || predText(i).includes(h.term));
    const applied = covering.some(i => h.awareOf.some(w => predText(i).includes(w)));
    return { id: trap.id, covered: covering.length > 0, applied, titles: covering.map(i => i.title) };
  });
}

(async () => {
  const all = fs.existsSync(RESULTS) && process.argv.includes('--resume') ? JSON.parse(fs.readFileSync(RESULTS, 'utf8')) : [];
  for (let run = 1; run <= runs; run++) {
    for (const group of GROUPS) for (const contract of group.contracts) for (const [arm, extra] of Object.entries(ARMS)) {
      if (all.some(r => r.contract === contract.id && r.run === run && r.arm === arm)) continue;
      process.stdout.write(`\n${contract.id}#${run} [${arm}]... `);
      const analysis = await analyzeWhole({ text: contract.text, contractType: contract.contractType, label: contract.id, extraSystem: extra });
      all.push({ contract: contract.id, run, arm, analysis });
      fs.writeFileSync(RESULTS, JSON.stringify(all, null, 2));
    }
  }

  console.log('\n\n=== PER TRAP (A = definition applied, c = covered but generic, - = not flagged) ===');
  const totals = {};
  for (const group of GROUPS) {
    for (const contract of group.contracts) {
      for (const trap of contract.trapsDependent) {
        const cells = Object.keys(ARMS).map(arm => {
          const reads = all.filter(r => r.contract === contract.id && r.arm === arm).map(r => judge(contract, group.hinge, r.analysis).find(j => j.id === trap.id));
          const t = (totals[`${group.name}|${arm}`] = totals[`${group.name}|${arm}`] || { n: 0, covered: 0, applied: 0, extras: 0, ctlFound: 0, ctl: 0, risk: 0 });
          reads.forEach(j => { t.n++; t.covered += j.covered; t.applied += j.applied; });
          return `${arm}: ${reads.map(j => (j.applied ? 'A' : j.covered ? 'c' : '-')).join('')}`;
        });
        console.log(`${contract.id.padEnd(18)} ${trap.id.padEnd(28)} ${cells.join('   ')}`);
      }
      for (const arm of Object.keys(ARMS)) {
        const t = totals[`${group.name}|${arm}`];
        for (const r of all.filter(x => x.contract === contract.id && x.arm === arm)) {
          const s = score({ ...contract, trapsDependent: [], presentProtections: [] }, r.analysis);
          t.extras += s.extras.length; t.ctl += s.traps.length; t.ctlFound += s.traps.filter(x => x.found).length;
        }
      }
    }
  }
  console.log('\n=== TOTALS ===');
  for (const group of GROUPS) for (const arm of Object.keys(ARMS)) {
    const t = totals[`${group.name}|${arm}`];
    console.log(`${group.name.padEnd(22)} ${arm.padEnd(20)} covered ${t.covered}/${t.n} | definition applied ${t.applied}/${t.n} | loud control traps found ${t.ctlFound}/${t.ctl} | unmatched extra flags ${t.extras}`);
  }
})().catch(err => { console.error('\nFAILED:', err.message); process.exit(1); });
