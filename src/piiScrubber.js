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
const CUSTOM = 'Hidden by you';
const CUSTOM_PRIORITY = 200; // what the user typed beats every detector
const MAX_TERMS = 50;
const MAX_TERM_LENGTH = 100;
const MIN_TERM_LENGTH = 2;
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


const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Scripts written without spaces: a term inside a longer run is still that term.
const UNSPACED = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

/** Trim, collapse spaces, drop too-short or repeated terms (case-insensitive), keep the user's order. */
function normalizeTerms(terms) {
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(terms) ? terms : []) {
    if (typeof raw !== 'string') continue;
    const term = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
    if (term.length < MIN_TERM_LENGTH || term.length > MAX_TERM_LENGTH) continue;
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(term);
  }
  return out.slice(0, MAX_TERMS);
}

/**
 * Matches the term as whole words, ignoring case and tolerating any punctuation or line breaks
 * between its words ("555 0142" also finds "555-0142"; "14 Oak Lane" finds "14 Oak\nLane").
 */
function termRegex(term) {
  const tokens = term.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (!tokens.length) return null;
  const body = tokens.map(escapeRe).join('[^\\p{L}\\p{N}]{1,4}');
  return UNSPACED.test(term)
    ? new RegExp(body, 'giu')
    : new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, 'giu');
}

// Placeholders from an earlier pass ([NAME 1], [HIDDEN 2]) are never matched, so a term like "NAME" cannot corrupt one.
const PLACEHOLDER = /\[[A-Z]{2,10}(?: \d+)?\]/g;

const stripMarks = value => value.normalize('NFD').replace(/\p{M}/gu, '');

/**
 * The text with accents removed, plus a map from each position in it back to the original, so "José"
 * and "Jose" are the same word. Plain ASCII text needs no work.
 */
function foldText(text) {
  if (!/[^\x00-\x7f]/.test(text)) return { folded: text, map: null };
  const pieces = [];
  const map = [];
  for (let i = 0; i < text.length;) {
    const ch = String.fromCodePoint(text.codePointAt(i));
    const kept = stripMarks(ch);
    for (let k = 0; k < kept.length; k++) map.push(i);
    pieces.push(kept);
    i += ch.length;
  }
  return { folded: pieces.join(''), map };
}

function findCustom(text, terms) {
  const { folded, map } = foldText(text);
  // Back to positions in the original text; a match swallows the accents that trail its last letter.
  const toOriginal = (start, end) => {
    if (!map) return [start, end];
    const last = map[end - 1];
    let stop = last + (text.codePointAt(last) > 0xffff ? 2 : 1);
    while (stop < text.length && /\p{M}/u.test(text[stop])) stop += 1;
    return [map[start], stop];
  };
  const protectedRanges = [...text.matchAll(PLACEHOLDER)].map(m => [m.index, m.index + m[0].length]);
  const inPlaceholder = (start, end) => protectedRanges.some(([a, b]) => start < b && end > a);
  const spans = [];
  const matchCounts = terms.map((term, termIndex) => {
    const re = termRegex(stripMarks(term));
    let count = 0;
    if (re) {
      for (const m of folded.matchAll(re)) {
        if (!m[0]) continue;
        const [start, end] = toOriginal(m.index, m.index + m[0].length);
        if (protectedRanges.length && inPlaceholder(start, end)) continue;
        count += 1;
        spans.push({ start, end, label: CUSTOM, tag: '[HIDDEN]', priority: CUSTOM_PRIORITY, termIndex });
      }
    }
    return { term, count };
  });
  return { spans, matchCounts };
}

// A second pass over already-scrubbed text must carry on after the [HIDDEN n] already there.
function highestHiddenNumber(text) {
  let max = 0;
  for (const m of text.matchAll(/\[HIDDEN (\d+)\]/g)) max = Math.max(max, Number(m[1]));
  return max;
}

/** Same person or place written several ways ("Jordan Ellis", "Ellis") shares one number. */
function customTagger(text, spans) {
  const valueOf = span => stripMarks(text.slice(span.start, span.end));
  const numbers = groupNames(spans.filter(s => s.label === CUSTOM).map(valueOf));
  const base = highestHiddenNumber(text);
  return span => `[HIDDEN ${base + numbers.get(valueOf(span))}]`;
}

/**
 * options.customTerms: strings the user asked to hide (names, addresses, IDs). They are always hidden,
 *   and win over automatic detection where the two overlap.
 * options.autoDetect:  false hides ONLY the custom terms and looks for nothing else.
 */
function scrubPII(text, { customTerms = [], autoDetect = true } = {}) {
  const terms = normalizeTerms(customTerms);
  const custom = findCustom(text, terms);
  const detected = autoDetect ? [...findStructured(text), ...detectNames(text)] : [];
  const spans = resolveOverlaps([...custom.spans, ...detected], text.length);
  const autoTag = numberPlaceholders(text, spans.filter(s => s.label !== CUSTOM));
  const customTag = customTagger(text, spans);
  const tagFor = span => (span.label === CUSTOM ? customTag(span) : autoTag(span));

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

  const order = [CUSTOM, ...LABEL_ORDER, NAMES];
  const findings = order
    .filter(label => byLabel.has(label))
    .map(label => {
      const { count, seen } = byLabel.get(label);
      return { label, count, redacted: [...seen] };
    });

  return { scrubbed, findings, termMatches: custom.matchCounts };
}

module.exports = { scrubPII, normalizeTerms, MAX_TERMS, MAX_TERM_LENGTH, CUSTOM_LABEL: CUSTOM };
