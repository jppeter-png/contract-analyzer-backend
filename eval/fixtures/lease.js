module.exports = [
  {
    id: 'lease-01',
    category: 'lease',
    clean: false,
    text: `RESIDENTIAL LEASE AGREEMENT

Between Meridian Properties ("Landlord") and Tenant, for the unit at 442 Alder St, Apt 3B.

Rent: $2,100/month. Landlord may increase rent by any amount, with 5 days' written notice, at any time during the lease term.

Security Deposit: $2,100. Landlord may withhold any portion of the deposit for "general wear and cleaning" at Landlord's sole discretion, with no itemized list required.

Entry: Landlord may enter the unit at any time, for any reason, without prior notice to Tenant.

Renewal: This lease automatically renews for successive 12-month terms unless Tenant provides written notice of non-renewal at least 90 days before the term ends. Landlord is not required to send any reminder of the upcoming renewal deadline.`,
    trap_clauses: [
      {
        id: 'uncapped-rent-increase',
        description: 'Landlord can raise rent by any amount with only 5 days notice, mid-lease — no cap, and shorter notice than most jurisdictions require.',
        signal_terms: ['rent increase', 'escalation', 'notice', 'cap', 'uncapped', 'unlimited'],
      },
      {
        id: 'no-notice-entry',
        description: 'Landlord can enter the unit at any time without prior notice, violating standard tenant privacy/notice protections.',
        signal_terms: ['entry', 'notice', 'privacy', 'inspection', 'access'],
      },
    ],
  },
  {
    id: 'lease-02',
    category: 'lease',
    clean: false,
    text: `COMMERCIAL LEASE

Between Silverline Holdings and Tenant, for retail space at 88 Market Row.

Maintenance: Tenant is responsible for all repairs and maintenance to the premises, including structural repairs, roof, and HVAC systems, regardless of the cause of damage.

Early Termination: Tenant may not terminate this lease early under any circumstances, including if the premises become unusable due to fire, flood, or other casualty not caused by Tenant.

Subletting: Tenant may not sublet or assign any portion of the premises without Landlord's consent, which Landlord may withhold for any reason or no reason, without limitation.

Late Fees: Any rent payment received after the 1st of the month incurs a late fee of 10% of monthly rent per day until paid in full.`,
    trap_clauses: [
      {
        id: 'structural-repairs-shifted-to-tenant',
        description: 'Tenant bears responsibility for structural repairs, roof, and HVAC — normally landlord obligations — with no exception even when the landlord caused the damage.',
        signal_terms: ['maintenance', 'repair', 'structural', 'roof', 'hvac', 'landlord obligation', 'liability'],
      },
      {
        id: 'no-termination-casualty',
        description: 'Tenant cannot terminate even if the premises become unusable due to fire or flood — an unusually one-sided casualty clause with no habitability escape valve.',
        signal_terms: ['casualty', 'fire', 'flood', 'termination', 'unusable', 'habitability'],
      },
    ],
  },
  {
    id: 'lease-03',
    category: 'lease',
    clean: false,
    text: `RESIDENTIAL LEASE

Between Oak & Pine Rentals and Tenant, unit 12C.

Pet Policy: A pet deposit of $500 is non-refundable regardless of whether any pet damage occurs, and is charged even if Tenant never has a pet during the lease term but merely reserves the right to.

Utilities: Tenant is responsible for a "shared utilities" fee of $150/month, an estimate not tied to actual usage or itemized billing, subject to change by Landlord at any time without notice.

Deposit Return Timeline: Landlord shall return the security deposit "within a reasonable time" after move-out, with no specific deadline stated.

Automatic Renewal: This lease renews automatically for another full 12-month term unless Tenant gives 120 days' written notice — nearly a third of the full lease term.`,
    trap_clauses: [
      {
        id: 'nonrefundable-pet-deposit-unconditional',
        description: 'Pet deposit is non-refundable and charged even without an actual pet, and regardless of any damage — effectively a disguised fee, not a real deposit.',
        signal_terms: ['pet deposit', 'non-refundable', 'nonrefundable', 'deposit'],
      },
      {
        id: 'vague-deposit-return-timeline',
        description: 'No specific deadline for returning the security deposit — "reasonable time" is vague and unenforceable, and many jurisdictions require a specific statutory deadline.',
        signal_terms: ['deposit', 'return', 'timeline', 'deadline', 'reasonable time', 'vague'],
      },
    ],
  },
];
