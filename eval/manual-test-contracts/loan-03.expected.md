# loan-03

**Category:** loan  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`loan-03.txt`](loan-03.txt)

## Expected findings (2)

### 🔴 hidden-balloon-payment (high)

> Monthly payments are calculated on a 96-month amortization schedule, but the loan matures at month 72, requiring a final balloon payment of approximately $9,800

Payments are structured to look like a normal 96-month loan, but the loan actually ends at month 72 — creating a ~$9,800 balloon payment a borrower budgeting off the monthly amount may not see coming.

### 🟡 force-placed-insurance (medium)

> Lender may unilaterally purchase "force-placed" insurance at a rate of Lender's choosing and add the cost to the loan principal

Lender can buy insurance on Borrower's behalf at a self-chosen rate — typically well above market — and simply tack the cost onto the loan, with no competitive-pricing protection for Borrower.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "loan-03"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
