const express = require('express');
const { z } = require('zod');
const { LANG_NAMES } = require('../pii/langs');
const router = express.Router();

const MAX_INPUT_CHARS = 8000;
const MAX_ATTEMPTS = 2;

// The AI provider limits tokens per minute. A short wait is absorbed here, so the user never notices;
// a long one is passed back as 429 + Retry-After and the app decides what to do.
const RATE_LIMIT_WAIT_CAP_MS = 20000;
const MAX_RATE_LIMIT_WAITS = 2;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/** How long the provider asks us to wait: its Retry-After header, else the "try again in 7.2s" in its message. */
function parseRetryAfterMs(response, message) {
  const header = Number(response.headers?.get?.('retry-after'));
  if (Number.isFinite(header) && header > 0) return Math.ceil(header * 1000);
  const m = String(message || '').match(/try again in\s+(?:(\d+)m(?!s))?\s*(?:([\d.]+)s)?\s*(?:([\d.]+)ms)?/i);
  if (!m || (!m[1] && !m[2] && !m[3])) return null;
  return Math.ceil((Number(m[1] || 0) * 60 + Number(m[2] || 0)) * 1000 + Number(m[3] || 0));
}

// Redaction numbers repeated kinds ([NAME 1], [NAME 2]); say what that means so the model keeps the parties apart.
const PLACEHOLDER_NOTE = `\n\nNote: personal details were replaced by placeholders such as [NAME 1], [NAME 2], [EMAIL] or [PHONE 1]. The same placeholder always stands for the same person or item and different numbers for different ones, so use them to tell the parties apart (for example "[NAME 1]" and "[NAME 2]" are two different people). Do not comment on the placeholders themselves or treat them as missing information.`;

const AnalysisSchema = z.object({
  overall_risk: z.enum(['high', 'medium', 'low']),
  category: z.string(),
  summary: z.string(),
  issues: z.array(z.object({
    severity: z.enum(['high', 'medium', 'low']),
    category: z.string(),
    title: z.string(),
    description: z.string(),
    recommendation: z.string(),
    type: z.enum(['unfair_clause', 'missing_protection']).optional(),
  })),
  missing_protections: z.array(z.string()),
});

const BASE_RULES = `Respond ONLY with valid JSON. No markdown, no code blocks, no preamble. Use exactly this structure:
{
  "overall_risk": "high|medium|low",
  "category": "detected contract category",
  "summary": "2-3 sentence plain-language overview of the contract and its main concerns",
  "issues": [
    {
      "severity": "high|medium|low",
      "category": "issue category",
      "title": "short descriptive title",
      "description": "clear explanation of why this is a risk",
      "recommendation": "specific action the signing party should take",
      "type": "unfair_clause|missing_protection"
    }
  ],
  "missing_protections": [
    "standard protections that are notably absent"
  ]
}

IMPORTANT — every issue's "type" must be exactly one of two things, and you must not blur them together:
- "unfair_clause": an actual clause IS present in the text and it disadvantages the signing party (e.g. an overly broad non-compete, a one-sided indemnification clause).
- "missing_protection": nothing adversarial is present — you're noting that a standard protection is simply absent (e.g. no severance clause, no cap on liability). This is not evidence the contract is unfair, just incomplete; do not let missing_protection issues alone push overall_risk above "medium", and never let them alone justify "high".
A contract with no unfair_clause issues and only missing_protection issues should generally read as "low" or "medium" overall_risk, not "high" — absence of boilerplate is normal, not alarming.

DEFINED TERMS: Contracts often hide risk in their definitions. Before judging the clauses, read the definitions and any clause that changes them. When a clause uses a defined term, read it with the definition substituted in. Look especially for definitions that (a) include things the term would not normally cover, (b) exclude or carve out part of what the clause seems to give, often on a condition like payment or approval, or (c) leave the amount, scope or trigger to one party's discretion. If a definition makes a clause riskier or emptier than it reads, flag the clause itself, not only the definition, and name the definition in the description.`;

const PROMPTS = {
  auto: `You are an expert legal contract analyst. First identify what type of contract this is, then analyze it thoroughly for risks, loopholes, unfair clauses, and missing protections relevant to that contract type. ${BASE_RULES}`,

  employment: `You are an expert employment law analyst. Analyze this employment contract focusing on:
- Non-compete and non-solicitation clauses (scope, duration, geography)
- At-will vs fixed-term employment and termination rights
- Severance, notice periods, and wrongful termination risks
- IP assignment — does the employer claim ownership of personal projects?
- Overtime, compensation, bonus clawbacks, and wage theft risks
- Arbitration clauses that waive the employee's right to sue
- Benefits, equity vesting, and cliffs
- Confidentiality scope — is it overly broad?
${BASE_RULES}`,

  nda: `You are an expert in confidentiality and trade secret law. Analyze this NDA focusing on:
- Scope of confidential information — is it defined too broadly?
- Duration — indefinite NDAs are often unenforceable
- One-sided vs mutual obligations
- Carve-outs for public information, independent development, and legal disclosure
- Remedies — injunctive relief, liquidated damages, attorney fees
- Non-solicitation and non-compete clauses hidden within the NDA
- Jurisdiction and governing law
- Return or destruction of confidential materials
${BASE_RULES}`,

  lease: `You are an expert in real estate and landlord-tenant law. Analyze this lease focusing on:
- Rent increases, escalation clauses, and hidden fees
- Security deposit terms — conditions for withholding, return timeline
- Early termination penalties and lease-breaking fees
- Maintenance and repair responsibilities — what is the tenant liable for?
- Subletting and assignment restrictions
- Entry and inspection rights — is notice required?
- Automatic renewal clauses and notice periods to vacate
- Habitability standards and landlord's obligations
- Pet policies, parking, and utility responsibilities
${BASE_RULES}`,

  service: `You are an expert in commercial contract law. Analyze this service agreement focusing on:
- Scope of work — is it vague enough to cause disputes?
- Payment terms, late fees, and collection rights
- Intellectual property ownership of deliverables
- Limitation of liability and indemnification clauses
- Termination for convenience vs termination for cause
- Change order and scope creep provisions
- Warranties and disclaimers
- Dispute resolution — arbitration, jurisdiction, governing law
- Auto-renewal and cancellation notice requirements
${BASE_RULES}`,

  loan: `You are an expert in finance and lending law. Analyze this loan or financial agreement focusing on:
- Interest rate — fixed vs variable, APR disclosure
- Hidden fees: origination, prepayment penalties, late fees
- Default triggers — are they overly broad?
- Acceleration clauses — can the full balance become due immediately?
- Collateral and security interest terms
- Cross-default provisions (default on one loan triggers another)
- Personal guarantee requirements
- Grace periods and cure rights
- Balloon payments and refinancing risks
${BASE_RULES}`,

  tos: `You are an expert in consumer protection and digital privacy law. Analyze this Terms of Service or Privacy Policy focusing on:
- Data collection — what is collected, how, and why
- Data sharing with third parties and advertisers
- Right to delete personal data (GDPR, CCPA compliance)
- Unilateral modification clauses — can they change terms without notice?
- Arbitration and class action waivers
- Auto-renewal and cancellation difficulty
- Content ownership — does the platform claim rights to user content?
- Account termination rights and appeal process
- Jurisdiction and governing law
${BASE_RULES}`,
};

// Optional: the language the user reads. Without it (older app builds) the prompt is
// unchanged. The contract itself may be in any language; only the explanation follows this.
function languageInstruction(code) {
  const name = LANG_NAMES[code];
  if (!name) return '';
  return `\n\nLANGUAGE: Write every human-readable string value in your JSON (category, summary, title, description, recommendation, and each entry of missing_protections) in ${name}. Keep the JSON keys, and the fixed values for "overall_risk", "severity" and "type", exactly as specified above, in English. The contract may be written in a different language than ${name}: analyze it in its original language and explain your findings in ${name}.`;
}

async function callGroq(systemPrompt, userContent) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      temperature: 0.2,
      max_tokens: 4096, // the model's reasoning shares this budget; 2048 cut long answers off mid-JSON
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  });

  const data = await response.json();
  if (data.error) {
    const err = new Error(data.error.message);
    err.retryAfterMs = parseRetryAfterMs(response, data.error.message);
    err.rateLimited = response.status === 429 || err.retryAfterMs !== null;
    throw err;
  }

  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty response from Groq');

  const clean = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  const parsed = JSON.parse(clean); // throws SyntaxError on malformed JSON
  return AnalysisSchema.parse(parsed); // throws ZodError on schema mismatch
}

/**
 * POST /api/analyze
 * Accepts { scrubbedText, contractType, chunkContext, outputLanguage } and calls Groq for a risk analysis.
 * contractType: 'auto' | 'employment' | 'nda' | 'lease' | 'service' | 'loan' | 'tos'
 * outputLanguage (optional): 'en' | 'es' | 'fr' | 'de' | 'pt' — the language of the written explanation.
 * chunkContext (optional): { index, total } — set by the client when a long contract has
 * been split into multiple sections. Tells the model not to flag clauses as "missing" just
 * because they're in a different section, and not to assume this section is the whole contract.
 */
router.post('/', async (req, res) => {
  const { scrubbedText, contractType = 'auto', chunkContext, outputLanguage } = req.body;

  if (!scrubbedText?.trim()) {
    return res.status(400).json({ error: 'No scrubbed text provided' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not set in .env' });
  }

  let systemPrompt = (PROMPTS[contractType] || PROMPTS.auto) + languageInstruction(outputLanguage);
  systemPrompt += PLACEHOLDER_NOTE;
  if (chunkContext?.total > 1) {
    systemPrompt += `\n\nNote: this is section ${chunkContext.index} of ${chunkContext.total} of a longer contract that has been split due to length. Analyze only the provided section. Do not assume it is the complete contract, and do not list something under "missing_protections" solely because it isn't in this section — it may appear elsewhere.`;
  }
  const truncated = !chunkContext && scrubbedText.length > MAX_INPUT_CHARS;
  const userContent = `Analyze this contract:\n\n${scrubbedText.slice(0, MAX_INPUT_CHARS)}`;

  let lastErr;
  let rateLimitWaits = 0;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const analysis = await callGroq(systemPrompt, userContent);
      return res.json({ ...analysis, truncated });
    } catch (err) {
      lastErr = err;
      console.error(`Analyze attempt ${attempt} failed:`, err.rateLimited ? 'rate limited' : err.message);

      if (err.rateLimited) {
        const waitMs = err.retryAfterMs ?? 15000;
        if (waitMs <= RATE_LIMIT_WAIT_CAP_MS && rateLimitWaits < MAX_RATE_LIMIT_WAITS) {
          rateLimitWaits += 1;
          await sleep(waitMs + 500);
          attempt -= 1; // waiting out a rate limit is not a failed attempt
          continue;
        }
        const retryAfter = Math.max(1, Math.ceil(waitMs / 1000));
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ error: 'The AI service is busy right now. Please try again in a minute.', retryAfter });
      }

      const retryable = err instanceof SyntaxError || err.name === 'ZodError';
      if (!retryable) break;
    }
  }

  if (lastErr instanceof SyntaxError || lastErr.name === 'ZodError') {
    return res.status(502).json({ error: 'AI returned an unexpected response — please try again' });
  }
  res.status(500).json({ error: lastErr.message || 'Analysis failed' });
});

// Exposed for reuse by the eval harness (eval/run.js) — the router itself
// remains a valid Express middleware function, these are just extra properties.
router.callGroq = callGroq;
router.languageInstruction = languageInstruction;
router.PROMPTS = PROMPTS;
router.PLACEHOLDER_NOTE = PLACEHOLDER_NOTE;
router.parseRetryAfterMs = parseRetryAfterMs;
router.MAX_INPUT_CHARS = MAX_INPUT_CHARS;

module.exports = router;