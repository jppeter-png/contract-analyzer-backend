// Scores a system's predicted issues against hand-labeled ground_truth_issues.
// Matching is intentionally "rough" per the spec — category match OR
// substantive text overlap with clause_excerpt, not exact string equality —
// since neither the LLM nor the keyword baseline reproduces ground-truth
// wording verbatim. See eval/results.md's Methodology section for caveats.

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'on', 'by', 'with',
  'is', 'are', 'shall', 'will', 'any', 'all', 'this', 'that', 'be', 'as',
  'at', 'from', 'it', 'its', 'not', 'no', 'may', 'you', 'your', 'their',
]);

function tokenize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOPWORDS.has(w));
}

function categoryTokens(category) {
  return tokenize((category || '').replace(/-/g, ' '));
}

/**
 * Does `prediction` (shape: { category, title, description }) match
 * `groundTruthIssue` (shape: { category, clause_excerpt })?
 * Match on EITHER signal, not both — a correct clause described in
 * different words than its category slug should still count.
 */
function isMatch(prediction, groundTruthIssue) {
  const predText = [prediction.category, prediction.title, prediction.description]
    .filter(Boolean).join(' ');
  const predTokens = new Set(tokenize(predText));

  const gtCatTokens = categoryTokens(groundTruthIssue.category);
  const categoryHit = gtCatTokens.length > 0 && gtCatTokens.some(t => predTokens.has(t));

  const excerptTokens = new Set(tokenize(groundTruthIssue.clause_excerpt));
  let overlap = 0;
  for (const t of excerptTokens) if (predTokens.has(t)) overlap++;
  const overlapRatio = excerptTokens.size > 0 ? overlap / excerptTokens.size : 0;
  const textHit = overlap >= 3 || overlapRatio >= 0.25;

  return categoryHit || textHit;
}

/**
 * Greedy one-to-one matching between predictions and ground truth issues for
 * one document — each ground truth issue can be satisfied by at most one
 * prediction and vice versa, so one broad prediction can't inflate recall by
 * "matching" several ground truth issues at once, and a real issue can't be
 * double-counted as multiple true positives.
 */
function scoreDocument(predictions, groundTruthIssues) {
  const gt = groundTruthIssues || [];
  const preds = predictions || [];
  const gtMatched = new Array(gt.length).fill(false);
  const predMatched = new Array(preds.length).fill(false);
  const matches = []; // { gtIndex, predIndex }

  for (let gi = 0; gi < gt.length; gi++) {
    for (let pi = 0; pi < preds.length; pi++) {
      if (predMatched[pi]) continue;
      if (isMatch(preds[pi], gt[gi])) {
        gtMatched[gi] = true;
        predMatched[pi] = true;
        matches.push({ gtIndex: gi, predIndex: pi });
        break;
      }
    }
  }

  const truePositives = matches.length;
  const falsePositives = preds.length - truePositives;
  const falseNegatives = gt.length - truePositives;

  const precision = preds.length > 0 ? truePositives / preds.length : null;
  const recall = gt.length > 0 ? truePositives / gt.length : null;
  const f1 = precision != null && recall != null && (precision + recall) > 0
    ? (2 * precision * recall) / (precision + recall)
    : null;

  return {
    truePositives, falsePositives, falseNegatives,
    predictedTotal: preds.length, groundTruthTotal: gt.length,
    precision, recall, f1,
    matches,
    missedGtIndices: gt.map((_, i) => i).filter(i => !gtMatched[i]),
    falsePositivePredIndices: preds.map((_, i) => i).filter(i => !predMatched[i]),
  };
}

/** Micro-averaged precision/recall/F1 across a list of per-doc scores. */
function aggregateScores(docScores) {
  const tp = docScores.reduce((s, d) => s + d.truePositives, 0);
  const predictedTotal = docScores.reduce((s, d) => s + d.predictedTotal, 0);
  const groundTruthTotal = docScores.reduce((s, d) => s + d.groundTruthTotal, 0);

  const precision = predictedTotal > 0 ? tp / predictedTotal : null;
  const recall = groundTruthTotal > 0 ? tp / groundTruthTotal : null;
  const f1 = precision != null && recall != null && (precision + recall) > 0
    ? (2 * precision * recall) / (precision + recall)
    : null;

  return { truePositives: tp, predictedTotal, groundTruthTotal, precision, recall, f1 };
}

module.exports = { isMatch, scoreDocument, aggregateScores, tokenize };
