const { digitsOf, luhn, validIpv4, validIban } = require('./validators');

const MONTH = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const DATE = `(?:\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4}|\\d{4}-\\d{2}-\\d{2}|${MONTH}\\.?[ \\t]+\\d{1,2}(?:st|nd|rd|th)?,?[ \\t]+\\d{4}|\\d{1,2}(?:st|nd|rd|th)?[ \\t]+${MONTH}\\.?,?[ \\t]+\\d{4})`;

const variants = words => words.split(/\s+/).map(w => `(?:${w}|${w.toUpperCase()}|${w.charAt(0).toUpperCase()}${w.slice(1)})`).join('|');
const STREET_SUFFIX = `(?:${variants('street st avenue ave road rd boulevard blvd lane ln drive dr court ct way place pl terrace ter circle cir highway hwy parkway pkwy square sq trail trl plaza row alley loop pike crescent')})`;
const DIRECTION = '(?:N|S|E|W|NE|NW|SE|SW|North|South|East|West|NORTH|SOUTH|EAST|WEST)';
const STATES = 'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC';
const CITY_STATE_ZIP = `[A-Z][A-Za-z.'’\\-]+(?:[ \\t]+[A-Z][A-Za-z.'’\\-]+){0,2},?[ \\t]+(?:${STATES})\\.?,?[ \\t]+\\d{5}(?:-\\d{4})?`;
const UNIT = '(?:Apt|Apartment|Suite|Ste|Unit|Floor|Fl|Room|Rm|Bldg|Building|APT|SUITE|STE|UNIT)';

const SECTION_CONTEXT = /(?:section|sec\.?|clause|article|§|paragraph|para\.?|schedule|exhibit|item|step|version|ver\.?|v)\s*$/i;
const CARD_CONTEXT = /(?:card|visa|mastercard|master card|amex|american express|discover|debit|credit)[^\n]{0,30}$/i;

// Each rule: regex (matched against the ORIGINAL text), label shown in the app,
// placeholder tag, overlap priority (higher wins), optional capture group that
// holds the sensitive value (so the label stays readable), optional validator.
const RULES = [
  { label: 'Email addresses', tag: '[EMAIL]', priority: 100,
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  { label: 'Email addresses', tag: '[EMAIL]', priority: 100,
    regex: /\b[A-Za-z0-9._%+\-]+[ \t]*(?:\[at\]|\(at\)|\{at\})[ \t]*[A-Za-z0-9.\-]+[ \t]*(?:\[dot\]|\(dot\)|\{dot\})[ \t]*[A-Za-z]{2,}/gi },

  { label: 'Social Security Numbers', tag: '[SSN]', priority: 100,
    regex: /\b\d{3}[- ]\d{2}[- ]\d{4}\b/g },
  { label: 'Social Security Numbers', tag: '[SSN]', priority: 100, group: 1,
    regex: /\b(?:SSN|SS#|Social[ \t]+Security(?:[ \t]+(?:Number|No\.?|#))?)\b[ \t]*(?:is|:|#|-)?[ \t]*(\d{9})(?!\d)/gi },

  { label: 'Credit card numbers', tag: '[CC]', priority: 98,
    regex: /(?<![\d-])(?:\d[ -]?){12,18}\d(?![\d-])/g,
    validate: (value, _m, text, start) => {
      const digits = digitsOf(value);
      if (digits.length < 13 || digits.length > 19) return false;
      if (new Set(digits).size === 1) return false; // 0000 0000 0000 0000 passes Luhn but is not a card
      const plausibleIssuer = /^[2-6]/.test(digits);
      return (luhn(digits) && plausibleIssuer) || CARD_CONTEXT.test(text.slice(Math.max(0, start - 40), start));
    } },

  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<!\d)(?:\+?1[ \t.\-]?)?\(?\d{3}\)?[ \t.\-]\d{3}[ \t.\-]\d{4}(?!\d)/g },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<!\d)\(\d{3}\)[ \t]?\d{3}[ \t.\-]?\d{4}(?!\d)/g },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<![\w+])\+\d[\d \t().\-]{7,18}\d(?!\d)/g,
    validate: value => { const n = digitsOf(value).length; return n >= 8 && n <= 15; } },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95, group: 1,
    regex: /\b(?:phone|tel|telephone|cell|mobile|fax|call|text|whatsapp)\b[^\n\d]{0,15}?(\+?\d{10,11})(?!\d)/gi,
    validate: value => { const d = digitsOf(value); return d.length === 10 || (d.length === 11 && d[0] === '1'); } },

  { label: 'Date of birth patterns', tag: '[DOB]', priority: 92,
    regex: new RegExp(`\\b(?:DOB|D\\.O\\.B\\.?|Date[ \\t]+of[ \\t]+Birth|Birth[ \\t]?date|Birthday|born(?:[ \\t]+on)?)\\b[ \\t]*[:\\-]?[ \\t]*${DATE}`, 'gi') },

  { label: 'Medical record numbers', tag: '[MRN]', priority: 90, regex: /\b(?:MRN|MR#?)\s*:?\s*\d+/gi },
  { label: 'NPI numbers', tag: '[NPI]', priority: 90, regex: /\bNPI\s*:?\s*\d{10}\b/gi },
  { label: 'DEA numbers', tag: '[DEA]', priority: 90, regex: /\bDEA\s*:?\s*[A-Z]{2}\d{7}\b/gi },

  { label: 'Bank account numbers', tag: '[ACCOUNT]', priority: 90, group: 1,
    regex: /\b(?:(?:bank[ \t]+)?account|acct|a\/c|routing|ABA|sort[ \t]+code|IBAN|SWIFT|BIC)\b\.?[ \t]*(?:number|no\.?|num|#|code)?[ \t]*[:#\-]?[ \t]*(\d[\d \-]{4,30}\d|[A-Z]{2}\d{2}[A-Z0-9 ]{10,30})/gi,
    validate: value => digitsOf(value).length >= 6 },
  { label: 'Bank account numbers', tag: '[ACCOUNT]', priority: 90,
    regex: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,7}(?:[ ]?[A-Z0-9]{1,4})?\b/g,
    validate: validIban },

  { label: 'ID numbers', tag: '[ID]', priority: 88, group: 1,
    regex: /\b(?:driver'?s?[ \t]+licen[sc]e|DL|licen[sc]e|passport|national[ \t]+ID|tax[ \t]+ID|TIN|ITIN|ID|policy|member|claim|patient|student|employee|customer)\b\.?[ \t]*(?:number|no\.?|num|#|id)?[ \t]*[:#\-]?[ \t]*([A-Z0-9][A-Z0-9\-]{3,19})(?![A-Za-z0-9])/gi,
    validate: value => digitsOf(value).length >= 4 },

  { label: 'Street addresses', tag: '[ADDRESS]', priority: 80,
    regex: new RegExp(
      `\\b\\d{1,6}(?:-\\d{1,6})?[ \\t]+(?:${DIRECTION}\\.?[ \\t]+)?(?:[A-Z0-9][A-Za-z0-9'’.\\-]*[ \\t]+){0,4}${STREET_SUFFIX}\\b` +
      `(?:[ \\t]+${DIRECTION}\\b\\.?)?` +
      `(?:,?[ \\t]+${UNIT}\\.?[ \\t]*#?[A-Za-z0-9\\-]+|,?[ \\t]*#[A-Za-z0-9\\-]+)?` +
      `(?:,[ \\t]*${CITY_STATE_ZIP})?`, 'g') },
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 78,
    regex: new RegExp(`\\b${CITY_STATE_ZIP}\\b`, 'g') },
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 80,
    regex: /\bP\.?[ \t]?O\.?[ \t]+Box[ \t]+\d+\b/gi },
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 70,
    regex: /\b[A-Z]\d[A-Z][ ]?\d[A-Z]\d\b|\b[A-Z]{1,2}\d[A-Z\d]?[ ]\d[A-Z]{2}\b/g },

  { label: 'Vehicle identification numbers', tag: '[VIN]', priority: 75,
    regex: /\b[A-HJ-NPR-Z0-9]{17}\b/g,
    validate: value => /\d/.test(value) && /[A-Z]/.test(value) },

  { label: 'IP addresses', tag: '[IP]', priority: 70, group: 1,
    regex: /(?<![\d.])((?:\d{1,3}\.){3}\d{1,3})(?!\d|\.\d)/g,
    validate: (value, _m, text, start) =>
      validIpv4(value) && !SECTION_CONTEXT.test(text.slice(Math.max(0, start - 20), start)) },
  { label: 'IP addresses', tag: '[IP]', priority: 70,
    regex: /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b/g },
  { label: 'Device identifiers', tag: '[MAC]', priority: 70,
    regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g },

  { label: 'Social media handles', tag: '[SOCIAL]', priority: 70,
    regex: /\bhttps?:\/\/(?:www\.)?(?:linkedin\.com\/in|facebook\.com|fb\.com|twitter\.com|x\.com|instagram\.com|tiktok\.com\/@|github\.com|t\.me)\/[\w.\-@]+\/?/gi },
  { label: 'Social media handles', tag: '[SOCIAL]', priority: 65,
    regex: /(?<![\w@.])@[A-Za-z_][A-Za-z0-9_]{2,14}\b/g },

  { label: 'EIN / Tax IDs', tag: '[EIN]', priority: 60, regex: /\b\d{2}-\d{7}\b/g },
];

// Order in which finding labels are reported to the app (names come last).
const LABEL_ORDER = [...new Set(RULES.map(r => r.label))];

function findStructured(text) {
  const spans = [];
  for (const rule of RULES) {
    const flags = rule.regex.flags.replace(/[gd]/g, '') + 'g' + (rule.group ? 'd' : '');
    const re = new RegExp(rule.regex.source, flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      let start = m.index;
      let end = m.index + m[0].length;
      if (rule.group) {
        if (m[rule.group] === undefined) continue;
        [start, end] = m.indices[rule.group];
      }
      const value = text.slice(start, end);
      if (rule.validate && !rule.validate(value, m, text, start, end)) continue;
      spans.push({ start, end, label: rule.label, tag: rule.tag, priority: rule.priority });
    }
  }
  return spans;
}

module.exports = { findStructured, LABEL_ORDER };
