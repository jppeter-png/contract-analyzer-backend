const set = words => new Set(words.split(/\s+/).filter(Boolean));

// Capitalized words that routinely appear in contracts but are not part of a
// person's name. They are trimmed from the edges of a candidate name, so
// "Employee Handbook" leaves nothing and "Tenant Jane Doe" leaves "Jane Doe".
const LEGAL_STOP = set(`
  agreement contract lease party parties company corporation employee employer tenant landlord lessee lessor
  buyer seller client customer contractor subcontractor consultant licensor licensee owner borrower lender
  guarantor debtor creditor vendor supplier provider recipient discloser disclosing receiving
  section sections article articles clause clauses exhibit exhibits schedule schedules appendix annex addendum
  amendment amendments attachment recital recitals preamble whereas witnesseth
  effective date term terms condition conditions confidential confidentiality information
  service services payment payments property properties premises management termination governing law laws
  dispute disputes resolution arbitration mediation notice notices rent deposit security handbook policy policies
  benefits benefit compensation salary wages wage bonus commission equity vesting
  non competition compete solicitation intellectual work product products assignment indemnification indemnity
  liability limitation warranty warranties representation representations severability entire force majeure
  waiver jurisdiction venue state states united america county city court district federal general special
  additional initial final renewal extension period grace late fee fees interest rate loan note mortgage default
  defaults remedies insurance utilities maintenance repairs repair inspection entry access subletting pets pet
  parking smoking signature signatures witness witnesses
  responsibilities responsibility obligations obligation duties duty rights right requirements requirement
  application applications rental rentals residential commercial occupancy occupant occupants resident residents
  business personal professional independent contractor consulting employment engagement position title
  position positions department schedule hours overtime vacation leave sick holiday holidays
  statement statements report reports record records document documents form forms plan plans program programs
  project projects scope deliverable deliverables milestone milestones acceptance approval consent
  purpose use uses usage license licenses licensing royalty royalties ownership transfer transfers
  disclosure disclosures breach breaches cure damages costs cost expenses expense attorney attorneys fees
  governing binding mutual entire understanding counterparts electronic
  month months year years day days week weeks monthly annual annually quarterly weekly daily
  january february march april may june july august september october november december
  monday tuesday wednesday thursday friday saturday sunday
  the of and or for to in on at by with this that these those such any all each either neither as if then
  shall will may must not no yes hereby herein hereof hereto thereof thereto whereof therefore
  up down out off over under after before during within without between among upon
  dear sincerely regards sir madam page pages draft final copy
  inc llc llp ltd corp co plc
`);

// A phrase containing any of these is treated as an organization, not a person
// (unless an honorific makes it explicit).
const ORG_WORDS = set(`
  inc incorporated llc llp lp corp corporation company co ltd limited plc gmbh ag sa nv bv pty
  trust bank university college school association foundation partners partnership group holdings
  services solutions systems technologies properties management realty enterprises associates
  institute hospital clinic church department agency authority council committee board society fund
  capital ventures labs industries international global national insurance
  lending analytics software development financial finance credit mortgage consulting consultants media
  studio studios marketing logistics energy health healthcare medical pharma data digital networks network
  transport construction builders investments investment trading supply manufacturing savings union
  engineering research works brands retail wholesale advisors advisory mutual federal
`);

const PARTICLES = set('de van von der den da di del della la le bin ibn al el dos du');

// Org-ish defined terms: "Acme Widgets (the "Company")" is far more likely an
// organization than a person, so it earns less name evidence.
const ORGISH_DEFINED_TERMS = set(
  'company corporation firm vendor supplier provider agency organization partnership business employer'
);

const ROLE_CUES = [
  'tenant', 'landlord', 'lessee', 'lessor', 'subtenant', 'employee', 'employer', 'borrower', 'lender',
  'buyer', 'seller', 'client', 'customer', 'contractor', 'consultant', 'licensor', 'licensee', 'owner',
  'guarantor', 'cosigner', 'co-signer', 'co-borrower', 'debtor', 'creditor', 'applicant', 'patient',
  'member', 'insured', 'policyholder', 'resident', 'occupant', 'witness', 'signatory', 'spouse',
  'partner', 'agent', 'attorney', 'executor', 'trustee', 'beneficiary', 'mortgagor', 'mortgagee',
  'assignor', 'assignee', 'grantor', 'grantee', 'principal', 'recipient', 'contact',
];

const LABEL_CUES = [
  'name', 'print name', 'printed name', 'full name', 'legal name', 'signed', 'signature', 'by',
  'attn', 'attention', 'to', 'from', 'cc', 'witness', 'notary', 'resident', 'owner', 'tenant',
  'landlord', 'employee', 'employer', 'borrower', 'lender', 'buyer', 'seller',
];

const HONORIFICS = [
  'mr', 'mrs', 'ms', 'miss', 'mx', 'dr', 'prof', 'rev', 'hon', 'sir', 'madam', 'mme', 'mlle', 'herr', 'frau',
];

const GENERIC_EMAIL_LOCALS = set(`
  info admin support sales contact hello office billing legal team noreply no-reply hr careers jobs help
  service press media marketing accounts accounting finance payroll privacy security abuse postmaster
  webmaster mail email enquiries inquiries general reception orders
`);

const SIGNATURE_CONTEXT =
  /_{3,}|\bsignature\b|\bsigned\b|\bdate\s*:|^\s*by\s*:|\bprint(?:ed)?\b|\btitle\s*:|\bwitness\b|\b(?:tenant|landlord|employee|employer|lessee|lessor|borrower|lender|buyer|seller|client|contractor|owner|guarantor)\b/i;

module.exports = {
  LEGAL_STOP, ORG_WORDS, PARTICLES, ORGISH_DEFINED_TERMS, ROLE_CUES, LABEL_CUES,
  HONORIFICS, GENERIC_EMAIL_LOCALS, SIGNATURE_CONTEXT,
};
