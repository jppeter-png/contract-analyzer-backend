# loan-02

**Category:** loan  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`loan-02.txt`](loan-02.txt)

## Expected findings (2)

### 🟡 cross-default (medium)

> Default under this Agreement automatically triggers default under any other agreement, loan, or lease Borrower has with Lender or any affiliate of Lender, even if Borrower is current on those other obligations

A default on this loan cascades into unrelated agreements with Lender's affiliates, even ones Borrower is current on — an aggressive cross-default provision that multiplies the consequences of a single missed payment.

### 🟡 unlimited-personal-guarantee (medium)

> regardless of ownership percentage, personally guarantee full repayment of this loan, including all fees, penalties, and Lender's collection costs and attorney's fees, without limitation

Every owner is personally on the hook regardless of how small their stake is, with no cap on fees/penalties/collection costs added to the guarantee — a minority owner could end up liable for the full amount plus open-ended costs.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "loan-02"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
