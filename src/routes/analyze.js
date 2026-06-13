const express = require('express');
const router = express.Router();

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
      "recommendation": "specific action the signing party should take"
    }
  ],
  "missing_protections": [
    "standard protections that are notably absent"
  ]
}`;

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

/**
 * POST /api/analyze
 * Accepts { scrubbedText, contractType } and calls Groq for a risk analysis.
 * contractType: 'auto' | 'employment' | 'nda' | 'lease' | 'service' | 'loan' | 'tos'
 */
router.post('/', async (req, res) => {
  const { scrubbedText, contractType = 'auto' } = req.body;

  if (!scrubbedText?.trim()) {
    return res.status(400).json({ error: 'No scrubbed text provided' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not set in .env' });
  }

  const systemPrompt = PROMPTS[contractType] || PROMPTS.auto;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analyze this contract:\n\n${scrubbedText.slice(0, 8000)}`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return res.status(500).json({ error: 'Empty response from Groq' });

    const clean = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const analysis = JSON.parse(clean);

    res.json(analysis);
  } catch (err) {
    console.error('Analyze error:', err.message);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Failed to parse AI response — please try again' });
    }
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

module.exports = router;