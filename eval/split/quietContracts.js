// Held-out contracts for the defined-terms prompt test. Every dependent trap is a QUIET definition: it reads as
// ordinary drafting, and only substituting it into the clause shows the problem. None of these ideas (notice by the
// sender's own records, landlord-controlled move-out date, "Material Breach" = any failure, refund net of costs,
// "Affiliate" by designation, "Net Revenue" less discretionary allowances) appears in the prompt's checklists.
const { build } = require('./longContracts');

const filler = {
  early: (a, b) => [
    { title: 'Parties and Purpose', text: `${a} and ${b} enter into this Agreement to set out the terms on which they will work together, as described in the order form or schedule attached to it.` },
    { title: 'Cooperation', text: 'Each party will cooperate reasonably with the other, respond to routine requests within a reasonable time, and name a contact person for day-to-day questions.' },
    { title: 'Records', text: 'Each party will keep accurate records relating to this Agreement for at least three (3) years and will make them available to the other on reasonable request during business hours.' },
    { title: 'Insurance', text: 'Each party will keep the insurance that is customary for its business and will provide a certificate of insurance when the other party asks for one.' },
  ],
  middle: [
    { title: 'Compliance', text: 'Each party will comply with the laws that apply to its own activities under this Agreement and will tell the other promptly if it receives a regulatory inquiry about them.' },
    { title: 'Contacts', text: 'Day-to-day contacts are named in the order form, and either party may change its contact by telling the other.' },
  ],
};

const license = {
  id: 'quiet-license',
  contractType: 'auto',
  text: build({
    title: 'PRODUCT LICENSE AND ROYALTY AGREEMENT',
    preamble: 'This Product License and Royalty Agreement is made between Brightline Brands Corp. ("Company") and the individual inventor named on the signature page ("Licensor") for the product design described in Schedule A.',
    definitions: [
      '"Product" means the consumer product made using the design described in Schedule A.',
      '"Net Revenue" means the gross receipts Company receives from sales of the Product, less returns, reasonable reserves, and the costs and allowances that Company considers appropriate.',
      '"Material Breach" means any failure by a party to perform an obligation under this Agreement.',
      '"Business Day" means any day other than a Saturday, Sunday, or public holiday.',
    ],
    early: filler.early('Brightline Brands Corp.', 'the Licensor'),
    controlOne: { title: 'Exclusivity', text: 'Licensor may not license, sell, or discuss the design with anyone else during the term or for ten (10) years after it ends, and Company may stop selling the Product at any time without liability to Licensor.' },
    middle: filler.middle,
    dependent: [
      { id: 'royalty-net-revenue', clause: { title: 'Royalty', text: 'Company will pay Licensor a royalty of ten percent (10%) of Net Revenue each quarter, with a statement of the calculation.' } },
      { id: 'termination-material-breach', clause: { title: 'Termination for Breach', text: 'Either party may terminate this Agreement immediately on written notice if the other party commits a Material Breach.' } },
    ],
    controlTwo: { title: 'Audit', text: 'Licensor may not audit Company\'s books or question any royalty statement, and every statement is final unless Licensor disputes it within five (5) days after receiving it.' },
    late: [
      { title: 'Warranty', text: 'Licensor states that the design is Licensor\'s own work and that Licensor knows of no claim that it infringes anyone else\'s rights.' },
      { title: 'Reversion', text: 'If Company stops selling the Product for twelve (12) consecutive months, the license ends and the design returns to Licensor.' },
    ],
    closing: 'Signed by the parties on the dates written on the signature page.',
  }),
  trapsDependent: [
    { id: 'royalty-net-revenue', severity: 'high', excerpt: 'Company will pay Licensor a royalty of ten percent (10%) of Net Revenue each quarter, with a statement of the calculation', term: 'net revenue', awareOf: ['considers appropriate', 'company considers', 'discretion', 'allowances', 'reserves', 'deduct', 'unspecified', 'open-ended', 'any cost'] },
    { id: 'termination-material-breach', severity: 'high', excerpt: 'Either party may terminate this Agreement immediately on written notice if the other party commits a Material Breach', term: 'material breach', awareOf: ['any failure', 'trivial', 'minor', 'no materiality', 'any obligation', 'not material', 'immaterial', 'regardless'] },
  ],
  trapsControl: [
    { id: 'exclusivity', severity: 'high', excerpt: 'Licensor may not license, sell, or discuss the design with anyone else during the term or for ten (10) years after it ends' },
    { id: 'audit-waiver', severity: 'high', excerpt: 'Licensor may not audit Company\'s books or question any royalty statement, and every statement is final unless Licensor disputes it within five (5) days' },
  ],
  presentProtections: [],
};

const subscription = {
  id: 'quiet-subscription',
  contractType: 'service',
  text: build({
    title: 'ONLINE SERVICE SUBSCRIPTION AGREEMENT',
    preamble: 'This Online Service Subscription Agreement is made between Clearpath Software LLC ("Provider") and the business named on the order form ("Customer") for the hosted service described there.',
    definitions: [
      '"Service" means the hosted software described in the order form.',
      '"Customer Data" means the files and records Customer uploads to the Service.',
      '"Affiliate" means any company that controls, is controlled by, or is under common control with Provider, and any other company that Provider designates in writing.',
      '"Refund" means the unused part of the Fees paid for the current month, less all amounts Provider has already spent or committed in connection with Customer\'s account.',
      '"Business Day" means any day other than a Saturday, Sunday, or public holiday.',
    ],
    early: filler.early('Clearpath Software LLC', 'the Customer'),
    controlOne: { title: 'Price Changes', text: 'Provider may raise the Fees at any time by any amount and without notice, and the new Fees apply to the current month.' },
    middle: filler.middle,
    dependent: [
      { id: 'cancel-refund', clause: { title: 'Cancellation', text: 'Customer may cancel at any time and will receive a full Refund, with no cancellation fee.' } },
      { id: 'data-affiliates', clause: { title: 'Use of Customer Data', text: 'Provider may share Customer Data with its Affiliates for any business purpose, and each Affiliate may use it on the same terms as Provider.' } },
    ],
    controlTwo: { title: 'Liability', text: 'Provider is not liable to Customer for any loss of any kind, including loss of Customer Data, even if caused by Provider\'s negligence.' },
    late: [
      { title: 'Support', text: 'Provider will answer support requests on Business Days between 9:00 a.m. and 5:00 p.m. Eastern time and will aim to respond within one (1) Business Day.' },
      { title: 'Data Export', text: 'During the subscription and for thirty (30) days after it ends, Customer may export its Customer Data in a standard format at no charge.' },
    ],
    closing: 'Signed by the parties on the dates written on the order form.',
  }),
  trapsDependent: [
    { id: 'cancel-refund', severity: 'high', excerpt: 'Customer may cancel at any time and will receive a full Refund, with no cancellation fee', term: 'refund', awareOf: ['less', 'already spent', 'committed', 'net of', 'deduct', 'not full', 'not a full', 'reduced', 'unused part', 'only the unused'] },
    { id: 'data-affiliates', severity: 'high', excerpt: 'Provider may share Customer Data with its Affiliates for any business purpose, and each Affiliate may use it on the same terms as Provider', term: 'affiliate', awareOf: ['designate', 'any other company', 'any company', 'unlimited', 'unrelated', 'third part', 'broad', 'open-ended'] },
  ],
  trapsControl: [
    { id: 'price-increase', severity: 'high', excerpt: 'Provider may raise the Fees at any time by any amount and without notice, and the new Fees apply to the current month' },
    { id: 'liability-waiver', severity: 'high', excerpt: 'Provider is not liable to Customer for any loss of any kind, including loss of Customer Data, even if caused by Provider\'s negligence' },
  ],
  presentProtections: [],
};

const lease2 = {
  id: 'quiet-lease',
  contractType: 'lease',
  text: build({
    title: 'RESIDENTIAL TENANCY AGREEMENT',
    preamble: 'This Residential Tenancy Agreement is made between Elm Court Holdings LLC ("Landlord") and the individual named on the signature page ("Tenant") for the apartment described below.',
    definitions: [
      '"Premises" means Apartment 12 at 48 Elm Court and the parking space assigned to it.',
      '"Rent" means the monthly amount of $1,600 stated in this Agreement.',
      '"Written Notice" means a notice delivered by the party sending it, by first-class mail, to the most recent address for the other party in the sender\'s own records.',
      '"Move-Out Date" means the date on which Tenant has returned all keys and Landlord has completed its inspection of the Premises.',
      '"Business Day" means any day other than a Saturday, Sunday, or public holiday.',
    ],
    early: filler.early('Elm Court Holdings LLC', 'the Tenant'),
    controlOne: { title: 'Entry', text: 'Landlord may enter the Premises at any time, with or without notice, and may let others in for any reason.' },
    middle: filler.middle,
    dependent: [
      { id: 'tenant-notice', clause: { title: 'Notice to Leave', text: 'Tenant must give Landlord Written Notice at least ninety (90) days before the end of the term if Tenant does not want the lease to renew; otherwise it renews for another twelve (12) months.' } },
      { id: 'rent-move-out', clause: { title: 'Rent Until Move-Out', text: 'Rent continues to be payable until the Move-Out Date, prorated daily.' } },
    ],
    controlTwo: { title: 'Late Fees', text: 'If Rent is not received by 9:00 a.m. on the first day of the month, Tenant owes a late fee of twenty percent (20%) of the Rent plus ten percent (10%) per week until paid.' },
    late: [
      { title: 'Repairs', text: 'Landlord will repair the roof, structure, plumbing, heating, and electrical systems within a reasonable time after Tenant reports the problem.' },
      { title: 'Deposit Return', text: 'Landlord will return the security deposit, less lawful deductions, within thirty (30) days after Tenant returns possession, with an itemized statement.' },
    ],
    closing: 'Signed by the parties on the dates written on the signature page.',
  }),
  trapsDependent: [
    { id: 'tenant-notice', severity: 'high', excerpt: 'Tenant must give Landlord Written Notice at least ninety (90) days before the end of the term if Tenant does not want the lease to renew', term: 'written notice', awareOf: ['sender', 'own records', 'landlord\'s records', 'first-class mail', 'mail', 'may never', 'never receive', 'proof', 'delivered', 'receipt', 'address'] },
    { id: 'rent-move-out', severity: 'high', excerpt: 'Rent continues to be payable until the Move-Out Date, prorated daily', term: 'move-out date', awareOf: ['inspection', 'completes', 'landlord controls', 'landlord-controlled', 'open-ended', 'indefinite', 'delay', 'no deadline', 'no time limit', 'completed its'] },
  ],
  trapsControl: [
    { id: 'entry', severity: 'high', excerpt: 'Landlord may enter the Premises at any time, with or without notice, and may let others in for any reason' },
    { id: 'late-fee', severity: 'high', excerpt: 'If Rent is not received by 9:00 a.m. on the first day of the month, Tenant owes a late fee of twenty percent (20%) of the Rent plus ten percent (10%) per week until paid' },
  ],
  presentProtections: [],
};

module.exports = { QUIET_CONTRACTS: [license, subscription, lease2] };
