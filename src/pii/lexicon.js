const nlp = require('compromise');

// compromise ships a first/last-name lexicon. We only use it as per-token
// evidence — whole-sentence people() detection is too context-sensitive to
// trust on its own.
const cache = new Map();

function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function tagsFor(word) {
  const key = titleCase(word.replace(/\.$/, ''));
  if (cache.has(key)) return cache.get(key);
  let tags = new Set();
  try {
    const json = nlp(key).json();
    const terms = json[0] && json[0].terms;
    if (terms && terms[0]) tags = new Set(terms[0].tags || []);
  } catch {
    // an unknown word simply has no evidence
  }
  cache.set(key, tags);
  return tags;
}

const isFirstName = w => tagsFor(w).has('FirstName');
const isLastName = w => tagsFor(w).has('LastName');

const FUNCTION_WORD_TAGS = [
  'Verb', 'Modal', 'Auxiliary', 'Copula', 'Adjective', 'Adverb', 'Preposition',
  'Conjunction', 'Determiner', 'Pronoun', 'Value', 'Month', 'Date',
];

// True for ordinary words (will, may, the, ...) that are not also names, so a
// capitalized "Will" at the start of a sentence is never mistaken for a person.
function isCommonWord(w) {
  const tags = tagsFor(w);
  if (tags.has('Person')) return false;
  return FUNCTION_WORD_TAGS.some(t => tags.has(t));
}

module.exports = { titleCase, isFirstName, isLastName, isCommonWord };
