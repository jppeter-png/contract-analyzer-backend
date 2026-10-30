// Loads the app's real chunking/merging code (mobile/src/analysisChunking.js + coverage.js) in plain Node.
const fs = require('fs');
const path = require('path');

const read = file => fs.readFileSync(path.join(__dirname, '..', '..', '..', 'mobile', 'src', file), 'utf8');
const strip = src => src.replace(/^import .*$/gm, '').replace(/^export /gm, '');

const { reportedInEverySection } = new Function(`${strip(read('coverage.js'))}; return { reportedInEverySection };`)();
const { chunkText, mergeAnalyses } = new Function('t', 'reportedInEverySection',
  `${strip(read('analysisChunking.js'))}; return { chunkText, mergeAnalyses };`)((key, vars) => `${key}:${JSON.stringify(vars || {})}`, reportedInEverySection);

/** The merge the app used before missing protections had to be reported by every section. */
function mergeAnalysesOldUnion(analyses) {
  const merged = mergeAnalyses(analyses);
  if (analyses.length === 1) return merged;
  const unionIssues = analyses.flatMap((a, i) => (a.issues || []).map(issue => ({ ...issue, section: i + 1 })));
  return { ...merged, issues: unionIssues, missing_protections: [...new Set(analyses.flatMap(a => a.missing_protections || []))] };
}

// The experiments in this folder were run with 8,000-character sections; keep that the default even though the app now
// uses a larger section size, so past experiments stay reproducible. Pass a size to test others.
const PINNED_SECTION_CHARS = 8000;
const chunkTextPinned = (text, maxLen = PINNED_SECTION_CHARS) => chunkText(text, maxLen);

module.exports = { chunkText: chunkTextPinned, mergeAnalyses, mergeAnalysesOldUnion };
