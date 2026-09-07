module.exports = [
  {
    id: 'service-01',
    category: 'service',
    clean: false,
    text: `CONSULTING SERVICES AGREEMENT

Between Redwood Consulting ("Consultant") and Client.

Scope of Work: Consultant will provide "general business consulting services as reasonably requested by Client from time to time," with deliverables and timelines to be determined later at Client's discretion.

Liability: Consultant's total liability under this Agreement, including for gross negligence or willful misconduct, shall not exceed $100, regardless of the actual damages incurred by Client.

Indemnification: Consultant shall indemnify, defend, and hold harmless Client from any and all claims, losses, or damages arising from this engagement, including claims caused by Client's own negligence.

Payment: Client shall pay invoices within 60 days; however, Client may withhold payment indefinitely if it disputes any portion of an invoice, without limiting the disputed amount to the contested line items.`,
    trap_clauses: [
      {
        id: 'vague-scope-of-work',
        description: 'Scope of work is undefined — "general business consulting as reasonably requested" with deliverables TBD invites scope creep and payment disputes.',
        signal_terms: ['scope of work', 'scope', 'vague', 'undefined', 'deliverables', 'ambiguous'],
      },
      {
        id: 'liability-cap-too-low-plus-oneway-indemnity',
        description: 'Liability is capped at just $100 even for gross negligence, while Consultant must indemnify Client even for Client\'s own negligence — a severely one-sided risk allocation.',
        signal_terms: ['liability', 'indemnification', 'indemnify', 'cap', 'one-sided', 'negligence'],
      },
    ],
  },
  {
    id: 'service-02',
    category: 'service',
    clean: false,
    text: `SOFTWARE DEVELOPMENT AGREEMENT

Between Bluefin Digital ("Agency") and Client.

Intellectual Property: All work product, including any pre-existing tools, libraries, and frameworks owned by Agency and incorporated into the deliverables, shall become the sole property of Client upon payment, with no license retained by Agency even for its own reusable components.

Change Orders: Any changes to project scope requested by Client shall be performed by Agency at no additional cost, regardless of the scope or time required.

Termination for Convenience: Client may terminate this Agreement at any time for any reason with immediate effect. Agency may not terminate this Agreement under any circumstances prior to project completion.

Warranty: Agency warrants the software will be "generally functional" but disclaims all other warranties, including fitness for a particular purpose, for a period of 90 days.`,
    trap_clauses: [
      {
        id: 'ip-strips-agency-preexisting-tools',
        description: 'Client claims ownership of Agency\'s pre-existing tools and frameworks with no retained license — this would prevent Agency from reusing its own code on future projects.',
        signal_terms: ['intellectual property', 'ip', 'pre-existing', 'ownership', 'license', 'reuse'],
      },
      {
        id: 'unlimited-free-change-orders',
        description: 'Client can request unlimited scope changes at no additional cost — a scope-creep clause with no change-order pricing mechanism, and termination rights are entirely one-sided in Client\'s favor.',
        signal_terms: ['change order', 'scope creep', 'scope', 'termination', 'one-sided', 'unequal'],
      },
    ],
  },
  {
    id: 'service-03',
    category: 'service',
    clean: false,
    text: `MARKETING SERVICES AGREEMENT

Between Lumen Creative and Client.

Fees: Client will pay a monthly retainer of $6,000. Agency may increase the retainer at any time upon 7 days' notice, and Client's sole remedy for objecting to an increase is to terminate the agreement, forfeiting any prepaid fees for the current month.

Dispute Resolution: All disputes shall be resolved by binding arbitration administered by an arbitrator of Agency's choosing, with Client responsible for 100% of arbitration costs regardless of outcome.

Non-Solicitation: Client shall not hire, engage, or contract with any current or former Agency employee or contractor for 5 years after this Agreement ends, or pay Agency a fee equal to 50% of that person's first-year compensation.

Auto-Renewal: This Agreement renews automatically each year unless either party gives notice of non-renewal at least 180 days before the renewal date.`,
    trap_clauses: [
      {
        id: 'client-pays-all-arbitration-costs',
        description: 'Client must pay 100% of arbitration costs regardless of who wins, and the arbitrator is chosen solely by Agency — stacks the deck against Client in any dispute.',
        signal_terms: ['arbitration', 'arbitrator', 'costs', 'fees', 'one-sided', 'biased'],
      },
      {
        id: 'unilateral-fee-increase-forfeits-prepaid',
        description: 'Agency can raise fees on 7 days notice, and Client\'s only recourse is to terminate and forfeit prepaid fees — an unusually punitive fee-increase mechanism.',
        signal_terms: ['fee increase', 'retainer', 'notice', 'forfeit', 'prepaid', 'unilateral'],
      },
    ],
  },
];
