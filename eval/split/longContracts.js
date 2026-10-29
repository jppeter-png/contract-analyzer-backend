// Three long contracts (~16k characters, so the app splits each into two sections) built to test
// whole-vs-split reading. Each one has:
//  - "dependent" traps: an early definition makes a later, innocent-looking clause risky;
//  - one "control" trap that is risky on its own (no definition needed), in each half;
//  - "present" protections placed late, to catch false "missing protection" flags.
// Everything else is neutral boilerplate, so any other flag is a generic/false one.

const BOILERPLATE = [
  ['Notices', 'All notices under this Agreement must be in writing and delivered by hand, by registered mail, or by email to the address each party gives the other in writing. A notice is effective on receipt, or on the next business day if received after 5:00 p.m. local time. Either party may change its notice address by giving notice to the other.'],
  ['Governing Law', 'This Agreement is governed by the laws of the State of Delaware, without regard to its conflict-of-laws rules. The parties submit to the non-exclusive jurisdiction of the state and federal courts located in Wilmington, Delaware, for any proceeding arising from this Agreement.'],
  ['Entire Agreement', 'This Agreement, together with any schedules attached to it, is the entire agreement of the parties on its subject and replaces all earlier discussions and understandings about that subject. Neither party has relied on any statement not written in this Agreement.'],
  ['Severability', 'If a court decides that any provision of this Agreement cannot be enforced, that provision will be applied to the fullest extent permitted and the remaining provisions will stay in effect.'],
  ['Assignment', 'Neither party may assign this Agreement without the prior written consent of the other, which will not be unreasonably withheld. This Agreement binds and benefits the parties and their permitted successors and assigns.'],
  ['Waiver', 'A party\'s failure or delay in enforcing a right under this Agreement is not a waiver of that right. A waiver is effective only if it is in writing and signed by the waiving party.'],
  ['Headings and Interpretation', 'Headings are for convenience only and do not affect the meaning of this Agreement. The words "including" and "includes" mean "including without limitation". Singular words include the plural and the reverse.'],
  ['Force Majeure', 'Neither party is in breach for a delay caused by events outside its reasonable control, such as natural disaster, war, labor disputes affecting third parties, governmental order, or failure of public utilities, provided it gives prompt notice and resumes performance as soon as practicable.'],
  ['Amendment', 'This Agreement may be changed only by a written document signed by both parties. An email exchange does not amend this Agreement unless it states that it is intended to do so and both parties sign it electronically.'],
  ['Relationship of the Parties', 'The parties are independent contracting parties. Nothing in this Agreement creates a partnership, joint venture, or agency relationship, and neither party may bind the other.'],
  ['Counterparts and Signatures', 'This Agreement may be signed in counterparts, each of which is an original, and all of which together are one document. Electronic and scanned signatures have the same effect as original signatures.'],
  ['Further Assurances', 'Each party will sign the further documents and take the further actions that the other reasonably requests to give effect to this Agreement, at the requesting party\'s reasonable expense.'],
  ['Survival', 'Provisions of this Agreement that by their nature are meant to continue after it ends, including those about payment, confidentiality, and limits on liability, survive its expiration or termination.'],
  ['Costs of Preparation', 'Each party pays its own costs of preparing and negotiating this Agreement, including its legal and advisory fees.'],
  ['Language', 'This Agreement is written in English. If a translation is made for convenience, the English version controls.'],
];


// A second bank of neutral clauses, placed between the early definitions and the clauses that depend on them,
// so the two end up in different sections when the app splits the document.
const BOILERPLATE_2 = [
  ['Records', 'Each party will keep accurate records relating to its performance under this Agreement for at least three (3) years and will let the other party review those records during normal business hours on reasonable notice, no more than once in any twelve-month period.'],
  ['Compliance with Laws', 'Each party will comply with the laws that apply to its own performance of this Agreement, including laws on anti-corruption, sanctions, and export controls, and will hold the licenses and permits it needs to perform.'],
  ['Cooperation', 'The parties will cooperate in good faith and each will give the other the information, access, and assistance that are reasonably required for the other to perform its obligations on time.'],
  ['Authority', 'Each party confirms that it has the power to enter into this Agreement and that the person signing for it is authorized to do so. Entering into this Agreement does not breach any other agreement that binds that party.'],
  ['Dispute Escalation', 'Before starting a court proceeding, a party with a dispute will give the other a written description of it and the parties\' senior representatives will meet, in person or by video, within fifteen (15) days to try to resolve it. Either party may seek urgent court relief at any time.'],
  ['Business Continuity', 'Each party will maintain reasonable plans to continue its operations during an interruption, including offsite backups of important records, and will tell the other party promptly if an interruption is likely to affect performance.'],
  ['Marks and Names', 'Except as stated in this Agreement, neither party gets any right to use the other\'s trademarks, logos, or trade names, and any use that is permitted must follow the owner\'s reasonable written brand guidelines.'],
  ['Time Periods', 'If a period in this Agreement ends on a day that is not a Business Day, it is extended to the next Business Day. A reference to days means calendar days unless Business Days are stated.'],
  ['Conflicts Between Documents', 'If a schedule or order form conflicts with the main text of this Agreement, the main text controls, unless the schedule or order form expressly says that it is intended to override a specific provision.'],
  ['Third Parties', 'This Agreement is made for the benefit of the parties only. No other person has a right to enforce any of its terms, except a permitted successor or assign of a party.'],
  ['Currency and Taxes', 'Amounts under this Agreement are in United States dollars. Each party is responsible for the taxes on its own income, and any sales or value-added tax that applies to a payment is added to that payment and shown separately on the invoice.'],
  ['Electronic Communications', 'The parties agree that notices and documents may be exchanged by email or through a secure online portal, and that a record kept in electronic form is admissible as evidence to the same extent as a paper record.'],
];

const pad = (items, offset) => items.map(([title, text], i) => ({ title, text, order: offset + i }));

function build({ title, preamble, definitions, early, controlOne, middle, dependent, controlTwo, late, closing }) {
  const first = [...early, controlOne, ...middle];
  const filler1 = BOILERPLATE.map(([t, x]) => ({ title: t, text: x }));
  const filler2 = BOILERPLATE_2.map(([t, x]) => ({ title: t, text: x }));
  // First half: operative clauses with boilerplate spread between them. Then the second bank,
  // then the clauses that depend on the definitions, then the late protections.
  const merged = [];
  let f = 0;
  first.forEach((c, i) => {
    merged.push(c);
    if (f < filler1.length && i % 2 === 0) merged.push(filler1[f++]);
  });
  while (f < filler1.length) merged.push(filler1[f++]);
  merged.push(...filler2);
  merged.push(...dependent.map(d => d.clause), controlTwo, ...late);
  const defBlock = `1. Definitions.\n${definitions.map(d => `   ${d}`).join('\n')}`;
  const body = merged.map((c, i) => `${i + 2}. ${c.title}. ${c.text}`).join('\n\n');
  return `${title}\n\n${preamble}\n\n${defBlock}\n\n${body}\n\n${closing}`;
}

const lease = {
  id: 'long-lease',
  contractType: 'lease',
  text: build({
    title: 'RESIDENTIAL LEASE AGREEMENT',
    preamble: 'This Residential Lease Agreement is made between Harbor View Properties LLC ("Landlord") and the individual named on the signature page ("Tenant") for the apartment described below.',
    definitions: [
      '"Premises" means Unit 4B at 220 Quay Street and the storage locker assigned to it.',
      '"Rent" means the monthly amount of $1,850 stated in this Agreement.',
      '"Additional Rent" means all sums of any kind or amount that Landlord determines, in its sole discretion, are owed by Tenant, whether or not itemized or previously disclosed to Tenant.',
      '"Premises Damage" means any condition of the Premises at move-out that differs from its condition at move-in, including ordinary wear and tear.',
      '"Business Day" means any day other than a Saturday, Sunday, or public holiday.',
    ],
    early: [
      { title: 'Term', text: 'The lease term is twelve (12) months starting on the first day of the month after both parties sign. After the term ends, the tenancy continues month to month unless either party gives thirty (30) days\' written notice.' },
      { title: 'Rent', text: 'Tenant will pay Rent in advance on or before the first day of each month by bank transfer to the account Landlord designates. Rent for any partial month is prorated by the number of days.' },
      { title: 'Use of the Premises', text: 'Tenant will use the Premises only as a private residence for Tenant and the household members named on the signature page. Tenant will not run a business from the Premises that brings customers or employees to the building.' },
      { title: 'Utilities', text: 'Landlord pays for water and trash collection. Tenant pays for electricity, gas, internet, and any other utility that is separately metered to the Premises, and will keep those accounts in Tenant\'s name during the term.' },
      { title: 'Parking and Storage', text: 'One unreserved parking space in the shared lot is included with the Premises. Tenant may keep personal belongings in the assigned storage locker, but not flammable materials or perishable food.' },
      { title: 'Maintenance by Tenant', text: 'Tenant will keep the Premises clean, dispose of waste properly, replace light bulbs and smoke-detector batteries, and tell Landlord promptly about leaks, pests, or broken fixtures.' },
      { title: 'Pets', text: 'No pets are allowed without Landlord\'s written consent. Service animals and assistance animals are permitted as required by law and do not require a pet deposit.' },
    ],
    controlOne: { title: 'Landlord Access', text: 'Landlord and its agents may enter the Premises at any time, day or night, without notice and without Tenant\'s consent, for any reason that Landlord considers appropriate.' },
    middle: [
      { title: 'Alterations', text: 'Tenant will not paint, install fixtures, or make structural changes to the Premises without Landlord\'s written consent, except that Tenant may hang pictures using small nails or adhesive strips.' },
      { title: 'Insurance', text: 'Tenant is encouraged to carry renter\'s insurance covering Tenant\'s belongings and personal liability. Landlord\'s insurance does not cover Tenant\'s belongings.' },
      { title: 'Guests', text: 'Tenant may have guests, but a guest who stays more than fourteen (14) consecutive days must be approved in writing by Landlord and is not an occupant for the purposes of this Agreement.' },
      { title: 'Quiet Hours', text: 'Tenant will keep noise at a reasonable level and will observe the building\'s quiet hours, which run from 10:00 p.m. to 7:00 a.m., and will ensure household members and guests do the same.' },
    ],
    dependent: [
      { id: 'additional-rent',
        clause: { title: 'Additional Rent and Default', text: 'Tenant will pay all Additional Rent within three (3) days after Landlord\'s written demand. Failure to pay Additional Rent is a default entitling Landlord to terminate this Lease immediately and keep the entire security deposit.' },
        excerpt: 'Tenant will pay all Additional Rent within three (3) days after Landlord\'s written demand. Failure to pay Additional Rent is a default entitling Landlord to terminate this Lease immediately and keep the entire security deposit',
        severity: 'high', awareOf: ['sole discretion', 'any amount', 'any kind', 'undefined', 'open-ended', 'whatever landlord', 'not itemized', 'not previously disclosed', 'unspecified', 'unlimited', 'broad', 'defin'] },
      { id: 'premises-damage',
        clause: { title: 'Move-Out and Damage', text: 'At move-out Tenant will pay for all Premises Damage, and Landlord may deduct the cost from the security deposit before returning any balance.' },
        excerpt: 'At move-out Tenant will pay for all Premises Damage, and Landlord may deduct the cost from the security deposit before returning any balance',
        severity: 'medium', awareOf: ['wear and tear', 'ordinary', 'normal use', 'defin'] },
    ],
    controlTwo: { title: 'Rent Increases', text: 'Landlord may increase Rent by any amount at any time during the term by giving Tenant twenty-four (24) hours\' notice.' },
    late: [
      { title: 'Return of Security Deposit', text: 'Landlord will return the security deposit, less any lawful deductions, within thirty (30) days after Tenant returns possession of the Premises, together with an itemized statement of every deduction and receipts for repairs.' },
      { title: 'Quiet Enjoyment', text: 'So long as Tenant is not in default, Landlord will not interfere with Tenant\'s peaceful use and enjoyment of the Premises during the term.' },
      { title: 'Repairs by Landlord', text: 'Landlord will repair the roof, structure, plumbing, heating, and electrical systems of the Premises within a reasonable time after Tenant notifies Landlord of the problem, and will keep the common areas safe and clean.' },
    ],
    closing: 'Signed by the parties on the dates written on the signature page.',
  }),
  trapsDependent: [
    { id: 'additional-rent', severity: 'high', excerpt: 'Tenant will pay all Additional Rent within three (3) days after Landlord\'s written demand. Failure to pay Additional Rent is a default entitling Landlord to terminate this Lease immediately and keep the entire security deposit', awareOf: ['sole discretion', 'any amount', 'any kind', 'whatever', 'itemized', 'disclosed', 'unspecified', 'open-ended', 'unlimited', 'defin', 'broad'] },
    { id: 'premises-damage', severity: 'medium', excerpt: 'At move-out Tenant will pay for all Premises Damage, and Landlord may deduct the cost from the security deposit before returning any balance', awareOf: ['wear and tear', 'ordinary', 'normal', 'defin'] },
  ],
  trapsControl: [
    { id: 'entry-no-notice', severity: 'high', excerpt: 'Landlord and its agents may enter the Premises at any time, day or night, without notice and without Tenant\'s consent' },
    { id: 'rent-increase-24h', severity: 'high', excerpt: 'Landlord may increase Rent by any amount at any time during the term by giving Tenant twenty-four (24) hours\' notice' },
  ],
  presentProtections: [
    { name: 'deposit return with itemization', allOf: [['deposit']], anyOf: ['return', 'itemiz', 'refund'] },
    { name: 'quiet enjoyment', allOf: [['quiet', 'enjoyment', 'peaceful']] },
    { name: 'landlord repair duty', allOf: [['repair', 'maintenance']], anyOf: ['landlord'] },
  ],
};

const employment = {
  id: 'long-employment',
  contractType: 'employment',
  text: build({
    title: 'EXECUTIVE EMPLOYMENT AGREEMENT',
    preamble: 'This Employment Agreement is made between Redwood Analytics Corp. ("Company") and the individual named on the signature page ("Employee").',
    definitions: [
      '"Position" means Director of Data Platforms, reporting to the Chief Technology Officer.',
      '"Base Salary" means the annual salary of $190,000 stated in this Agreement.',
      '"Cause" means any act or omission that the Company, in its sole judgment, believes reflects poorly on the Company or on any of its officers, whether or not it relates to Employee\'s work.',
      '"Confidential Information" means all information of any kind known to Employee, whether or not related to the Company\'s business, including Employee\'s general skills, knowledge, and professional experience.',
      '"Business Day" means any day other than a Saturday, Sunday, or public holiday.',
    ],
    early: [
      { title: 'Position and Duties', text: 'Employee will serve in the Position and will devote full working time to the Company\'s business, following the reasonable directions of the Chief Technology Officer and the Company\'s written policies.' },
      { title: 'Base Salary', text: 'The Company will pay the Base Salary in equal installments on the Company\'s regular payroll dates, less lawful withholdings. The Company will review the Base Salary each January.' },
      { title: 'Annual Bonus', text: 'Employee is eligible for an annual target bonus of up to twenty percent (20%) of Base Salary, based on company and individual goals set at the start of each year and paid by March 15 of the following year.' },
      { title: 'Equity', text: 'Subject to board approval, Employee will receive an option to buy 40,000 shares of common stock, vesting over four years with a one-year cliff, on the terms of the Company\'s equity plan.' },
      { title: 'Benefits', text: 'Employee may take part in the group health, dental, vision, and retirement plans on the same terms as other senior employees. The Company may change its plans from time to time for all employees alike.' },
      { title: 'Paid Time Off', text: 'Employee accrues twenty-five (25) days of paid time off each year plus the Company\'s standard public holidays. Up to ten (10) unused days carry over to the following year.' },
      { title: 'Expenses', text: 'The Company will reimburse reasonable business expenses incurred in the performance of Employee\'s duties within thirty (30) days after Employee submits receipts under the Company\'s expense policy.' },
    ],
    controlOne: { title: 'Non-Competition', text: 'For five (5) years after employment ends for any reason, Employee will not work for or advise any business anywhere in the United States that develops software or data products, whether or not it competes with the Company.' },
    middle: [
      { title: 'Work Location', text: 'Employee will work primarily from the Company\'s Denver office and may work remotely up to two days each week, subject to the needs of the team.' },
      { title: 'Outside Activities', text: 'Employee may serve on one outside board or advisory committee that does not compete with the Company, after telling the Chief Technology Officer in writing.' },
      { title: 'Company Property', text: 'Employee will return the Company\'s laptops, badges, and documents when employment ends and will not keep copies of the Company\'s source code or customer lists.' },
      { title: 'Background Check', text: 'This offer depends on satisfactory completion of a standard background and reference check, which the Company will complete in the first thirty (30) days of employment.' },
    ],
    dependent: [
      { id: 'cause-forfeiture',
        clause: { title: 'Termination for Cause', text: 'If the Company ends Employee\'s employment for Cause, Employee forfeits all unpaid bonus, all earned commissions, and all vested and unvested equity, effective immediately.' },
      },
      { id: 'confidentiality-liquidated',
        clause: { title: 'Confidentiality', text: 'Employee will not use or disclose Confidential Information during or after employment for any purpose. Any breach entitles the Company to an injunction and to liquidated damages of $250,000.' },
      },
    ],
    controlTwo: { title: 'Arbitration', text: 'All claims arising from Employee\'s employment, including claims of discrimination or unpaid wages, must be decided by a single arbitrator chosen by the Company, and Employee waives the right to a jury trial and to join any class or collective action.' },
    late: [
      { title: 'Severance', text: 'If the Company ends Employee\'s employment without Cause, the Company will pay twelve (12) weeks of Base Salary as severance and continue health coverage for the same period, provided Employee signs a standard release of claims.' },
      { title: 'Notice of Termination', text: 'Except for Cause, the Company will give Employee at least sixty (60) days\' written notice of termination, or pay Base Salary in place of notice for any shortfall.' },
      { title: 'Indemnification', text: 'The Company will indemnify and hold Employee harmless against claims arising from acts done in good faith within the scope of Employee\'s duties, to the same extent as other officers of the Company.' },
    ],
    closing: 'Signed by the parties on the dates written on the signature page.',
  }),
  trapsDependent: [
    { id: 'cause-forfeiture', severity: 'high', excerpt: 'If the Company ends Employee\'s employment for Cause, Employee forfeits all unpaid bonus, all earned commissions, and all vested and unvested equity, effective immediately', awareOf: ['sole judgment', 'reflects poorly', 'whether or not', 'broad', 'subjective', 'discretion', 'any act', 'defin', 'vague'] },
    { id: 'confidentiality-liquidated', severity: 'high', excerpt: 'Employee will not use or disclose Confidential Information during or after employment for any purpose. Any breach entitles the Company to an injunction and to liquidated damages of $250,000', awareOf: ['general skills', 'all information', 'any kind', 'whether or not related', 'broad', 'defin', 'knowledge', 'experience'] },
  ],
  trapsControl: [
    { id: 'non-compete', severity: 'high', excerpt: 'For five (5) years after employment ends for any reason, Employee will not work for or advise any business anywhere in the United States that develops software or data products, whether or not it competes with the Company' },
    { id: 'arbitration', severity: 'high', excerpt: 'All claims arising from Employee\'s employment, including claims of discrimination or unpaid wages, must be decided by a single arbitrator chosen by the Company, and Employee waives the right to a jury trial and to join any class or collective action' },
  ],
  presentProtections: [
    { name: 'severance', allOf: [['severance']] },
    { name: 'notice of termination', allOf: [['notice']], anyOf: ['termination', 'terminat'] },
    { name: 'indemnification', allOf: [['indemnif', 'hold harmless']] },
  ],
};

const service = {
  id: 'long-service',
  contractType: 'service',
  text: build({
    title: 'MASTER SERVICES AGREEMENT',
    preamble: 'This Master Services Agreement is made between Beacon Digital Studio Ltd. ("Provider") and the business named on the order form ("Client") for the website and software services described there.',
    definitions: [
      '"Services" means the design, development, and hosting work described in the order form.',
      '"Base Fee" means the fixed monthly amount stated in the order form.',
      '"Fees" means the Base Fee plus any other charges that Provider may add from time to time by posting them on its website, which take effect on posting.',
      '"Deliverables" means the finished work product of the Services, excluding any work product Client has not paid for in full in cash, all Provider tools and materials, and any Client data embedded in them.',
      '"Business Day" means any day other than a Saturday, Sunday, or public holiday.',
    ],
    early: [
      { title: 'Services', text: 'Provider will perform the Services with reasonable skill and care, in line with the schedule in the order form, and will assign a project manager as Client\'s main contact.' },
      { title: 'Client Responsibilities', text: 'Client will provide the content, logins, and feedback Provider reasonably needs, and will respond to requests for approval within five (5) Business Days.' },
      { title: 'Change Requests', text: 'Either party may propose changes to the scope of the Services. A change takes effect only when both parties sign a written change order that states its effect on the schedule and the Base Fee.' },
      { title: 'Project Meetings', text: 'The parties will hold a status call every two weeks during active development, and Provider will send a short written summary of progress after each call.' },
      { title: 'Acceptance', text: 'Client has ten (10) Business Days after delivery of each milestone to test it and report defects in writing. Provider will correct reported defects within a reasonable time.' },
      { title: 'Hosting', text: 'Provider will host Client\'s website on infrastructure of a reputable cloud provider and will take daily backups that it keeps for thirty (30) days.' },
      { title: 'Subcontractors', text: 'Provider may use subcontractors for parts of the Services, remains responsible for their work, and will require them to follow confidentiality terms at least as protective as those in this Agreement.' },
    ],
    controlOne: { title: 'Term and Renewal', text: 'This Agreement renews automatically for successive three (3) year terms. Client may cancel only by written notice given between 180 and 210 days before the end of the then-current term; otherwise Client owes the Base Fee for the whole renewal term.' },
    middle: [
      { title: 'Client Data', text: 'Client keeps all rights in the content and data it provides. Provider will use that content only to perform the Services and will return or delete it on request after this Agreement ends.' },
      { title: 'Support', text: 'Provider will answer support requests on Business Days between 9:00 a.m. and 5:00 p.m. Eastern time and will aim to respond within one (1) Business Day.' },
      { title: 'Publicity', text: 'Provider may list Client\'s name and logo as a customer on its website unless Client asks Provider in writing to stop.' },
      { title: 'Data Protection', text: 'Each party will comply with the data protection laws that apply to it. Provider will keep personal data it handles for Client secure using reasonable technical and organizational measures.' },
    ],
    dependent: [
      { id: 'fees-payment',
        clause: { title: 'Payment of Fees', text: 'Client will pay all Fees within five (5) days after the invoice date. Provider may suspend the Services immediately for any overdue Fees and will charge interest of three percent (3%) per week on overdue amounts.' },
      },
      { id: 'deliverables-ownership',
        clause: { title: 'Ownership of Deliverables', text: 'Client owns the Deliverables on acceptance.' },
      },
    ],
    controlTwo: { title: 'Disclaimer and Indemnity', text: 'Client will indemnify Provider against every claim of any kind arising from the Services, including claims caused by Provider\'s own negligence or wilful misconduct.' },
    late: [
      { title: 'Limitation of Liability', text: 'Each party\'s total liability under this Agreement is limited to the Fees paid in the twelve (12) months before the claim, except for liability that cannot be limited by law.' },
      { title: 'Mutual Confidentiality', text: 'Each party will keep the other\'s non-public business information confidential, use it only for this Agreement, and protect it with the same care it uses for its own information.' },
      { title: 'Termination for Convenience', text: 'Either party may end this Agreement for any reason by giving ninety (90) days\' written notice, and Provider will deliver all completed work and transfer Client\'s domain names and data on request.' },
    ],
    closing: 'Signed by the parties on the dates written on the order form.',
  }),
  trapsDependent: [
    { id: 'fees-payment', severity: 'high', excerpt: 'Client will pay all Fees within five (5) days after the invoice date. Provider may suspend the Services immediately for any overdue Fees and will charge interest of three percent (3%) per week on overdue amounts', awareOf: ['add', 'posting', 'website', 'any other charges', 'from time to time', 'unilateral', 'undefined', 'defin', 'open-ended', 'unspecified'] },
    { id: 'deliverables-ownership', severity: 'high', excerpt: 'Client owns the Deliverables on acceptance', awareOf: ['excluding', 'not paid', 'paid in full', 'cash', 'tools', 'materials', 'embedded', 'defin', 'hollow', 'excludes'] },
  ],
  trapsControl: [
    { id: 'auto-renew', severity: 'high', excerpt: 'This Agreement renews automatically for successive three (3) year terms. Client may cancel only by written notice given between 180 and 210 days before the end of the then-current term' },
    { id: 'one-sided-indemnity', severity: 'high', excerpt: 'Client will indemnify Provider against every claim of any kind arising from the Services, including claims caused by Provider\'s own negligence or wilful misconduct' },
  ],
  presentProtections: [
    { name: 'limitation of liability', allOf: [['liabilit']], anyOf: ['limit', 'cap', 'ceiling'] },
    { name: 'mutual confidentiality', allOf: [['confidential']] },
    { name: 'termination for convenience', allOf: [['terminat']], anyOf: ['convenience', 'notice', 'without cause'] },
  ],
};

module.exports = { LONG_CONTRACTS: [lease, employment, service], build };
