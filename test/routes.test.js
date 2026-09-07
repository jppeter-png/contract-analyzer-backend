const path = require('path');
const request = require('supertest');

// Force a deterministic key so /api/analyze's precondition check passes
// regardless of whether a real .env is present in the environment running tests.
process.env.GROQ_API_KEY = 'test-key';

const app = require('../index');

const FIXTURE = path.join(__dirname, 'fixtures', 'sample-contract.txt');

function validGroqResponse(overrides = {}) {
  const analysis = {
    overall_risk: 'high',
    category: 'employment',
    summary: 'This is a risky employment contract.',
    issues: [
      {
        severity: 'high',
        category: 'non-compete',
        title: 'Overly broad non-compete',
        description: 'The non-compete is broader than necessary.',
        recommendation: 'Negotiate a narrower scope.',
      },
    ],
    missing_protections: ['Severance pay'],
    ...overrides,
  };
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content: JSON.stringify(analysis) } }] }),
  };
}

describe('POST /api/scrub', () => {
  test('scrubs PII from raw JSON text', async () => {
    const res = await request(app)
      .post('/api/scrub')
      .send({ text: 'Contact John Smith at john.smith@example.com or call 415-555-2671.' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.scrubbedText).toContain('[EMAIL]');
    expect(res.body.scrubbedText).toContain('[PHONE]');
    expect(res.body.totalRedacted).toBeGreaterThan(0);
    expect(res.body.findings.length).toBeGreaterThan(0);
    expect(typeof res.body.wordCount).toBe('number');
    expect(typeof res.body.preview).toBe('string');
  });

  test('scrubs PII from an uploaded .txt file', async () => {
    const res = await request(app)
      .post('/api/scrub')
      .attach('file', FIXTURE);

    expect(res.status).toBe(200);
    expect(res.body.scrubbedText).toContain('[EMAIL]');
    expect(res.body.scrubbedText).toContain('[PHONE]');
    expect(res.body.scrubbedText).not.toContain('john.smith@example.com');
  });

  test('400s when no file or text is provided', async () => {
    const res = await request(app).post('/api/scrub').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});

describe('POST /api/analyze', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('400s when scrubbedText is missing', async () => {
    const res = await request(app).post('/api/analyze').send({});
    expect(res.status).toBe(400);
  });

  test('returns a validated analysis on a well-formed model response', async () => {
    global.fetch = jest.fn().mockResolvedValue(validGroqResponse());

    const res = await request(app)
      .post('/api/analyze')
      .send({ scrubbedText: 'This is a short contract.', contractType: 'employment' });

    expect(res.status).toBe(200);
    expect(res.body.overall_risk).toBe('high');
    expect(res.body.issues).toHaveLength(1);
    expect(res.body.truncated).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('sets truncated: true when input exceeds the 8,000 character cap', async () => {
    global.fetch = jest.fn().mockResolvedValue(validGroqResponse());

    const longText = 'a'.repeat(9000);
    const res = await request(app)
      .post('/api/analyze')
      .send({ scrubbedText: longText });

    expect(res.status).toBe(200);
    expect(res.body.truncated).toBe(true);

    // the model should only ever see the capped text, not the full 9000 chars
    const sentBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    const userMessage = sentBody.messages.find(m => m.role === 'user').content;
    expect(userMessage.length).toBeLessThan(9000);
  });

  test('chunkContext appends a section note to the system prompt and suppresses truncated', async () => {
    global.fetch = jest.fn().mockResolvedValue(validGroqResponse());

    const res = await request(app)
      .post('/api/analyze')
      .send({ scrubbedText: 'a'.repeat(9000), chunkContext: { index: 2, total: 3 } });

    expect(res.status).toBe(200);
    expect(res.body.truncated).toBe(false);

    const sentBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    const systemMessage = sentBody.messages.find(m => m.role === 'system').content;
    expect(systemMessage).toContain('section 2 of 3');
    expect(systemMessage).toContain('missing_protections');
  });

  test('retries once on a malformed JSON response, then succeeds', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: 'not json' } }] }) })
      .mockResolvedValueOnce(validGroqResponse());

    const res = await request(app)
      .post('/api/analyze')
      .send({ scrubbedText: 'Some contract text.' });

    expect(res.status).toBe(200);
    expect(res.body.overall_risk).toBe('high');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('gives up after repeated malformed JSON responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'still not json' } }] }),
    });

    const res = await request(app)
      .post('/api/analyze')
      .send({ scrubbedText: 'Some contract text.' });

    expect(res.status).toBe(502);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('gives up after repeated schema-invalid responses (retryable) without retrying non-retryable errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify({ overall_risk: 'not-a-valid-enum' }) } }] }),
    });

    const res = await request(app)
      .post('/api/analyze')
      .send({ scrubbedText: 'Some contract text.' });

    expect(res.status).toBe(502);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('does not retry on a non-retryable error (e.g. upstream API error)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ error: { message: 'rate limit exceeded' } }),
    });

    const res = await request(app)
      .post('/api/analyze')
      .send({ scrubbedText: 'Some contract text.' });

    expect(res.status).toBe(500);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
