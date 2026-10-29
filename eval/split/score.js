// Scores one analysis against a long contract's traps (shared by the whole-vs-split and digest experiments).
const { mentionsClause, predText } = require('./harness');

const clauseIssues = a => (a.issues || []).filter(i => i.type !== 'missing_protection');
const hasAll = (text, groups = [], anyOf) =>
  groups.every(group => group.some(w => text.includes(w))) && (!anyOf || anyOf.some(w => text.includes(w)));

function score(contract, analysis) {
  const issues = clauseIssues(analysis);
  const used = new Set();
  const trapResult = (trap, kind) => {
    const index = issues.findIndex((issue, i) => !used.has(i) && mentionsClause(issue, trap.excerpt));
    if (index >= 0) used.add(index);
    const issue = issues[index];
    const informed = issue && (trap.awareOf || []).some(w => predText(issue).includes(w));
    return { id: trap.id, kind, found: index >= 0, informed: kind === 'dependent' ? Boolean(informed) : null, severity: issue?.severity, title: issue?.title };
  };
  const traps = [
    ...contract.trapsDependent.map(t => trapResult(t, 'dependent')),
    ...contract.trapsControl.map(t => trapResult(t, 'control')),
  ];
  const extras = issues.filter((_, i) => !used.has(i)).map(i => `${i.severity}: ${i.title}`);
  const missingTexts = [
    ...(analysis.missing_protections || []),
    ...(analysis.issues || []).filter(i => i.type === 'missing_protection').map(i => `${i.title} ${i.description}`),
  ].map(s => s.toLowerCase());
  const falseMissing = contract.presentProtections
    .filter(p => missingTexts.some(m => hasAll(m, p.allOf, p.anyOf)))
    .map(p => p.name);
  return { overall: analysis.overall_risk, traps, extras, falseMissing, missingListed: missingTexts.length };
}

module.exports = { score, clauseIssues };
