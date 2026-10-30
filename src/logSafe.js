// Error summaries for server logs. Documents pass through this server, so a log line must never quote one.
// JSON parse errors (from the request body or from the model's reply) quote a snippet of the text they were
// parsing, and Express body-parser errors carry the whole raw body, so none of those messages or fields are logged.

/** One line describing an error, safe to log: error type, code and status, and the message only when it cannot quote text. */
function describeError(err) {
  if (!err) return 'unknown error';
  const parts = [err.name || 'Error'];
  if (err.type) parts.push(String(err.type));
  else if (err.code) parts.push(String(err.code));
  const status = err.status || err.statusCode;
  if (status) parts.push(`status ${status}`);

  if (err.name === 'ZodError' && Array.isArray(err.issues)) {
    // Issue paths and codes only: a message can include the offending value.
    parts.push(err.issues.map(issue => `${issue.path.join('.') || '(root)'}:${issue.code}`).join(', '));
  } else if (!(err instanceof SyntaxError) && err.body === undefined && err.message) {
    parts.push(String(err.message).slice(0, 200));
  }
  return parts.join(' ');
}

module.exports = { describeError };
