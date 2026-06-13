const nlp = require('compromise');

const PII_RULES = [
  { label: 'Email addresses',        regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,    tag: '[EMAIL]' },
  { label: 'Phone numbers',          regex: /(\+?1[\s.\-]?)?\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/g,   tag: '[PHONE]' },
  { label: 'Social Security Numbers',regex: /\b\d{3}[- ]\d{2}[- ]\d{4}\b/g,                           tag: '[SSN]' },
  { label: 'Credit card numbers',    regex: /\b(?:\d{4}[ \-]?){3}\d{4}\b/g,                           tag: '[CC]' },
  { label: 'IP addresses',           regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,                           tag: '[IP]' },
  { label: 'Medical record numbers', regex: /\b(?:MRN|MR#?)\s*:?\s*\d+/gi,                            tag: '[MRN]' },
  { label: 'NPI numbers',            regex: /\bNPI\s*:?\s*\d{10}\b/gi,                                tag: '[NPI]' },
  { label: 'DEA numbers',            regex: /\bDEA\s*:?\s*[A-Z]{2}\d{7}\b/gi,                        tag: '[DEA]' },
  { label: 'Date of birth patterns', regex: /\b(?:DOB|Date of Birth)\s*:?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/gi, tag: '[DOB]' },
  { label: 'EIN / Tax IDs',          regex: /\b\d{2}-\d{7}\b/g,                                       tag: '[EIN]' },
];

function scrubPII(text) {
  let scrubbed = text;
  const findings = [];

  // Step 1: Regex-based PII
  for (const { label, regex, tag } of PII_RULES) {
    const fresh = new RegExp(regex.source, regex.flags);
    const matches = scrubbed.match(fresh);
    if (matches?.length) {
      findings.push({ label, count: matches.length, redacted: [...new Set(matches)] });
      scrubbed = scrubbed.replace(new RegExp(regex.source, regex.flags), tag);
    }
  }

  // Step 2: NLP-based name detection
  try {
    const doc = nlp(scrubbed);
    const uniqueNames = [...new Set(doc.people().out('array').filter(n => n.trim().length > 2))];

    if (uniqueNames.length > 0) {
      let nameCount = 0;
      const redactedNames = [];

      for (const name of uniqueNames) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const nameRegex = new RegExp(`\\b${escaped}\\b`, 'g');
        const matches = scrubbed.match(nameRegex);
        if (matches?.length) {
          nameCount += matches.length;
          redactedNames.push(name);
          scrubbed = scrubbed.replace(nameRegex, '[NAME]');
        }
      }

      if (nameCount > 0) {
        findings.push({ label: 'Person names', count: nameCount, redacted: redactedNames });
      }
    }
  } catch (err) {
    console.warn('NLP name detection failed:', err.message);
  }

  return { scrubbed, findings };
}

module.exports = { scrubPII };