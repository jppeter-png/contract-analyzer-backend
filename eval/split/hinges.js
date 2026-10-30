// Hinge term and wording that only follows from the definition, for the original traps (quiet traps carry their own).
const OLD = {
  'additional-rent': { term: 'additional rent', awareOf: ['sole discretion', 'any kind', 'itemized', 'whatever', 'unspecified', 'open-ended'] },
  'premises-damage': { term: 'premises damage', awareOf: ['wear and tear', 'ordinary', 'normal'] },
  'cause-forfeiture': { term: 'cause', awareOf: ['sole judgment', 'reflects poorly', 'whether or not'] },
  'confidentiality-liquidated': { term: 'confidential information', awareOf: ['general skills', 'any kind', 'whether or not'] },
  'fees-payment': { term: 'fees', awareOf: ['posting', 'website', 'announce', 'additional charge', 'from time to time', 'any other charges'] },
  'deliverables-ownership': { term: 'deliverables', awareOf: ['excluding', 'paid in full', 'not paid', 'cash', 'tools', 'excludes'] },
  'termination-cause': { term: 'cause', awareOf: ['sole discretion', 'harmful', 'whether or not', 'considers'] },
};

const hingeFor = trap => OLD[trap.id] || trap;

module.exports = { OLD, hingeFor };
