// A generic, category-agnostic "risky legal phrase" list — the kind of thing
// a naive keyword/regex scanner (no LLM) would ship with. This is intentionally
// NOT derived from the trap `signal_terms` in the fixtures — it's authored
// independently, as a plausible naive baseline a developer might reach for
// first. See eval/run.js for how it's scored against the labeled traps.
const GENERIC_RISK_PHRASES = [
  'non-compete', 'noncompete', 'non-competition',
  'non-solicit', 'non-solicitation', 'nonsolicitation',
  'arbitration', 'arbitrator', 'class action', 'waive',
  'indemnify', 'indemnification', 'hold harmless',
  'liquidated damages', 'sole discretion', 'without notice',
  'perpetual', 'irrevocable', 'indefinite', 'in perpetuity',
  'automatic renewal', 'auto-renew', 'autorenew',
  'cross-default', 'cross default',
  'force-placed', 'force placed',
  'balloon payment',
  'personal guarantee',
  'forfeit', 'forfeiture',
  'at any time', 'for any reason', 'no obligation',
  'non-refundable', 'nonrefundable',
];

/**
 * Naive baseline: return the distinct generic risk phrases found in raw text.
 * No understanding of context — just substring presence.
 */
function scanBaseline(text) {
  const lower = text.toLowerCase();
  return GENERIC_RISK_PHRASES.filter(phrase => lower.includes(phrase));
}

module.exports = { GENERIC_RISK_PHRASES, scanBaseline };
