// Contracts with no intentional trap clauses — used to measure the
// false-positive rate (does the analyzer invent risks in a fair contract?).
module.exports = [
  {
    id: 'clean-employment-01',
    category: 'employment',
    clean: true,
    text: `EMPLOYMENT AGREEMENT

Between Fairview Analytics and Employee, for the role of Data Analyst.

Compensation: $95,000 annual base salary, reviewed annually, plus an annual bonus target of 10% based on clearly defined performance metrics shared with Employee at the start of each year.

At-Will Employment: Employment is at-will. Either party may terminate with two weeks' written notice. Upon termination without cause, Employee will receive 2 weeks of severance pay per year of service, up to a maximum of 12 weeks.

Non-Compete: None. Employee may work for any employer, including competitors, after leaving the Company.

Confidentiality: Employee agrees to keep the Company's trade secrets and proprietary business information confidential for 2 years following termination, excluding information that is publicly available, independently developed, or required to be disclosed by law.

Intellectual Property: Inventions Employee creates within the scope of employment and using Company resources belong to the Company. Personal projects developed on Employee's own time and equipment, unrelated to Company business, remain Employee's property.

Dispute Resolution: Either party may pursue claims in court or through voluntary mediation; arbitration is optional, not mandatory, and either party may opt out within 30 days of signing.`,
  },
  {
    id: 'clean-nda-01',
    category: 'nda',
    clean: true,
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

Between Cobalt Systems and Counterparty, entered into to facilitate discussions about a potential partnership.

Confidential Information: Information disclosed by either party that is marked confidential or that would reasonably be understood to be confidential, excluding information that is or becomes public through no fault of the receiving party, was already known to the receiving party, or is independently developed.

Term: Confidentiality obligations last for 3 years from the date of disclosure.

Mutual Obligations: Both parties have equal and reciprocal confidentiality obligations.

Permitted Disclosure: Either party may disclose Confidential Information if required by law or court order, provided it gives the other party reasonable advance notice where legally permitted.

Return of Materials: Upon request or termination of discussions, each party will return or destroy the other's Confidential Information within 30 days, except for one archival copy retained solely for legal compliance purposes.`,
  },
  {
    id: 'clean-lease-01',
    category: 'lease',
    clean: true,
    text: `RESIDENTIAL LEASE AGREEMENT

Between Elmwood Properties and Tenant, unit 5A.

Rent: $1,850/month. Rent may only be increased upon lease renewal, with at least 60 days' written notice, and any increase will not exceed 5% or the maximum permitted by local law, whichever is lower.

Security Deposit: $1,850, refundable within 21 days of move-out, less an itemized list of any deductions for damage beyond normal wear and tear.

Entry: Landlord will provide at least 24 hours' written or verbal notice before entering the unit, except in genuine emergencies.

Maintenance: Landlord is responsible for structural repairs, plumbing, electrical, and HVAC systems. Tenant is responsible for routine upkeep and any damage caused by Tenant's negligence.

Renewal: This lease converts to month-to-month after the initial 12-month term unless either party gives 30 days' notice to terminate or a new fixed-term lease is signed.`,
  },
  {
    id: 'clean-service-01',
    category: 'service',
    clean: true,
    text: `CONSULTING SERVICES AGREEMENT

Between Bellwether Advisors and Client.

Scope of Work: Consultant will deliver a market analysis report and three strategy workshops, as detailed in Exhibit A, on the timeline set out in Exhibit B. Any changes to scope will be documented in a written change order specifying additional fees and timeline impact, subject to Client's approval.

Payment: Client will pay invoices within 30 days of receipt. Amounts not reasonably disputed in writing within 15 days are deemed accepted.

Liability: Each party's total liability is capped at the total fees paid under this Agreement in the preceding 12 months, except for claims arising from gross negligence, willful misconduct, or breach of confidentiality.

Indemnification: Each party will indemnify the other only for claims arising from its own negligence or breach of this Agreement.

Termination: Either party may terminate with 30 days' written notice. Client will pay for all work performed and reasonable costs incurred through the termination date.`,
  },
];
