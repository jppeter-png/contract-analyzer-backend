const nlp = require('compromise');
const { isFirstName, isLastName, isCommonWord, titleCase } = require('./lexicon');
const { fold } = require('./langs');
const {
  LEGAL_STOP, ORG_WORDS, PARTICLES, ORGISH_DEFINED_TERMS, ROLE_CUES, LABEL_CUES,
  HONORIFICS, STRICT_HONORIFICS, SALUTATIONS, BETWEEN_WORDS, AND_WORDS, GENERIC_EMAIL_LOCALS,
  SIGNATURE_CONTEXT,
} = require('./stoplist');

const ACCEPT_THRESHOLD = 3;
const PEOPLE_SCAN_LIMIT = 500000; // compromise is the slow part; cap its input

// Every pattern here is Unicode-aware (flag "u"), so José, Müller, Gonçalves and
// Łukasz are names just like Smith — [A-Z] would not even match them.
const rx = (source, flags = '') => new RegExp(source, flags.includes('u') ? flags : flags + 'u');
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Case-insensitive literal, so cue words match as "Tenant", "TENANT" or "tenant"
// while the NAME that follows must still look like a name (capitalized).
const ci = word => word.split('').map(c => {
  if (c === ' ') return '[ \\t]+';
  if (/\p{L}/u.test(c)) {
    const lo = c.toLowerCase();
    const up = c.toUpperCase();
    return lo === up || up.length !== 1 ? c : `[${lo}${up}]`; // ß uppercases to "SS"
  }
  return escapeRe(c);
}).join('');
const alt = words => words.map(ci).join('|');

const LETTER = '\\p{L}';
const UP = '\\p{Lu}';
const LO = '\\p{Ll}';
const NAME_TOKEN =
  `(?:${UP}['’]${UP}${LO}+|(?:d['’])?${UP}${LO}+(?:${UP}${LO}+)*(?:['’\\-]${LETTER}+)*|${UP}{2,}(?:['’\\-]${UP}+)*|${UP}\\.)`;
const PARTICLE_ALT = [...PARTICLES].join('|');
const SUFFIX = `(?:,?[ \\t]+(?:Jr|Sr|II|III|IV|Esq|Ph\\.?D|M\\.?D)\\.?(?!${LETTER}))?`;
// One or two spaces between name words: a wider gap (or a tab) is a column break, as in
// a signature block "Thomas Becker        Katharina Wagner".
const PHRASE = `(?<!${LETTER})${NAME_TOKEN}(?:[ ]{1,2}(?:(?:${PARTICLE_ALT})[ ]{1,2}){0,2}${NAME_TOKEN}){0,3}${SUFFIX}`;

const norm = t => fold(t.replace(/\.$/, '').replace(/’/g, "'"));
const isInitial = t => /^\p{Lu}\.?$/u.test(t);
// Morphology that marks business names ("Lending", "Analytics", "Solutions", "Gestión").
// A word with one of these endings is only trusted as a surname if the lexicon
// independently knows it (Manning, Davies).
const CORPORATE_ENDING = /\p{L}{3,}(?:ing|ics|ions|ment|ware|works|tech|soft|labs|ies|ogy|ency|ci[oó]n|ung|keit|heit|schaft|a[cç][aã]o)$/iu;
const isAllCaps = t => /^\p{Lu}[\p{Lu}'’\-.]*$/u.test(t) && /\p{Lu}{2}/u.test(t);
const hasLexicalSupport = tokens => tokens.some(t => isFirstName(t) || isLastName(t));

// "John Hancock Insurance", "Martin Luther King Jr. Day": when a would-be name is
// immediately followed by one of these, the whole thing is a title or business.
const TITLE_CONTINUATIONS = new Set([
  ...ORG_WORDS, 'day', 'act', 'law', 'center', 'centre', 'hall', 'park', 'hospital', 'school', 'award',
  'prize', 'memorial', 'building', 'tower', 'bridge', 'airport', 'stadium', 'library', 'museum', 'street',
  'avenue', 'road',
]);
const followedByTitleWord = (text, end) => {
  const m = /^\.?[ \t]+(\p{L}+)/u.exec(text.slice(end, end + 40));
  return !!m && TITLE_CONTINUATIONS.has(norm(m[1]));
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

// "Sr.", "Dña.", "Herr": exact-case so that ordinary words ("d. Pago", "me") never
// count as titles. A literal without its own period may carry an optional one.
const strictHonorific = (() => {
  const forms = new Set();
  for (const h of STRICT_HONORIFICS) {
    forms.add(h);
    forms.add(h.toUpperCase());
  }
  return [...forms].map(h => (h.endsWith('.') ? escapeRe(h) : `${escapeRe(h)}\\.?`)).join('|');
})();
const anyHonorific = `(?:${alt(HONORIFICS)})\\.?|${strictHonorific}`;
const HONORIFIC_RUN = `(?:(?:${anyHonorific})[ \\t]+){0,2}`;
const ARTICLE = `(?:(?:${alt(['the', 'el', 'la', 'los', 'las', 'le', 'les', 'der', 'die', 'das', 'o', 'a'])})[ \\t]+)?`;
const BETWEEN_RE = rx(`(?<!${LETTER})(?:${alt(BETWEEN_WORDS)})(?!${LETTER})`);
const FIRST_AFTER_BETWEEN = word => rx(`${word}[ \\t]+${ARTICLE}${HONORIFIC_RUN}(${PHRASE})`);
const SECOND_AFTER_AND = rx(`[ \\t](?:${alt(AND_WORDS)})[ \\t]+${ARTICLE}${HONORIFIC_RUN}(${PHRASE})`);

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
  run(rx(`(?<!${LETTER})(?:${alt(HONORIFICS)})\\.?[ \\t]+(${PHRASE})`),
    m => addCandidate(cands, m[1], 3, { honorific: true }));
  // "Sra. María García", "Herr Müller", "M. Dupont", "Dña. Ana"
  run(rx(`(?<!${LETTER})(?:${strictHonorific})[ \\t]+(${PHRASE})`),
    m => addCandidate(cands, m[1], 3, { honorific: true }));
  // "Dear Mr. Okafor", "Estimado Sr. Pérez", "Sehr geehrter Herr Müller", "Cher Monsieur Dupont"
  run(rx(`(?<!${LETTER})(?:${alt(['dear'])}|${SALUTATIONS.map(s => `${strictAlt(s)}`).join('|')})[ \\t]+${HONORIFIC_RUN}(${PHRASE})`),
    m => addCandidate(cands, m[1], 3));

  // "Name: Jane Doe", "Signed - Jane Doe", "By: Jane Doe", "Nombre: Juan Pérez"
  run(rx(`(?<!${LETTER})(?:${alt(LABEL_CUES)})[ \\t]*[:\\-–][ \\t]*${HONORIFIC_RUN}(${PHRASE})`),
    m => addCandidate(cands, m[1], 3));

  // "Tenant Jane Doe", "Landlord: Maria Gonzalez", "El arrendatario Juan Pérez", "Mieter Hans Meier"
  run(rx(`(?<!${LETTER})(?:${alt(ROLE_CUES)})(?!${LETTER})[ \\t]*[,:\\-–]?[ \\t]*(?:\\([^)\\n]{0,30}\\)[ \\t]*)?${HONORIFIC_RUN}(${PHRASE})`),
    m => addCandidate(cands, m[1], 2));

  // 'Jane Doe (the "Tenant")', 'Juan Pérez ("el Arrendatario")', 'Marie Dupont (« le Locataire »)'
  run(rx(`(${PHRASE})[ \\t]*,?[ \\t]*\\((?:[ \\t]*(?:the|hereinafter|herein|referred[ \\t]+to[ \\t]+as|collectively|individually|each|en adelante|en lo sucesivo|denominad[oa]|ci-après|ci-apres|dénommé[e]?|denomme[e]?|nachfolgend|im Folgenden|doravante|designad[oa]|el|la|le|der|die|o|a)[ \\t]+)*[ \\t]*[“"'‘«][ \\t]*([\\p{L}][\\p{L} ]{1,30}?)[ \\t]*[”"'’»]`),
    m => addCandidate(cands, m[1], ORGISH_DEFINED_TERMS.has(norm(m[2].trim())) ? 1 : 2));

  // "between Jane Doe and John Smith", "entre Juan Pérez y María López", "zwischen Hans Meier und ..."
  run(BETWEEN_RE, m => {
    const window = text.slice(m.index, m.index + 240).split(/\n\s*\n/)[0];
    const first = FIRST_AFTER_BETWEEN(ci(m[0])).exec(window);
    if (first) addCandidate(cands, first[1], 1);
    const second = SECOND_AFTER_AND.exec(window);
    if (second) addCandidate(cands, second[1], 1);
  });

  // "/s/ Jane Doe"
  run(rx(`\\/s\\/[ \\t]*(${PHRASE})`), m => addCandidate(cands, m[1], 3));

  // A line that is only a name, sitting in a signature block
  const lines = text.split('\n');
  const lineRe = rx(`^[ \\t]*(${PHRASE})[ \\t]*(?:,[ \\t]*[\\p{L} .&]{2,40})?[ \\t]*$`);
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
      const trimmed = person.trim();
      if (/[ ]{3,}|\t|\n/.test(trimmed)) continue; // spans a column break (signature block)
      if (/^\p{Lu}/u.test(trimmed) && trimmed.split(/\s+/).every(t => /^\p{Lu}/u.test(t))) {
        addCandidate(cands, person, 0, { people: true });
      }
    }
  } catch {
    // fall through — the other signals still run
  }

  // Pure lexicon pairs ("Jane Roberts", "María García") with no surrounding cue
  // A leading capitalized word ("Reunidos María García", German nouns) must not hide the pair,
  // so the trailing windows of each run are tried as well.
  run(rx(PHRASE), m => {
    addCandidate(cands, m[0], 0);
    const toks = m[0].split(/[ \t]+/);
    for (let i = 1; toks.length - i >= 2; i++) addCandidate(cands, toks.slice(i).join(' '), 0);
  });

  return cands;
}

// One literal, case-insensitive, for salutation words ("Sehr geehrter", "Estimado").
function strictAlt(word) {
  return ci(word);
}

function tokenSpans(text, token) {
  const variants = [...new Set([token, token.toUpperCase(), titleCase(token)])].map(escapeRe).join('|');
  return rx(`(?<![${LETTER}'’\\-])(?:${variants})(?!${LETTER})`, 'g');
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
      const body = tokens.map(t => escapeRe(t)).join(`[ ]{1,2}(?:${LETTER}\\.?[ ]{1,2})?`);
      phraseSpans.push(...matches(rx(`(?<!${LETTER})${body}(?!${LETTER})`, 'gi'), 55, true));
      if (tokens.length === 2) {
        phraseSpans.push(...matches(
          rx(`(?<!${LETTER})${escapeRe(tokens[1])}[ \\t]*,[ \\t]*${escapeRe(tokens[0])}(?!${LETTER})`, 'gi'), 55, true));
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
