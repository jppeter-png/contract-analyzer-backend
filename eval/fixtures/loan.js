module.exports = [
  {
    id: 'loan-01',
    category: 'loan',
    clean: false,
    text: `PERSONAL LOAN AGREEMENT

Between Crestview Lending ("Lender") and Borrower. Principal: $25,000.

Interest Rate: Variable rate, currently 9.5% APR, which Lender may adjust at any time at its sole discretion, with no cap on the maximum rate and no requirement to give advance notice.

Prepayment: Borrower may prepay the loan in full or in part at any time; however, any prepayment is subject to a penalty equal to 4% of the prepaid amount, applicable for the full loan term.

Default: Borrower shall be in default if Borrower is more than 3 days late on any payment, misses any payment, or experiences any "adverse change in financial condition" as determined by Lender in its sole discretion.

Acceleration: Upon any default, the entire unpaid principal balance, plus all future interest, becomes immediately due and payable in full.`,
    trap_clauses: [
      {
        id: 'uncapped-variable-rate-no-notice',
        description: 'Interest rate is variable with no cap and can be changed by Lender at its sole discretion without advance notice — Borrower has no way to anticipate or plan for rate changes.',
        signal_terms: ['interest rate', 'variable', 'cap', 'notice', 'discretion', 'apr'],
      },
      {
        id: 'broad-default-trigger',
        description: 'Default is triggered by being just 3 days late or by a vaguely-defined "adverse change in financial condition" determined solely by Lender — an unusually broad and subjective default trigger.',
        signal_terms: ['default', 'trigger', 'broad', 'subjective', 'vague', 'discretion'],
      },
    ],
  },
  {
    id: 'loan-02',
    category: 'loan',
    clean: false,
    text: `SMALL BUSINESS LOAN AGREEMENT

Between Ironclad Capital and Borrower. Principal: $150,000.

Personal Guarantee: All owners of Borrower, regardless of ownership percentage, personally guarantee full repayment of this loan, including all fees, penalties, and Lender's collection costs and attorney's fees, without limitation.

Cross-Default: Default under this Agreement automatically triggers default under any other agreement, loan, or lease Borrower has with Lender or any affiliate of Lender, even if Borrower is current on those other obligations.

Collateral: Borrower grants Lender a security interest in "all assets now owned or hereafter acquired," including personal assets of guarantors, business equipment, inventory, and accounts receivable.

Grace Period: There is no grace period or cure period for any missed payment; default and acceleration are immediate and automatic.`,
    trap_clauses: [
      {
        id: 'cross-default-affiliate',
        description: 'A default on this loan automatically triggers default on unrelated agreements with Lender\'s affiliates, even if Borrower is current on those — an unusually aggressive cross-default provision.',
        signal_terms: ['cross-default', 'cross default', 'affiliate', 'trigger', 'default'],
      },
      {
        id: 'no-cure-period',
        description: 'No grace or cure period exists for a missed payment — default and full acceleration happen immediately and automatically, with no chance to fix a late payment.',
        signal_terms: ['grace period', 'cure period', 'cure', 'immediate', 'acceleration'],
      },
    ],
  },
  {
    id: 'loan-03',
    category: 'loan',
    clean: false,
    text: `AUTO LOAN AGREEMENT

Between Pacific Trust Finance and Borrower. Principal: $32,000, 72-month term.

Balloon Payment: Monthly payments are calculated on a 96-month amortization schedule, but the loan matures at month 72, requiring a final balloon payment of approximately $9,800.

Late Fees: Any payment more than 24 hours late incurs a late fee of $75, plus an additional $10 per day until paid, with no cap on total late fees that can accrue.

Insurance: Borrower must maintain comprehensive and collision insurance naming Lender as loss payee; if Borrower fails to do so, Lender may unilaterally purchase "force-placed" insurance at a rate of Lender's choosing and add the cost to the loan principal.

Refinancing: This loan may not be refinanced or paid off through a third-party lender for the first 36 months without Lender's written consent and a $1,500 consent fee.`,
    trap_clauses: [
      {
        id: 'hidden-balloon-payment',
        description: 'Payments are calculated on a 96-month amortization but the loan actually matures at month 72, creating a ~$9,800 balloon payment the borrower may not anticipate.',
        signal_terms: ['balloon payment', 'balloon', 'amortization', 'maturity', 'final payment'],
      },
      {
        id: 'force-placed-insurance-unilateral',
        description: 'Lender can unilaterally buy "force-placed" insurance at a rate of its own choosing and add the cost to the loan principal, with no competitive pricing protection for Borrower.',
        signal_terms: ['force-placed', 'force placed', 'insurance', 'unilateral', 'rate'],
      },
    ],
  },
];
