module.exports = [
  {
    id: 'employment-01',
    category: 'employment',
    clean: false,
    text: `EMPLOYMENT AGREEMENT

This Employment Agreement is entered into between Northwind Software Inc. ("Company") and the Employee.

1. Position and Duties. Employee will serve as Senior Software Engineer, reporting to the VP of Engineering.

2. Compensation. Employee will receive an annual base salary of $145,000, paid bi-weekly, plus eligibility for an annual bonus at Company's sole discretion.

3. Non-Competition. During employment and for a period of 3 years following termination for any reason, Employee shall not, anywhere in the United States, directly or indirectly engage in, own, manage, operate, or be employed by any business that competes with the Company in any market the Company operates or plans to operate in.

4. Intellectual Property. Employee agrees that any invention, work of authorship, or idea conceived by Employee at any time during the term of employment, whether or not during working hours or using Company resources, and whether or not related to Company's business, shall be the sole and exclusive property of the Company.

5. Dispute Resolution. Any dispute arising out of or relating to this Agreement, including claims of discrimination or wrongful termination, shall be resolved exclusively through binding arbitration. Employee waives any right to a jury trial or to participate in a class or collective action.

6. At-Will Employment. Employment is at-will and may be terminated by either party at any time, with or without cause or notice.`,
    trap_clauses: [
      {
        id: 'noncompete-overbroad',
        description: 'Non-compete is nationwide, 3 years, and covers markets the company merely "plans to operate in" — far broader than necessary to protect a legitimate interest.',
        signal_terms: ['non-compete', 'noncompete', 'competition', 'geographic', 'nationwide', 'overbroad', 'broad', 'scope', 'unreasonable', 'excessive'],
      },
      {
        id: 'ip-assignment-personal-projects',
        description: 'IP assignment claims ownership of anything Employee creates at any time, even unrelated personal projects outside work hours and without company resources.',
        signal_terms: ['intellectual property', 'ip assignment', 'personal project', 'invention', 'work hours', 'company resources', 'unrelated'],
      },
    ],
  },
  {
    id: 'employment-02',
    category: 'employment',
    clean: false,
    text: `OFFER OF EMPLOYMENT

Harbor Logistics LLC is pleased to offer you the position of Operations Manager.

Compensation: $72,000/year, exempt from overtime pay under a general "management duties" classification, though the role involves substantial routine warehouse floor work.

Bonus Clawback: Any performance bonus paid to Employee is subject to full repayment if Employee resigns or is terminated for any reason within 24 months of the bonus payment date, regardless of the reason for departure.

Confidentiality: Employee agrees to hold confidential all information relating to the Company's business, including general industry knowledge and skills acquired during employment, and shall not disclose or use such information at any time, without geographic or temporal limitation.

Severance: None. Employment may be terminated by the Company at any time without notice or severance pay, for any reason or no reason.

Arbitration: All employment-related disputes must be submitted to binding arbitration administered by an arbitrator selected solely by the Company.`,
    trap_clauses: [
      {
        id: 'bonus-clawback-broad',
        description: 'Bonus clawback applies even if the employee resigns voluntarily or is terminated without cause, for a full 24 months — an unusually punitive clawback trigger.',
        signal_terms: ['clawback', 'bonus', 'repay', 'repayment', 'forfeit'],
      },
      {
        id: 'arbitrator-selected-by-company',
        description: 'The arbitration clause lets the Company unilaterally select the arbitrator, undermining neutrality.',
        signal_terms: ['arbitrator', 'arbitration', 'selected', 'unilateral', 'neutral', 'neutrality', 'biased'],
      },
    ],
  },
  {
    id: 'employment-03',
    category: 'employment',
    clean: false,
    text: `EMPLOYMENT CONTRACT

Between Bright Path Media and the Employee, for the role of Content Strategist.

Salary: $58,000 per year.

Termination: The Company may terminate this Agreement immediately, without notice or cause, and without payment of any accrued but unused vacation time, notwithstanding any state law requiring payout of accrued vacation upon termination.

Overtime: Employee is classified as exempt and will not receive overtime compensation regardless of hours actually worked or the nature of duties performed.

Non-Solicitation: For 5 years after termination, Employee shall not solicit, hire, or attempt to hire any person who was employed by the Company at any point during the preceding 10 years.

Equity: Employee is granted stock options vesting over 4 years with a 1-year cliff. Unvested options are forfeited immediately upon termination for any reason, including termination without cause.`,
    trap_clauses: [
      {
        id: 'vacation-payout-denial',
        description: 'Clause attempts to deny payout of accrued vacation upon termination, which is likely unenforceable in many states and a red flag for wage theft.',
        signal_terms: ['vacation', 'accrued', 'payout', 'wage', 'unenforceable', 'unpaid'],
      },
      {
        id: 'nonsolicit-excessive-duration',
        description: 'Non-solicitation clause covering 5 years post-termination and reaching back 10 years for former employees is far outside normal, enforceable ranges (usually 1-2 years).',
        signal_terms: ['non-solicit', 'solicitation', 'duration', 'years', 'excessive', 'unreasonable'],
      },
    ],
  },
];
