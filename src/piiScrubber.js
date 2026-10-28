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

const NAMES = 'Person names';
const wordsOf = value => value.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/**
 * The same person is written several ways ("Jane Doe", "Doe", "Doe, Jane"), so a name
 * joins an existing person when its words all appear in that person's longest form.
 * A name that could be either of two people stays separate rather than guessing.
 */
function groupNames(values) {
  const people = []; // { words: Set, first: index of first appearance }
  const personOf = new Map();
  const distinct = [...new Set(values)].map((value, first) => ({ value, first, words: wordsOf(value) }));
  distinct.sort((a, b) => b.words.length - a.words.length || a.first - b.first);
  for (const { value, first, words } of distinct) {
    const fits = people.filter(p => words.length > 0 && words.every(w => p.words.has(w)));
    if (fits.length === 1) {
      fits[0].first = Math.min(fits[0].first, first);
      personOf.set(value, fits[0]);
    } else {
      const person = { words: new Set(words), first };
      people.push(person);
      personOf.set(value, person);
    }
  }
  const order = new Map(people.sort((a, b) => a.first - b.first).map((p, i) => [p, i + 1]));
  return new Map([...personOf].map(([value, person]) => [value, order.get(person)]));
}

// Phone numbers, IDs and the like are "the same" whatever the punctuation; emails keep their dots.
const identifierKey = (label, value) => (label === 'Email addresses'
  ? value.trim().toLowerCase()
  : value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''));

/**
 * When a document holds more than one distinct value of a kind, each gets a number
 * ([NAME 1], [NAME 2]) and every repeat reuses it, so the AI can still tell the parties
 * and accounts apart. A single value keeps the plain tag ([NAME]).
 */
function numberPlaceholders(text, spans) {
  const valuesByLabel = new Map();
  for (const span of spans) {
    const list = valuesByLabel.get(span.label) || [];
    list.push(text.slice(span.start, span.end));
    valuesByLabel.set(span.label, list);
  }

  const numbering = new Map(); // label -> (value -> number)
  for (const [label, values] of valuesByLabel) {
    let numbers;
    if (label === NAMES) {
      numbers = groupNames(values);
    } else {
      numbers = new Map();
      const byKey = new Map();
      for (const value of values) {
        const key = identifierKey(label, value);
        if (!byKey.has(key)) byKey.set(key, byKey.size + 1);
        numbers.set(value, byKey.get(key));
      }
    }
    if (new Set(numbers.values()).size > 1) numbering.set(label, numbers);
  }

  return span => {
    const numbers = numbering.get(span.label);
    return numbers ? `${span.tag.slice(0, -1)} ${numbers.get(text.slice(span.start, span.end))}]` : span.tag;
  };
}

function scrubPII(text) {
  const spans = resolveOverlaps([...findStructured(text), ...detectNames(text)], text.length);
  const tagFor = numberPlaceholders(text, spans);

  let scrubbed = '';
  let cursor = 0;
  const byLabel = new Map();
  for (const span of spans) {
    scrubbed += text.slice(cursor, span.start) + tagFor(span);
    cursor = span.end;

    const original = text.slice(span.start, span.end);
    const entry = byLabel.get(span.label) || { label: span.label, count: 0, seen: new Set() };
    entry.count += 1;
    entry.seen.add(original);
    byLabel.set(span.label, entry);
  }
  scrubbed += text.slice(cursor);

  const order = [...LABEL_ORDER, NAMES];
  const findings = order
    .filter(label => byLabel.has(label))
    .map(label => {
      const { count, seen } = byLabel.get(label);
      return { label, count, redacted: [...seen] };
    });

  return { scrubbed, findings };
}

module.exports = { scrubPII };
