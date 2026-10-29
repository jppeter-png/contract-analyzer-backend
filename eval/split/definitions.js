// Digest of defined terms for the "prepend context" experiment. Plain regex, no AI call, no lookbehind
// (the mobile JS engine's support for it is unverified, so this could move into the app unchanged).
const VERB = /\b(means?|shall mean|includes?|also includes?|has the meaning|is defined as|refers to|shall be deemed|is deemed)\b/i;
const QUOTED = /["“]([A-Z][^"”]{0,40})["”]/g;

/** Every sentence that defines or changes a capitalised quoted term, with the chunk it sits in. */
function extractDefinitions(chunks) {
  const found = [];
  chunks.forEach((chunk, index) => {
    let offset = 0;
    for (const line of chunk.split('\n')) {
      for (const raw of line.split(/[.;]\s+(?=["“A-Z])/)) {
        const sentence = raw.replace(/^\s*\d+\.\s*/, '').trim();
        QUOTED.lastIndex = 0;
        const quoted = QUOTED.exec(sentence);
        if (quoted && VERB.test(sentence.slice(quoted.index + quoted[0].length))) {
          found.push({ term: quoted[1], text: sentence.endsWith('.') ? sentence : `${sentence}.`, section: index + 1, offset: offset + chunk.slice(offset).indexOf(raw.slice(0, 30)) });
        }
      }
      offset += line.length + 1;
    }
  });
  return found.sort((a, b) => a.section - b.section || a.offset - b.offset);
}

/**
 * Context for section `section` (1-based): definitions from EARLIER sections only. mode "all" keeps every
 * version of a term in document order, so an inline change is not lost; "first" keeps only the first
 * version (the naive version, kept to show what goes wrong).
 */
function buildDigest(definitions, section, mode = 'all', maxChars = 1800) {
  const byTerm = new Map();
  for (const d of definitions) {
    if (d.section >= section) continue;
    if (!byTerm.has(d.term)) byTerm.set(d.term, []);
    byTerm.get(d.term).push(d);
  }
  const lines = [];
  for (const versions of byTerm.values()) {
    const kept = mode === 'first' ? versions.slice(0, 1) : versions;
    kept.forEach((d, i) => lines.push(`- ${i === 0 ? '' : '(later change) '}${d.text} [section ${d.section}]`));
  }
  let digest = '';
  for (const line of lines) {
    if ((digest + line).length > maxChars) break;
    digest += `${line}\n`;
  }
  return digest.trim();
}

module.exports = { extractDefinitions, buildDigest };
