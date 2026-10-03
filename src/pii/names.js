const nlp = require('compromise');
const { isFirstName, isLastName, isCommonWord, titleCase } = require('./lexicon');
const {
  LEGAL_STOP, ORG_WORDS, PARTICLES, ORGISH_DEFINED_TERMS, ROLE_CUES, LABEL_CUES,
  HONORIFICS, GENERIC_EMAIL_LOCALS, SIGNATURE_CONTEXT,
} = require('./stoplist');

const ACCEPT_THRESHOLD = 3;
const PEOPLE_SCAN_LIMIT = 500000; // compromise is the slow part; cap its input

// Case-insensitive literal, so cue words match as "Tenant", "TENANT" or "tenant"
// while the NAME that follows must still look like a name (capitalized).
const ci = word => word.split('').map(c => {
  if (c === ' ') return '[ \\t]+';
  if (/[a-z]/i.test(c)) return `[${c.toLowerCase()}${c.toUpperCase()}]`;
  return c.replace(/[-.]/g, '\\$&');
}).join('');
const alt = words => words.map(ci).join('|');

const NAME_TOKEN = "(?:[A-Z]['’][A-Z][a-z]+|[A-Z][a-z]+(?:[A-Z][a-z]+)*(?:['’\\-][A-Za-z]+)*|[A-Z]{2,}(?:['’\\-][A-Z]+)*|[A-Z]\\.)";
const PARTICLE_ALT = [...PARTICLES].join('|');
const SUFFIX = '(?:,?[ \\t]+(?:Jr|Sr|II|III|IV|Esq|Ph\\.?D|M\\.?D)\\.?(?![A-Za-z]))?';
const PHRASE = `(?<![A-Za-z])${NAME_TOKEN}(?:[ \\t]+(?:(?:${PARTICLE_ALT})[ \\t]+)?${NAME_TOKEN}){0,3}${SUFFIX}`;

const norm = t => t.toLowerCase().replace(/\.$/, '').replace(/’/g, "'");
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isInitial = t => /^[A-Z]\.?$/.test(t);
// Morphology that marks business names ("Lending", "Analytics", "Solutions").
// A word with one of these endings is only trusted as a surname if the lexicon
// independently knows it (Manning, Davies).
const CORPORATE_ENDING = /[a-z]{4,}(?:ing|ics|ions|ment|ware|works|tech|soft|labs|ies|ogy|ency)$/i;
const isAllCaps = t => /^[A-Z][A-Z'’\-.]*$/.test(t) && /[A-Z]{2}/.test(t);
const hasLexicalSupport = tokens => tokens.some(t => isFirstName(t) || isLastName(t));

// "John Hancock Insurance", "Martin Luther King Jr. Day": when a would-be name is
// immediately followed by one of these, the whole thing is a title or business.
const TITLE_CONTINUATIONS = new Set([
  ...ORG_WORDS, 'day', 'act', 'law', 'center', 'centre', 'hall', 'park', 'hospital', 'school', 'award',
  'prize', 'memorial', 'building', 'tower', 'bridge', 'airport', 'stadium', 'library', 'museum', 'street',
  'avenue', 'road',
]);
const followedByTitleWord = (text, end) => {
  const m = /^\.?[ \t]+([A-Za-z]+)/.exec(text.slice(end, end + 40));
  return !!m && TITLE_CONTINUATIONS.has(m[1].toLowerCase());
};

const NAME_SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'esq', 'phd', 'md', 'ph.d', 'm.d']);

function trimStop(tokens) {
  let a = 0;
  let b = tokens.length;
  const skip = t => LEGAL_STOP.has(norm(t)) || PARTICLES.has(norm(t));
  while (a < b && skip(tokens[a])) a++;
  while (b > a && skip(tokens[b - 1])) b--;
  return tokens.slice(a, b);
}

function addCandidate(cands, rawPhrase, ev, extra = {}) {
  const raw = rawPhrase.replace(/,/g, '').trim().split(/[ \t]+/).filter(Boolean);
  if (!raw.length) return;
  if (!extra.honorific && raw.some(t => ORG_WORDS.has(norm(t)))) return;
  const tokens = trimStop(raw);
  if (!tokens.length || tokens.every(isInitial)) return;
  if (!extra.honorific && tokens.some(t => CORPORATE_ENDING.test(t) && !isFirstName(t) && !isLastName(t))) return;
  const key = tokens.map(norm).join(' ');
  const cur = cands.get(key);
  if (!cur) {
    cands.set(key, { tokens, ev, people: !!extra.people });
  } else {
    cur.ev = Math.max(cur.ev, ev);
    cur.people = cur.people || !!extra.people;
  }
}

function score(c) {
  const T = c.tokens;
  const words = T.filter(t => !isInitial(t));
  if (!words.length) return 0;
  const first = words[0];
  const rest = words.slice(1);
  const firstIsFirstName = isFirstName(first);
  const restKnown = rest.some(t => isLastName(t) || isFirstName(t));
  const lexicalPair = firstIsFirstName && restKnown;

  if (c.ev === 0 && !c.people && !lexicalPair) return 0;
  if (T.length === 1 && c.ev === 0) return 0; // a lone word needs real context
  // compromise's people() alone is too eager (it labels all-caps headings as people)
  if (c.ev === 0 && !lexicalPair && !hasLexicalSupport(words)) return 0;
  // all-caps phrases are usually headings or company names; demand strong evidence
  if (c.ev < 3 && words.every(isAllCaps) && !hasLexicalSupport(words)) return 0;

  let s = c.ev;
  if (firstIsFirstName) s += 2;
  if (restKnown || (!firstIsFirstName && words.length === 1 && isLastName(first))) s += 1;
  if (T.length >= 2) s += 1;
  if (c.people) s += 2;
  return s;
}

function collectCandidates(text) {
  const cands = new Map();
  const run = (regex, handler) => {
    const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      handler(m);
    }
  };

  // "Mr. John Smith", "Dr Zhao Wei"
  run(new RegExp(`\\b(?:${alt(HONORIFICS)})\\.?[ \\t]+(${PHRASE})`),
    m => addCandidate(cands, m[1], 3, { honorific: true }));
  run(new RegExp(`\\b${ci('dear')}[ \\t]+(?:(?:Mr|Mrs|Ms|Dr|Miss)\\.?[ \\t]+)?(${PHRASE})`),
    m => addCandidate(cands, m[1], 3));

  // "Name: Jane Doe", "Signed - Jane Doe", "By: Jane Doe"
  run(new RegExp(`\\b(?:${alt(LABEL_CUES)})[ \\t]*[:\\-–][ \\t]*(${PHRASE})`),
    m => addCandidate(cands, m[1], 3));

  // "Tenant Jane Doe", "Landlord: Maria Gonzalez"
  run(new RegExp(`\\b(?:${alt(ROLE_CUES)})[ \\t]*[,:\\-–]?[ \\t]*(?:\\([^)\\n]{0,30}\\)[ \\t]*)?(${PHRASE})`),
    m => addCandidate(cands, m[1], 2));

  // 'Jane Doe (the "Tenant")', 'Jane Doe ("Lessee")'
  run(new RegExp(`(${PHRASE})[ \\t]*,?[ \\t]*\\((?:[ \\t]*(?:the|hereinafter|herein|referred[ \\t]+to[ \\t]+as|collectively|individually|each)[ \\t]+)*[ \\t]*[“"'‘][ \\t]*([A-Za-z][A-Za-z ]{1,30}?)[ \\t]*[”"'’]`),
    m => addCandidate(cands, m[1], ORGISH_DEFINED_TERMS.has(m[2].trim().toLowerCase()) ? 1 : 2));

  // "between Jane Doe and John Smith"
  run(/\bbetween\b/i, m => {
    const window = text.slice(m.index, m.index + 240).split(/\n\s*\n/)[0];
    const first = new RegExp(`between[ \\t]+(?:the[ \\t]+)?(${PHRASE})`, 'i').exec(window);
    if (first) addCandidate(cands, first[1], 1);
    const second = new RegExp(`[ \\t]and[ \\t]+(?:the[ \\t]+)?(${PHRASE})`).exec(window);
    if (second) addCandidate(cands, second[1], 1);
  });

  // "/s/ Jane Doe"
  run(new RegExp(`\\/s\\/[ \\t]*(${PHRASE})`), m => addCandidate(cands, m[1], 3));

  // A line that is only a name, sitting in a signature block
  const lines = text.split('\n');
  const lineRe = new RegExp(`^[ \\t]*(${PHRASE})[ \\t]*(?:,[ \\t]*[A-Za-z .&]{2,40})?[ \\t]*$`);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > 80) continue;
    const m = lineRe.exec(lines[i]);
    if (!m) continue;
    const near = [lines[i - 2], lines[i - 1], lines[i + 1], lines[i + 2]].filter(Boolean).join('\n');
    if (SIGNATURE_CONTEXT.test(near)) addCandidate(cands, m[1], 2);
  }

  // Email local parts ("jane.doe@...") name the person for every other mention
  run(/([A-Za-z0-9._%+\-]+)@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/, m => {
    const parts = m[1].split(/[._\-+]/).filter(p => /^[A-Za-z]{2,}$/.test(p));
    if (parts.some(p => GENERIC_EMAIL_LOCALS.has(p.toLowerCase()) || LEGAL_STOP.has(p.toLowerCase()))) return;
    if (parts.length >= 2 && parts.length <= 3) {
      addCandidate(cands, parts.map(titleCase).join(' '), 3);
    } else if (parts.length === 1 && (isFirstName(parts[0]) || isLastName(parts[0]))) {
      addCandidate(cands, titleCase(parts[0]), 3);
    }
  });

  // compromise as one more (inconsistent, so only supporting) signal
  try {
    const sample = text.length > PEOPLE_SCAN_LIMIT ? text.slice(0, PEOPLE_SCAN_LIMIT) : text;
    for (const person of nlp(sample).people().out('array')) {
      if (/^[A-Z]/.test(person.trim()) && person.trim().split(/\s+/).every(t => /^[A-Z]/.test(t))) {
        addCandidate(cands, person, 0, { people: true });
      }
    }
  } catch {
    // fall through — the other signals still run
  }

  // Pure lexicon pairs ("Jane Roberts") with no surrounding cue
  run(new RegExp(PHRASE), m => addCandidate(cands, m[0], 0));

  return cands;
}

function tokenSpans(text, token) {
  const variants = [...new Set([token, token.toUpperCase(), titleCase(token)])].map(escapeRe).join('|');
  return new RegExp(`(?<![A-Za-z'’\\-])(?:${variants})(?![A-Za-z])`, 'g');
}

function detectNames(text) {
  const accepted = [...collectCandidates(text).values()].filter(c => score(c) >= ACCEPT_THRESHOLD);
  const spans = [];

  const matches = (re, priority, skipTitleContinuations) => {
    const found = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      const end = m.index + m[0].length;
      if (skipTitleContinuations && followedByTitleWord(text, end)) continue;
      found.push({ start: m.index, end, label: 'Person names', tag: '[NAME]', priority });
    }
    return found;
  };

  for (const { tokens, ev } of accepted) {
    const phraseSpans = [];
    if (tokens.length >= 2) {
      const body = tokens.map(t => escapeRe(t)).join('[ \\t]+(?:[A-Za-z]\\.?[ \\t]+)?');
      phraseSpans.push(...matches(new RegExp(`(?<![A-Za-z])${body}(?![A-Za-z])`, 'gi'), 55, true));
      if (tokens.length === 2) {
        phraseSpans.push(...matches(
          new RegExp(`(?<![A-Za-z])${escapeRe(tokens[1])}[ \\t]*,[ \\t]*${escapeRe(tokens[0])}(?![A-Za-z])`, 'gi'), 55, true));
      }
      // A name found only by lexicon/people() that never survives as a standalone
      // name (always part of "X Insurance", "X Day"...) is not a person.
      if (ev === 0 && phraseSpans.length === 0) continue;
    }
    spans.push(...phraseSpans);

    for (const t of tokens) {
      const bare = t.replace(/\.$/, '');
      if (bare.length < 3 || isInitial(t)) continue;
      if (NAME_SUFFIXES.has(norm(t)) || LEGAL_STOP.has(norm(t)) || isCommonWord(bare)) continue;
      spans.push(...matches(tokenSpans(text, bare), 50, false));
    }
  }
  return spans;
}

module.exports = { detectNames };
