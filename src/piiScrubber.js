const { findStructured, LABEL_ORDER } = require('./pii/structured');
const { detectNames } = require('./pii/names');

// Every detector reports spans against the ORIGINAL text. Overlaps are settled
// by priority (an email beats the name inside it), then by length, and only then
// is the text rebuilt — so placeholders never confuse a later detector.
function resolveOverlaps(spans, length) {
  const ranked = spans.slice().sort((a, b) =>
    b.priority - a.priority || (b.end - b.start) - (a.end - a.start) || a.start - b.start);
  const taken = new Uint8Array(length);
  const kept = [];
  for (const span of ranked) {
    let free = true;
    for (let i = span.start; i < span.end; i++) {
      if (taken[i]) { free = false; break; }
    }
    if (!free) continue;
    taken.fill(1, span.start, span.end);
    kept.push(span);
  }
  return kept.sort((a, b) => a.start - b.start);
}

function scrubPII(text) {
  const spans = resolveOverlaps([...findStructured(text), ...detectNames(text)], text.length);

  let scrubbed = '';
  let cursor = 0;
  const byLabel = new Map();
  for (const span of spans) {
    scrubbed += text.slice(cursor, span.start) + span.tag;
    cursor = span.end;

    const original = text.slice(span.start, span.end);
    const entry = byLabel.get(span.label) || { label: span.label, count: 0, seen: new Set() };
    entry.count += 1;
    entry.seen.add(original);
    byLabel.set(span.label, entry);
  }
  scrubbed += text.slice(cursor);

  const order = [...LABEL_ORDER, 'Person names'];
  const findings = order
    .filter(label => byLabel.has(label))
    .map(label => {
      const { count, seen } = byLabel.get(label);
      return { label, count, redacted: [...seen] };
    });

  return { scrubbed, findings };
}

module.exports = { scrubPII };
