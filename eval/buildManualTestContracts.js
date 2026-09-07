const fs = require('fs');
const path = require('path');

const dataset = require('./dataset.json');
const OUT_DIR = path.join(__dirname, 'manual-test-contracts');

fs.mkdirSync(OUT_DIR, { recursive: true });

const SEVERITY_EMOJI = { high: '🔴', medium: '🟡', low: '🟢' };

for (const entry of dataset) {
  // The contract itself, ready to paste into "Paste text" or upload as a .txt file.
  fs.writeFileSync(path.join(OUT_DIR, `${entry.id}.txt`), entry.text);

  // A short companion doc: what a correct analysis should find.
  const lines = [];
  lines.push(`# ${entry.id}`);
  lines.push('');
  lines.push(`**Category:** ${entry.category}  `);
  lines.push(`**Clean (no injected traps):** ${entry.is_clean ? 'Yes' : 'No'}  `);
  lines.push(`**Source:** ${entry.source}`);
  lines.push('');
  lines.push(`Test file: [\`${entry.id}.txt\`](${entry.id}.txt)`);
  lines.push('');

  if (entry.is_clean) {
    lines.push('## Expected result');
    lines.push('');
    lines.push('No trap clauses were injected into this contract. A good analysis should not report any actively unfair clause (`unfair_clause`-typed issue). It may reasonably note a few standard protections as absent (`missing_protection`-typed issues) — that alone isn\'t a false positive, see the main README\'s note on the `type` field.');
    lines.push('');
  } else {
    lines.push(`## Expected findings (${entry.ground_truth_issues.length})`);
    lines.push('');
    for (const issue of entry.ground_truth_issues) {
      const emoji = SEVERITY_EMOJI[issue.severity] || '';
      lines.push(`### ${emoji} ${issue.category} (${issue.severity})`);
      lines.push('');
      lines.push(`> ${issue.clause_excerpt}`);
      lines.push('');
      lines.push(issue.why_its_a_trap);
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "' + entry.id + '"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.');
  lines.push('');

  fs.writeFileSync(path.join(OUT_DIR, `${entry.id}.expected.md`), lines.join('\n'));
}

console.log(`Wrote ${dataset.length * 2} files to ${OUT_DIR}`);
