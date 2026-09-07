const { scrubPII } = require('../src/piiScrubber');

describe('scrubPII — basic redaction', () => {
  test('redacts email addresses', () => {
    const { scrubbed, findings } = scrubPII('Contact us at support@example.com for help.');
    expect(scrubbed).toBe('Contact us at [EMAIL] for help.');
    expect(findings).toContainEqual({ label: 'Email addresses', count: 1, redacted: ['support@example.com'] });
  });

  test('redacts standard US phone numbers (xxx-xxx-xxxx)', () => {
    const { scrubbed, findings } = scrubPII('Call 415-555-2671 anytime.');
    expect(scrubbed).toBe('Call [PHONE] anytime.');
    expect(findings).toContainEqual({ label: 'Phone numbers', count: 1, redacted: ['415-555-2671'] });
  });

  test('redacts SSNs (xxx-xx-xxxx)', () => {
    const { scrubbed, findings } = scrubPII('My SSN is 123-45-6789 for verification.');
    expect(scrubbed).toBe('My SSN is [SSN] for verification.');
    expect(findings).toContainEqual({ label: 'Social Security Numbers', count: 1, redacted: ['123-45-6789'] });
  });

  test('redacts EIN/Tax IDs (xx-xxxxxxx) distinctly from SSNs', () => {
    const { scrubbed, findings } = scrubPII('The EIN is 12-3456789 for tax purposes.');
    expect(scrubbed).toBe('The EIN is [EIN] for tax purposes.');
    expect(findings).toContainEqual({ label: 'EIN / Tax IDs', count: 1, redacted: ['12-3456789'] });
  });

  test('reports accurate counts when the same PII repeats', () => {
    const { findings } = scrubPII('Email a@x.com and again a@x.com and also b@x.com.');
    const emailFinding = findings.find(f => f.label === 'Email addresses');
    expect(emailFinding.count).toBe(3);
    expect(emailFinding.redacted.sort()).toEqual(['a@x.com', 'b@x.com']);
  });

  test('returns no findings for text with no PII', () => {
    const { scrubbed, findings } = scrubPII('This agreement is between the parties for consulting services.');
    expect(findings).toEqual([]);
    expect(scrubbed).toContain('This agreement is between the parties');
  });
});

describe('scrubPII — SSN vs. phone number collisions', () => {
  test('a genuine phone number (3-3-4 digit grouping) is tagged PHONE, not SSN', () => {
    const { scrubbed, findings } = scrubPII('Reach the office at 800-555-1234.');
    expect(scrubbed).toBe('Reach the office at [PHONE].');
    expect(findings.map(f => f.label)).toEqual(['Phone numbers']);
  });

  // KNOWN LIMITATION: the SSN regex matches ANY 3-2-4 digit grouping, regardless of
  // whether it's actually a Social Security Number. Reference numbers, invoice IDs,
  // or internal codes formatted as NNN-NN-NNNN are false-positively redacted as SSNs.
  // This is the safer failure direction for a PII scrubber (over-redact rather than
  // leak), but it's worth knowing about — it will over-report SSN counts.
  test('KNOWN LIMITATION: a non-SSN number in 3-2-4 format is still redacted as an SSN', () => {
    const { scrubbed, findings } = scrubPII('Reference number 800-55-1234 is not a Social Security Number.');
    expect(scrubbed).toContain('[SSN]');
    expect(findings).toContainEqual({ label: 'Social Security Numbers', count: 1, redacted: ['800-55-1234'] });
  });
});

describe('scrubPII — international phone formats', () => {
  test('+1-prefixed US format is redacted correctly', () => {
    const { scrubbed, findings } = scrubPII('Call +1 415-555-2671 for support.');
    expect(scrubbed).toBe('Call [PHONE] for support.');
    expect(findings).toContainEqual({ label: 'Phone numbers', count: 1, redacted: ['+1 415-555-2671'] });
  });

  // KNOWN LIMITATION: the phone regex only recognizes US-style NANP formats
  // (optional +1, 3-3-4 digit grouping). International numbers pass through
  // completely unredacted.
  test('KNOWN LIMITATION: non-US phone formats are not redacted at all', () => {
    const { scrubbed, findings } = scrubPII('Call the UK office at +44 20 7946 0958 for support.');
    expect(scrubbed).toContain('+44 20 7946 0958');
    expect(findings).toEqual([]);
  });
});

describe('scrubPII — names near other PII', () => {
  test('redacts a name and an adjacent email in the same sentence', () => {
    const { scrubbed, findings } = scrubPII('Contact John Smith at john.smith@example.com or call 415-555-2671.');
    expect(scrubbed).toBe('Contact [NAME] at [EMAIL] or call [PHONE].');
    expect(findings.find(f => f.label === 'Email addresses').redacted).toEqual(['john.smith@example.com']);
    expect(findings.find(f => f.label === 'Person names').redacted).toEqual(['John Smith']);
  });

  test('does not leave email local-parts behind looking like leaked names', () => {
    const { scrubbed } = scrubPII('Reach Jane Roberts at jane.roberts@example.com.');
    expect(scrubbed).not.toContain('jane.roberts');
    expect(scrubbed).not.toContain('@example.com');
  });

  // KNOWN LIMITATION: NLP-based name detection (the `compromise` library) is
  // sentence-structure-dependent and can silently miss names — e.g. a name
  // immediately preceded by a role/title noun and followed by a comma. There is
  // no fallback here, so a missed name is a silent PII leak, not an error.
  test('KNOWN LIMITATION: NLP name detection can miss a name depending on sentence structure', () => {
    const { scrubbed, findings } = scrubPII('Employee Jane Doe, phone +1 415-555-2671, email jane.doe@corp.com.');
    // Email and phone are still caught by regex...
    expect(scrubbed).toContain('[EMAIL]');
    expect(scrubbed).toContain('[PHONE]');
    // ...but the name is not reliably caught — this assertion documents the gap
    // rather than a desired behavior. If compromise improves and starts catching
    // this, this test should be updated to require it.
    const nameFinding = findings.find(f => f.label === 'Person names');
    expect(nameFinding).toBeUndefined();
    expect(scrubbed).toContain('Jane Doe');
  });
});
