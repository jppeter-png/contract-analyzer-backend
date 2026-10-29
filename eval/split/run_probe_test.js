#!/usr/bin/env node
// Application-failure probe: in whole mode (full document in one call) each issue also names the defined term it
// relied on. For the definition-dependent traps: did the model flag the clause, and did it name the right term
// (and, for amended terms, the amended wording)? Usage: node eval/split/run_probe_test.js [--runs N]
const fs = require('fs');
const path = require('path');
const { LONG_CONTRACTS } = require('./longContracts');
const { AMEND_CONTRACT } = require('./amendContract');
const { analyzeWhole, mentionsClause } = require('./harness');

const runs = Number(process.argv.find((a, i) => process.argv[i - 1] === '--runs') || 2);
const RESULTS = path.join(__dirname, 'probe_results.json');
const PROBE = '\n\nExtra field for this run: in every object of "issues", add a string field "definition_used". Set it to the defined term (in quotes) from the contract\'s definitions that this issue depends on, followed by a short paraphrase of the definition as you read it, or "none" if the issue does not depend on a defined term. Do not change anything else about the output format.';

// The term each dependent trap hinges on, and words that only appear in the risky (amended) wording of that term.
const EXPECT = {
  'additional-rent': { term: 'additional rent', wording: ['sole discretion', 'any kind', 'whether or not itemized', 'itemized'] },
  'premises-damage': { term: 'premises damage', wording: ['wear and tear', 'ordinary'] },
  'cause-forfeiture': { term: 'cause', wording: ['sole judgment', 'reflects poorly', 'whether or not'] },
  'confidentiality-liquidated': { term: 'confidential information', wording: ['general skills', 'any information', 'whether or not'] },
  'fees-payment': { term: 'fees', wording: ['posting', 'website', 'announce', 'additional charge', 'from time to time'] },
  'deliverables-ownership': { term: 'deliverables', wording: ['excluding', 'paid in full', 'cash', 'tools'] },
  'termination-cause': { term: 'cause', wording: ['sole discretion', 'harmful', 'whether or not', 'considers'] },
};

(async () => {
  const all = fs.existsSync(RESULTS) && process.argv.includes('--resume') ? JSON.parse(fs.readFileSync(RESULTS, 'utf8')) : [];
  for (let run = 1; run <= runs; run++) {
    for (const contract of [...LONG_CONTRACTS, AMEND_CONTRACT]) {
      if (all.some(r => r.contract === contract.id && r.run === run)) continue;
      process.stdout.write(`\n${contract.id}#${run}: whole (probe)... `);
      const analysis = await analyzeWhole({ text: contract.text, contractType: contract.contractType, label: contract.id, extraSystem: PROBE });
      all.push({ contract: contract.id, run, analysis });
      fs.writeFileSync(RESULTS, JSON.stringify(all, null, 2));
    }
  }

  const tally = { traps: 0, noIssue: 0, none: 0, wrongTerm: 0, rightTermGeneric: 0, rightTermAmended: 0 };
  console.log('\n\n=== PER TRAP ===');
  for (const r of all) {
    const contract = [...LONG_CONTRACTS, AMEND_CONTRACT].find(c => c.id === r.contract);
    const issues = (r.analysis.issues || []).filter(i => i.type !== 'missing_protection');
    for (const trap of contract.trapsDependent) {
      const expect = EXPECT[trap.id];
      // The model often flags the definition itself ("Vague definition of Cause") rather than the later clause, so an issue
      // that is about the clause OR about the hinge term counts as covering the trap.
      const issue = issues.find(i => mentionsClause(i, trap.excerpt) || `${i.title} ${i.description}`.toLowerCase().includes(expect.term));
      tally.traps++;
      let verdict;
      if (!issue) { verdict = 'NO ISSUE'; tally.noIssue++; }
      else {
        const used = String(issue.definition_used || '').toLowerCase();
        if (!used || used === 'none' || used.startsWith('none')) { verdict = 'names no definition'; tally.none++; }
        else if (!used.includes(expect.term)) { verdict = 'names a different term'; tally.wrongTerm++; }
        else if (expect.wording.some(w => used.includes(w) || `${issue.title} ${issue.description}`.toLowerCase().includes(w))) { verdict = 'right term, risky wording applied'; tally.rightTermAmended++; }
        else { verdict = 'right term, wording not applied'; tally.rightTermGeneric++; }
      }
      console.log(`${r.contract.padEnd(16)} #${r.run} ${trap.id.padEnd(26)} ${verdict}${issue ? `  | ${String(issue.definition_used).slice(0, 110)}` : ''}`);
    }
  }
  console.log(`\n=== TOTALS (${tally.traps} trap readings) ===`);
  console.log(`no issue at all ${tally.noIssue} | issue names no definition ${tally.none} | names a different term ${tally.wrongTerm} | right term, risky wording NOT applied ${tally.rightTermGeneric} | right term, risky wording applied ${tally.rightTermAmended}`);
})().catch(err => { console.error('\nFAILED:', err.message); process.exit(1); });
