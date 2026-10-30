const util = require('util');
const request = require('supertest');
const { z } = require('zod');

process.env.GROQ_API_KEY = 'test-key';

const app = require('../index');
const { describeError } = require('../src/logSafe');

const SECRET = 'Maria Gonzalez lives at 12 Harbor Road and owes the sum of 4500';

describe('describeError', () => {
  test('keeps the type, code and status of a plain error', () => {
    const err = Object.assign(new Error('socket hang up'), { code: 'ECONNRESET', status: 502 });
    expect(describeError(err)).toBe('Error ECONNRESET status 502 socket hang up');
  });

  test('never includes the text a JSON parse error quotes', () => {
    let err;
    try { JSON.parse(`${SECRET} {`); } catch (e) { err = e; }
    expect(err.message).toContain('Maria');
    const line = describeError(err);
    expect(line).toBe('SyntaxError');
    expect(line).not.toContain('Maria');
  });

  test('logs schema issue paths and codes but not the offending values', () => {
    const result = z.object({ severity: z.enum(['high', 'low']) }).safeParse({ severity: SECRET });
    const line = describeError(result.error);
    expect(line).toBe('ZodError severity:invalid_value');
    expect(line).not.toContain('Maria');
  });

  test('drops the message of an error that carries a raw request body', () => {
    const err = Object.assign(new Error(`bad ${SECRET}`), { body: SECRET, type: 'entity.parse.failed', status: 400 });
    expect(describeError(err)).toBe('Error entity.parse.failed status 400');
  });

  test('truncates a very long message', () => {
    expect(describeError(new Error('x'.repeat(1000))).length).toBeLessThan(230);
  });
});

describe('server logs', () => {
  let spy;
  beforeEach(() => { spy = jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => spy.mockRestore());

  test('a malformed JSON request body is not written to the log', async () => {
    const res = await request(app).post('/api/scrub').set('Content-Type', 'application/json').send(`{"text": ${SECRET}}`);
    expect(res.status).toBe(500);
    // util.inspect is what console.error prints, including properties such as the raw request body.
    const logged = spy.mock.calls.flat().map(arg => util.inspect(arg, { depth: 5 })).join(' ');
    expect(logged).toContain('Unhandled error');
    expect(logged).not.toContain('Maria');
    expect(logged).not.toContain('Harbor');
  });
});
