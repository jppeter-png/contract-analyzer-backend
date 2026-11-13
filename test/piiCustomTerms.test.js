const request = require('supertest');
const { scrubPII, normalizeTerms } = require('../src/piiScrubber');
const app = require('../index');

describe('custom terms: scrubPII', () => {
  test('hides a cue-less name that automatic detection misses', () => {
    const text = 'This lease is made to Priya Natarajan for one year.';
    expect(scrubPII(text).scrubbed).toContain('Natarajan');
    const { scrubbed } = scrubPII(text, { customTerms: ['Priya Natarajan'] });
    expect(scrubbed).toBe('This lease is made to [HIDDEN 1] for one year.');
  });

  test('ignores case and spacing, and tolerates punctuation inside the term', () => {
    const { scrubbed } = scrubPII('Call 555-0142 or 555 0142. Owner: JORDAN   ellis.', {
      customTerms: ['555 0142', 'jordan ellis'],
    });
    expect(scrubbed).toBe('Call [HIDDEN 1] or [HIDDEN 1]. Owner: [HIDDEN 2].');
  });

  test('finds a term broken across a line', () => {
    const { scrubbed } = scrubPII('Premises: 14 Oak\nLane, Springfield.', { customTerms: ['14 Oak Lane'] });
    expect(scrubbed).toBe('Premises: [HIDDEN 1], Springfield.');
  });

  test('matches whole words only', () => {
    const { scrubbed } = scrubPII('Ellis signed. Ellison did not. Mr. Ellis\'s pen.', { customTerms: ['Ellis'] });
    expect(scrubbed).toBe('[HIDDEN 1] signed. Ellison did not. Mr. [HIDDEN 1]\'s pen.');
  });

  test('"Jordan Ellis" and "Ellis" are the same person; the longer match wins', () => {
    const { scrubbed } = scrubPII('Jordan Ellis agrees. Ellis pays. Ana Ruiz witnesses.', {
      customTerms: ['Ellis', 'Jordan Ellis', 'Ana Ruiz'],
    });
    expect(scrubbed).toBe('[HIDDEN 1] agrees. [HIDDEN 1] pays. [HIDDEN 2] witnesses.');
  });

  test('beats automatic detection where they overlap', () => {
    const { scrubbed } = scrubPII('Write to jane@x.com.', { customTerms: ['jane@x.com'] });
    expect(scrubbed).toBe('Write to [HIDDEN 1].');
  });

  test('works alongside automatic detection', () => {
    const { scrubbed } = scrubPII('Tenant: Jane Doe, jane@x.com. Landlord is Priya Natarajan.', {
      customTerms: ['Priya Natarajan'],
    });
    expect(scrubbed).toBe('Tenant: [NAME], [EMAIL]. Landlord is [HIDDEN 1].');
  });

  test('autoDetect false hides only the typed terms', () => {
    const { scrubbed, findings } = scrubPII('Tenant: Jane Doe, jane@x.com, 415-555-2671. Priya Natarajan owns it.', {
      customTerms: ['Priya Natarajan'],
      autoDetect: false,
    });
    expect(scrubbed).toBe('Tenant: Jane Doe, jane@x.com, 415-555-2671. [HIDDEN 1] owns it.');
    expect(findings).toEqual([{ label: 'Hidden by you', count: 1, redacted: ['Priya Natarajan'] }]);
  });

  test('autoDetect false with no terms changes nothing', () => {
    const text = 'Jane Doe, jane@x.com';
    expect(scrubPII(text, { autoDetect: false }).scrubbed).toBe(text);
  });

  test('finds Chinese names inside a longer run of characters', () => {
    const { scrubbed } = scrubPII('出租人张伟先生与承租人李娜签订。', { customTerms: ['张伟', '李娜'] });
    expect(scrubbed).toBe('出租人[HIDDEN 1]先生与承租人[HIDDEN 2]签订。');
  });

  test('regex characters in a term are taken literally', () => {
    const { scrubbed } = scrubPII('Unit (B+2) is rented. Unit B2 is not.', { customTerms: ['(B+2)'] });
    expect(scrubbed).toBe('Unit ([HIDDEN 1]) is rented. Unit B2 is not.');
  });

  test('reports how often each term was found, including terms not in the document', () => {
    const { termMatches } = scrubPII('Ellis and Ellis and Jordan Ellis.', { customTerms: ['Ellis', 'Nobody Here'] });
    expect(termMatches).toEqual([{ term: 'Ellis', count: 3 }, { term: 'Nobody Here', count: 0 }]);
  });

  test('a second pass over scrubbed text carries on after the existing [HIDDEN n]', () => {
    const first = scrubPII('Jordan Ellis rents from Priya Natarajan, agent Tomas Reyes.', { customTerms: ['Jordan Ellis', 'Priya Natarajan'], autoDetect: false });
    expect(first.scrubbed).toBe('[HIDDEN 1] rents from [HIDDEN 2], agent Tomas Reyes.');
    const second = scrubPII(first.scrubbed, { customTerms: ['Tomas Reyes'], autoDetect: false });
    expect(second.scrubbed).toBe('[HIDDEN 1] rents from [HIDDEN 2], agent [HIDDEN 3].');
  });

  test('findings list each original once and put the typed terms first', () => {
    const { findings } = scrubPII('Jane Doe, jane@x.com. Priya Natarajan. Priya Natarajan.', { customTerms: ['Priya Natarajan'] });
    expect(findings[0]).toEqual({ label: 'Hidden by you', count: 2, redacted: ['Priya Natarajan'] });
  });
});

describe('custom terms: accents', () => {
  test('a term typed without accents finds the accented name, and the other way round', () => {
    const { scrubbed } = scrubPII('José García signed. JOSE GARCIA did not. Jose Garcia too.', { customTerms: ['Jose Garcia'], autoDetect: false });
    expect(scrubbed).toBe('[HIDDEN 1] signed. [HIDDEN 1] did not. [HIDDEN 1] too.');
    const back = scrubPII('Jose Garcia signed. José García too.', { customTerms: ['José García'], autoDetect: false });
    expect(back.scrubbed).toBe('[HIDDEN 1] signed. [HIDDEN 1] too.');
  });

  test('a name written with combining accents is hidden whole, with no stray accent left', () => {
    const decomposed = 'Jose\u0301 signed.';
    expect(scrubPII(decomposed, { customTerms: ['José'], autoDetect: false }).scrubbed).toBe('[HIDDEN 1] signed.');
    expect(scrubPII('José signed.', { customTerms: ['Jose\u0301'], autoDetect: false }).scrubbed).toBe('[HIDDEN 1] signed.');
  });

  test('positions stay right in text with accents and emoji before the match', () => {
    const { scrubbed } = scrubPII('Café 🏠 señor Núñez, Ellis.', { customTerms: ['Nunez', 'Ellis'], autoDetect: false });
    expect(scrubbed).toBe('Café 🏠 señor [HIDDEN 1], [HIDDEN 2].');
  });

  test('whole-word matching still holds once accents are ignored', () => {
    const { scrubbed } = scrubPII('Garcia and Garcíamarquez', { customTerms: ['garcía'], autoDetect: false });
    expect(scrubbed).toBe('[HIDDEN 1] and Garcíamarquez');
  });

  test('Korean and Chinese names are still found', () => {
    expect(scrubPII('임대인 김철수는 서명했다', { customTerms: ['김철수'], autoDetect: false }).scrubbed).toBe('임대인 [HIDDEN 1]는 서명했다');
    expect(scrubPII('出租人张伟先生', { customTerms: ['张伟'], autoDetect: false }).scrubbed).toBe('出租人[HIDDEN 1]先生');
  });
});

describe('custom terms: protecting earlier placeholders', () => {
  test('a term that looks like part of a placeholder never changes one', () => {
    const { scrubbed, termMatches } = scrubPII('[NAME 1] and [HIDDEN 12] met NAME and 12 times.', {
      customTerms: ['NAME', '12'],
      autoDetect: false,
    });
    expect(scrubbed).toBe('[NAME 1] and [HIDDEN 12] met [HIDDEN 13] and [HIDDEN 14] times.');
    expect(termMatches).toEqual([{ term: 'NAME', count: 1 }, { term: '12', count: 1 }]);
  });
});

describe('normalizeTerms', () => {
  test('trims, collapses spaces, drops short, repeated and non-string terms', () => {
    expect(normalizeTerms(['  Jordan   Ellis ', 'jordan ellis', 'x', '', 42, null, 'Oak Lane']))
      .toEqual(['Jordan Ellis', 'Oak Lane']);
  });
  test('is safe with anything that is not an array', () => {
    expect(normalizeTerms(undefined)).toEqual([]);
    expect(normalizeTerms('Jordan')).toEqual([]);
  });
});

describe('POST /api/scrub with custom terms', () => {
  const text = 'Lease to Priya Natarajan, jane@x.com.';

  test('JSON body with an array', async () => {
    const res = await request(app).post('/api/scrub').send({ text, customTerms: ['Priya Natarajan'] });
    expect(res.status).toBe(200);
    expect(res.body.scrubbedText).toBe('Lease to [HIDDEN 1], [EMAIL].');
    expect(res.body.termMatches).toEqual([{ term: 'Priya Natarajan', count: 1 }]);
  });

  test('multipart with customTerms as a JSON string and autoDetect=false', async () => {
    const res = await request(app).post('/api/scrub')
      .field('customTerms', JSON.stringify(['Priya Natarajan']))
      .field('autoDetect', 'false')
      .attach('file', Buffer.from(text), 'lease.txt');
    expect(res.status).toBe(200);
    expect(res.body.scrubbedText).toBe('Lease to [HIDDEN 1], jane@x.com.');
  });

  test('old clients that send nothing extra get the same response as before', async () => {
    const res = await request(app).post('/api/scrub').send({ text });
    expect(res.status).toBe(200);
    expect(res.body.scrubbedText).toContain('[EMAIL]');
    expect(res.body).not.toHaveProperty('termMatches');
  });

  test('rejects malformed or oversized terms without echoing them', async () => {
    const secret = 'Zebulon Quarrington';
    const bad = [
      { customTerms: 'not json' },
      { customTerms: [1, 2] },
      { customTerms: Array.from({ length: 51 }, (_, i) => `term ${i}`) },
      { customTerms: ['a'.repeat(101)] },
      { customTerms: { a: secret } },
    ];
    for (const extra of bad) {
      const res = await request(app).post('/api/scrub').send({ text, ...extra });
      expect(res.status).toBe(400);
      expect(JSON.stringify(res.body)).not.toContain(secret);
    }
  });

  test('terms are not written to the server log', async () => {
    const spies = ['log', 'error', 'warn', 'info'].map(k => jest.spyOn(console, k).mockImplementation(() => {}));
    await request(app).post('/api/scrub').send({ text, customTerms: ['Priya Natarajan'] });
    await request(app).post('/api/scrub').send({ text, customTerms: 'Priya Natarajan' });
    const logged = spies.flatMap(s => s.mock.calls).flat().join(' ');
    spies.forEach(s => s.mockRestore());
    expect(logged).not.toContain('Natarajan');
  });
});
