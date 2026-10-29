// A fourth long contract for the digest test: terms are changed INLINE in section 1 (not just defined once),
// so a naive "first definition" digest is wrong for the section-2 clauses that depend on them.
const { build } = require('./longContracts');

const amend = {
  id: 'long-amend',
  contractType: 'service',
  text: build({
    title: 'SOFTWARE SUBSCRIPTION AGREEMENT',
    preamble: 'This Software Subscription Agreement is made between Northwind Analytics Inc. ("Provider") and the business named on the order form ("Customer") for the hosted software described there.',
    definitions: [
      '"Service" means the hosted analytics software described in the order form.',
      '"Fees" means the fixed monthly subscription amount stated in the order form.',
      '"Cause" means a material breach of this Agreement by Customer that Customer has not fixed within thirty (30) days after receiving written notice.',
      '"Business Day" means any day other than a Saturday, Sunday, or public holiday.',
    ],
    early: [
      { title: 'Subscription', text: 'Provider grants Customer a non-exclusive right to use the Service for its internal business during the subscription term, for the number of users stated in the order form.' },
      { title: 'Customer Responsibilities', text: 'Customer will keep its login credentials secure, will use the Service lawfully, and will tell Provider promptly about any unauthorized access it discovers.' },
      { title: 'Service Levels', text: 'Provider will make the Service available at least 99.5% of each month, excluding scheduled maintenance announced at least two (2) Business Days in advance.' },
      { title: 'Fee Schedule Updates', text: 'Provider may update its price list from time to time. For purposes of this Agreement, "Fees" also includes every additional charge, surcharge, or usage-based amount that Provider announces by posting it on its website, effective on the date of posting.' },
      { title: 'Termination Standards', text: 'For purposes of this Agreement, "Cause" means any act or omission of Customer that Provider considers, in its sole discretion, to be harmful to Provider, whether or not it breaches this Agreement.' },
      { title: 'Support', text: 'Provider will answer support requests on Business Days between 9:00 a.m. and 5:00 p.m. Eastern time and will aim to respond within one (1) Business Day.' },
    ],
    controlOne: { title: 'Auto-Renewal', text: 'This Agreement renews automatically for successive two (2) year terms. Customer may cancel only by written notice given between 90 and 120 days before the end of the then-current term.' },
    middle: [
      { title: 'Customer Data', text: 'Customer keeps all rights in the data it uploads. Provider will use that data only to provide the Service and will return or delete it on request after this Agreement ends.' },
      { title: 'Publicity', text: 'Provider may list Customer\'s name and logo as a customer on its website unless Customer asks Provider in writing to stop.' },
    ],
    dependent: [
      { id: 'fees-payment', clause: { title: 'Payment of Fees', text: 'Customer will pay all Fees within five (5) days after the invoice date. Provider may suspend the Service immediately for any overdue Fees and will charge interest of three percent (3%) per week on overdue amounts.' } },
      { id: 'termination-cause', clause: { title: 'Termination by Provider', text: 'Provider may terminate this Agreement immediately on written notice for Cause, and Customer will not be entitled to a refund of any prepaid Fees.' } },
    ],
    controlTwo: { title: 'Indemnity', text: 'Customer will indemnify Provider against every claim of any kind arising from the Service, including claims caused by Provider\'s own negligence or wilful misconduct.' },
    late: [
      { title: 'Limitation of Liability', text: 'Each party\'s total liability under this Agreement is limited to the Fees paid in the twelve (12) months before the claim, except for liability that cannot be limited by law.' },
      { title: 'Mutual Confidentiality', text: 'Each party will keep the other\'s non-public business information confidential, use it only for this Agreement, and protect it with the same care it uses for its own information.' },
      { title: 'Termination for Convenience', text: 'Either party may end this Agreement for any reason by giving ninety (90) days\' written notice, and Provider will return Customer\'s data on request.' },
    ],
    closing: 'Signed by the parties on the dates written on the order form.',
  }),
  // The first definition of "Fees" is benign; the inline change in section 1 is what makes the payment clause risky.
  trapsDependent: [
    { id: 'fees-payment', severity: 'high', excerpt: 'Customer will pay all Fees within five (5) days after the invoice date. Provider may suspend the Service immediately for any overdue Fees and will charge interest of three percent (3%) per week on overdue amounts', awareOf: ['additional charge', 'surcharge', 'usage-based', 'posting', 'website', 'announce', 'unilateral', 'open-ended', 'unspecified', 'any additional', 'price list', 'defin'] },
    { id: 'termination-cause', severity: 'high', excerpt: 'Provider may terminate this Agreement immediately on written notice for Cause, and Customer will not be entitled to a refund of any prepaid Fees', awareOf: ['sole discretion', 'considers', 'whether or not', 'harmful', 'any act', 'subjective', 'breach', 'defin', 'vague', 'broad'] },
  ],
  trapsControl: [
    { id: 'auto-renew', severity: 'high', excerpt: 'This Agreement renews automatically for successive two (2) year terms. Customer may cancel only by written notice given between 90 and 120 days before the end of the then-current term' },
    { id: 'one-sided-indemnity', severity: 'high', excerpt: 'Customer will indemnify Provider against every claim of any kind arising from the Service, including claims caused by Provider\'s own negligence or wilful misconduct' },
  ],
  presentProtections: [
    { name: 'limitation of liability', allOf: [['liabilit']], anyOf: ['limit', 'cap', 'ceiling'] },
    { name: 'mutual confidentiality', allOf: [['confidential']] },
    { name: 'termination for convenience', allOf: [['terminat']], anyOf: ['convenience', 'notice', 'without cause'] },
  ],
};

module.exports = { AMEND_CONTRACT: amend };
