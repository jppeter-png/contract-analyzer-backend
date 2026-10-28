// Short contracts from the labeled dataset, rewritten so the parties appear by name in the clauses
// ("Jane Doe may enter" instead of "Landlord may enter"), with contact details on the signature line.
// The raw text keeps the names; scrubbed arms hide them, numbered ([NAME 1]) or plain ([NAME]).
const dataset = require('../dataset.json');

const PAIRS = {
  lease: [['Landlord', 'Jane Doe', 'jane.doe@example.com', '415-555-0142'], ['Tenant', 'Mark Lee', 'mark.lee@example.com', '415-555-0178']],
  loan: [['Lender', 'Anna Petrova', 'anna.petrova@example.com', '312-555-0119'], ['Borrower', 'Carlos Mendes', 'carlos.mendes@example.com', '312-555-0164']],
};

function personalize(entry) {
  const pair = PAIRS[entry.category];
  if (!pair) return null;
  let text = entry.text;
  for (const [role, name] of pair) {
    // 'Some Entity ("Landlord")' becomes 'Jane Doe ("Landlord")'; bare uses of the role become the name.
    text = text.replace(new RegExp(`[A-Z][\\w&.' -]*? \\("${role}"\\)`), `${name} ("${role}")`);
    text = text.replace(new RegExp(`\\b(?:the )?${role}\\b(?!["”])`, 'g'), name);
  }
  const sig = pair.map(([role, name, email, phone]) => `${name} (${role}), ${email}, ${phone}`).join('; ');
  return `${text}\n\nSigned: ${sig}.`;
}

const CASES = dataset
  .filter(e => ['lease', 'loan'].includes(e.category))
  .map(e => ({ entry: e, text: personalize(e) }))
  .filter(c => c.text);

module.exports = { CASES, PAIRS };
