// Naive keyword/regex baseline — no LLM call. For each contract category,
// a fixed list of (issue category -> trigger terms) pairs is scanned against
// the raw contract text. No contextual understanding: a matched term always
// fires regardless of surrounding meaning, and terms are authored per
// category based on common red-flag vocabulary for that contract type, not
// derived from the dataset's own ground_truth_issues.
//
// This exists purely as a comparison point for the LLM analyzer — see
// eval/results.md's "Methodology" section for what this baseline is (and
// isn't) meant to demonstrate.

const RED_FLAG_TERMS = {
  employment: [
    { category: 'non-compete', terms: ['non-compete', 'noncompete', 'non-competition'] },
    { category: 'non-solicitation', terms: ['non-solicit', 'non-solicitation', 'nonsolicitation'] },
    { category: 'arbitration', terms: ['arbitration', 'arbitrator', 'waive', 'jury trial', 'class action'] },
    { category: 'ip-assignment', terms: ['intellectual property', 'invention', 'work of authorship', 'sole and exclusive property'] },
    { category: 'bonus-clawback', terms: ['clawback', 'claw-back', 'repay', 'repayment'] },
    { category: 'wage-theft', terms: ['accrued', 'unused vacation', 'notwithstanding any state law'] },
    { category: 'at-will', terms: ['at-will', 'at will', 'without cause or notice'] },
  ],
  nda: [
    { category: 'overbroad-definition', terms: ['publicly known', 'independently developed', 'already possessed'] },
    { category: 'perpetual-duration', terms: ['perpetuity', 'perpetual', 'no expiration', 'indefinite'] },
    { category: 'one-sided-obligations', terms: ['obligations on', 'only; ', 'without restriction'] },
    { category: 'liquidated-damages', terms: ['liquidated damages', 'per incident'] },
    { category: 'jurisdiction-selected-later', terms: ['sole discretion', 'governing law', 'jurisdiction'] },
    { category: 'assignment', terms: ['assign this agreement', 'without consent'] },
    { category: 'non-solicitation', terms: ['non-solicit', 'solicit for employment'] },
  ],
  lease: [
    { category: 'rent-increase', terms: ['increase rent', 'rent increase', 'any amount'] },
    { category: 'entry-notice', terms: ['enter the unit', 'without prior notice', 'any time, for any reason'] },
    { category: 'structural-repairs-shifted', terms: ['structural repairs', 'roof', 'hvac', 'regardless of the cause'] },
    { category: 'nonrefundable-pet-deposit', terms: ['non-refundable', 'nonrefundable', 'pet deposit'] },
    { category: 'notice-period-excessive', terms: ['automatic renewal', 'automatically renew', 'written notice of non-renewal'] },
    { category: 'late-fee', terms: ['late fee', 'interest on the unpaid balance'] },
    { category: 'eviction-trigger-via-vague-fees', terms: ['additional rent', 'material default', 'eviction'] },
  ],
  service: [
    { category: 'liability-cap-too-low', terms: ['total liability', 'shall not exceed', 'gross negligence'] },
    { category: 'one-sided-indemnity', terms: ['indemnify', 'indemnification', 'hold harmless'] },
    { category: 'ip-overreach', terms: ['sole property of client', 'pre-existing tools', 'no license retained'] },
    { category: 'unlimited-free-change-orders', terms: ['no additional cost', 'regardless of the scope'] },
    { category: 'arbitration-costs-one-sided', terms: ['arbitration', 'arbitrator', '100% of arbitration costs'] },
    { category: 'deemed-acceptance', terms: ['deemed to have accepted', 'whether or not client has reviewed'] },
  ],
  loan: [
    { category: 'uncapped-variable-rate', terms: ['variable rate', 'sole discretion', 'no cap'] },
    { category: 'broad-default-trigger', terms: ['adverse change in financial condition', 'sole discretion'] },
    { category: 'cross-default', terms: ['cross-default', 'cross default', 'any other agreement'] },
    { category: 'unlimited-personal-guarantee', terms: ['personal guarantee', 'personally guarantee', 'without limitation'] },
    { category: 'hidden-balloon-payment', terms: ['balloon payment', 'balloon', 'amortization'] },
    { category: 'force-placed-insurance', terms: ['force-placed', 'force placed', 'insurance'] },
    { category: 'no-cure-period', terms: ['no grace period', 'cure period', 'immediately without prior notice'] },
    { category: 'overbroad-collateral-via-definition', terms: ['all business assets', 'now owned or hereafter acquired', 'security interest'] },
  ],
  tos: [
    { category: 'unilateral-modification', terms: ['modify these terms', 'at any time, for any reason', 'without direct notice'] },
    { category: 'perpetual-content-license', terms: ['perpetual', 'irrevocable', 'worldwide', 'royalty-free'] },
    { category: 'vague-third-party-sharing', terms: ['marketing partners', 'third party', 'third parties'] },
    { category: 'difficult-cancellation', terms: ['call our support line', 'business hours', 'not available'] },
    { category: 'withhold-funds-on-suspicion', terms: ['withhold', 'suspected but unproven', '180 days'] },
    { category: 'liability-cap-too-low', terms: ['total liability', 'limited to $', 'regardless of the actual'] },
    { category: 'indefinite-retention-of-personal-data', terms: ['indefinitely', 'even after account deletion', 'platform improvement'] },
  ],
};

/**
 * Naive baseline: scan `text` for this category's fixed red-flag terms.
 * Returns predictions shaped like analyze.js issues (minus a real severity —
 * a keyword scanner can't judge severity, so it always guesses "medium").
 */
function runKeywordBaseline(text, category) {
  const groups = RED_FLAG_TERMS[category] || [];
  const lower = text.toLowerCase();
  const predictions = [];

  for (const group of groups) {
    for (const term of group.terms) {
      const idx = lower.indexOf(term.toLowerCase());
      if (idx === -1) continue;

      // Grab a short window of surrounding text as this prediction's "clause_excerpt" stand-in.
      const start = Math.max(0, idx - 60);
      const end = Math.min(text.length, idx + term.length + 60);
      const snippet = text.slice(start, end).trim();

      predictions.push({
        category: group.category,
        severity: 'medium', // keyword matching can't assess severity
        title: `Matched red-flag term: "${term}"`,
        description: snippet,
        matched_term: term,
      });
      break; // one match per group is enough — don't double-count a group hit on multiple synonyms
    }
  }

  return predictions;
}

module.exports = { RED_FLAG_TERMS, runKeywordBaseline };
